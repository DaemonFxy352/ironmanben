"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { CheckInModal } from "@/components/CheckInModal";
import { PostUpdateModal } from "@/components/PostUpdateModal";
import { mapPoints } from "@/data/mapPoints";
import { raceDayHeroImage } from "@/data/visuals";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useRaceUpdates } from "@/hooks/useRaceUpdates";
import type { ReactNode } from "react";
import type { CheckIn, CheckInInput } from "@/types/checkIn";
import type { MapPoint } from "@/types/map";
import type { RaceUpdate } from "@/types/raceUpdate";
import type {
  LatLng,
  LeafletMouseEvent,
  Map as LeafletMap,
  MarkerClusterGroup,
} from "leaflet";

type ManualDraft = {
  name: string;
  note?: string;
};

type MarkerKind = "family" | "ben" | "parking" | "food" | "meetup";
type StaticMarkerKind = Exclude<MarkerKind, "family">;
type MapLayerState = Record<StaticMarkerKind, boolean>;
type DockPanel = "updates" | "map" | "meetup" | null;

type BenSighting = {
  update: RaceUpdate;
  point: MapPoint;
};

const jacksonvilleCenter = {
  lat: 30.321,
  lng: -81.672,
};

const defaultLayers: MapLayerState = {
  ben: true,
  meetup: true,
  parking: false,
  food: false,
};

const markerStyles: Record<MarkerKind, { label: string; color: string; glyph: string }> = {
  family: {
    label: "Family",
    color: "#2BB673",
    glyph: "F",
  },
  ben: {
    label: "Ben sighting",
    color: "#F28C38",
    glyph: "B",
  },
  parking: {
    label: "Parking",
    color: "#7286D3",
    glyph: "P",
  },
  food: {
    label: "Food",
    color: "#D6A93A",
    glyph: "E",
  },
  meetup: {
    label: "Meetup",
    color: "#2DA6B4",
    glyph: "M",
  },
};

const priorityStaticIds = new Set([
  "memorial-park-transition",
  "post-st-dock-swim-exit",
  "riverfront-plaza-finish",
  "metropolitan-park-swim-start",
  "riverside-arts-market",
  "five-points",
  "riverside-park",
  "willow-branch-park",
  "riverwalk-accessible-viewing",
]);

const locationMatches = [
  { pointId: "memorial-park-transition", terms: ["memorial", "transition", "t2"] },
  { pointId: "riverfront-plaza-finish", terms: ["finish", "riverfront", "plaza"] },
  { pointId: "metropolitan-park-swim-start", terms: ["metro", "metropolitan", "swim start"] },
  { pointId: "post-st-dock-swim-exit", terms: ["post", "dock", "swim exit"] },
  { pointId: "five-points", terms: ["five points", "5 points"] },
  { pointId: "riverside-arts-market", terms: ["arts market", "ram", "fuller warren"] },
  { pointId: "riverside-park", terms: ["riverside park"] },
  { pointId: "willow-branch-park", terms: ["willow"] },
  { pointId: "river-and-post", terms: ["river & post", "river and post"] },
  { pointId: "water-street-garage", terms: ["water street"] },
  { pointId: "yates-garage", terms: ["yates"] },
];

const trackerUrl = "https://www.ironman.com/app-tracking-information";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatType(type: RaceUpdate["type"]) {
  const labels: Record<RaceUpdate["type"], string> = {
    ben: "Saw Ben",
    parking: "Parking",
    food: "Food",
    meetup: "Meetup",
    help: "Need Help",
    general: "General",
  };

  return labels[type];
}

function staticMarkerKind(point: MapPoint): StaticMarkerKind {
  if (point.category === "parking") {
    return "parking";
  }

  if (point.category === "restaurants") {
    return "food";
  }

  if (
    point.category === "raceAnchors" ||
    point.category === "parks" ||
    point.category === "mobility"
  ) {
    return "meetup";
  }

  return "ben";
}

function shouldShowStaticPoint(point: MapPoint, kind: StaticMarkerKind, layers: MapLayerState) {
  if (!layers[kind]) {
    return false;
  }

  if (kind === "parking" || kind === "food") {
    return true;
  }

  return priorityStaticIds.has(point.id);
}

function markerIconHtml(kind: MarkerKind) {
  const style = markerStyles[kind];
  return `<span class="race-marker-dot" style="background: ${style.color}">${style.glyph}</span>`;
}

function staticPopupHtml(point: MapPoint, kind: StaticMarkerKind) {
  const style = markerStyles[kind];
  const mapsLink = point.googleMapsUrl
    ? `<a class="map-popup-link" href="${escapeHtml(point.googleMapsUrl)}" target="_blank" rel="noreferrer">Open maps</a>`
    : "";

  return `
    <div class="map-popup-card">
      <p class="map-popup-type" style="color: ${style.color}">${escapeHtml(style.label)}</p>
      <h3>${escapeHtml(point.name)}</h3>
      <p>${escapeHtml(point.description)}</p>
      ${mapsLink}
    </div>
  `;
}

function checkInPopupHtml(checkIn: CheckIn) {
  return `
    <div class="map-popup-card">
      <p class="map-popup-type" style="color: ${markerStyles.family.color}">Family check-in</p>
      <h3>${escapeHtml(checkIn.name)}</h3>
      ${checkIn.note ? `<p>${escapeHtml(checkIn.note)}</p>` : "<p>Checked in here.</p>"}
      <dl>
        <dt>Time</dt>
        <dd>${escapeHtml(formatTime(checkIn.createdAt))}${checkIn.optimistic ? " · sending" : ""}</dd>
        <dt>Source</dt>
        <dd>${checkIn.source === "gps" ? "GPS" : "Custom pin"}</dd>
      </dl>
    </div>
  `;
}

function benSightingPopupHtml(sighting: BenSighting) {
  return `
    <div class="map-popup-card">
      <p class="map-popup-type" style="color: ${markerStyles.ben.color}">Ben sighting</p>
      <h3>${escapeHtml(sighting.update.location || sighting.point.name)}</h3>
      <p>${escapeHtml(sighting.update.message)}</p>
      <dl>
        <dt>Posted by</dt>
        <dd>${escapeHtml(sighting.update.author)} · ${escapeHtml(formatTime(sighting.update.createdAt))}</dd>
      </dl>
    </div>
  `;
}

function matchPointForUpdate(update: RaceUpdate) {
  const text = `${update.location ?? ""} ${update.message}`.toLowerCase();
  const match = locationMatches.find((item) => item.terms.some((term) => text.includes(term)));

  if (!match) {
    return null;
  }

  return mapPoints.find((point) => point.id === match.pointId) ?? null;
}

function getBenStatus(latestBenUpdate: RaceUpdate | undefined) {
  if (!latestBenUpdate) {
    return {
      phase: "Race day",
      lastSeen: "Waiting for first sighting",
      next: "Memorial Park",
    };
  }

  const text = `${latestBenUpdate.location ?? ""} ${latestBenUpdate.message}`.toLowerCase();

  if (text.includes("finish") || text.includes("riverfront")) {
    return {
      phase: "Finish",
      lastSeen: latestBenUpdate.location || "Finish area",
      next: "Meetup at Riverfront Plaza",
    };
  }

  if (text.includes("bike") || text.includes("a1a") || text.includes("ponte")) {
    return {
      phase: "Bike",
      lastSeen: latestBenUpdate.location || "Bike course",
      next: "Riverside run loop",
    };
  }

  if (text.includes("swim")) {
    return {
      phase: "Swim",
      lastSeen: latestBenUpdate.location || "Swim course",
      next: "Memorial Park",
    };
  }

  return {
    phase: "Run",
    lastSeen: latestBenUpdate.location || latestBenUpdate.message,
    next: "Riverside / Five Points",
  };
}

function getBestSpot(latestBenUpdate: RaceUpdate | undefined) {
  const status = getBenStatus(latestBenUpdate);

  if (status.phase === "Finish") {
    return {
      title: "Riverfront Plaza",
      why: "Finish meetup",
      mapsUrl:
        mapPoints.find((point) => point.id === "riverfront-plaza-finish")?.googleMapsUrl ??
        "https://www.google.com/maps/search/?api=1&query=Riverfront%20Plaza%20Jacksonville%20FL",
    };
  }

  if (status.phase === "Race day" || status.phase === "Swim") {
    return {
      title: "Memorial Park",
      why: "Transition anchor",
      mapsUrl:
        mapPoints.find((point) => point.id === "memorial-park-transition")?.googleMapsUrl ??
        "https://www.google.com/maps/search/?api=1&query=Memorial%20Park%20Jacksonville%20FL",
    };
  }

  return {
    title: "Riverside / Five Points",
    why: "Repeat run sightings",
    mapsUrl:
      mapPoints.find((point) => point.id === "five-points")?.googleMapsUrl ??
      "https://www.google.com/maps/search/?api=1&query=Five%20Points%20Jacksonville%20FL",
  };
}

function recentCheckIns(checkIns: CheckIn[]) {
  const sixHours = 6 * 60 * 60 * 1000;
  const recent = checkIns.filter(
    (checkIn) => Date.now() - new Date(checkIn.createdAt).getTime() <= sixHours,
  );

  return recent.length > 0 ? recent : checkIns;
}

function RaceMap({
  benSightings,
  checkIns,
  isPickingManual,
  layers,
  onManualPick,
}: {
  benSightings: BenSighting[];
  checkIns: CheckIn[];
  isPickingManual: boolean;
  layers: MapLayerState;
  onManualPick: (latLng: LatLng) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const clusterRef = useRef<MarkerClusterGroup | null>(null);
  const hasFitInitialBoundsRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function drawMap() {
      const L = await import("leaflet");
      await import("leaflet.markercluster");

      if (cancelled || !mapElementRef.current) {
        return;
      }

      if (!mapRef.current) {
        mapRef.current = L.map(mapElementRef.current, {
          center: [jacksonvilleCenter.lat, jacksonvilleCenter.lng],
          zoom: 13,
          scrollWheelZoom: false,
          zoomControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(mapRef.current);

        clusterRef.current = L.markerClusterGroup({
          maxClusterRadius: 42,
          showCoverageOnHover: false,
          spiderfyOnMaxZoom: true,
        });
        clusterRef.current.addTo(mapRef.current);
      }

      clusterRef.current?.clearLayers();
      const bounds = L.latLngBounds([]);

      mapPoints.forEach((point) => {
        const kind = staticMarkerKind(point);

        if (!shouldShowStaticPoint(point, kind, layers)) {
          return;
        }

        const marker = L.marker([point.coordinates.lat, point.coordinates.lng], {
          icon: L.divIcon({
            className: `race-marker race-marker-${kind}`,
            html: markerIconHtml(kind),
            iconSize: [38, 38],
            iconAnchor: [19, 19],
            popupAnchor: [0, -20],
          }),
          title: point.name,
        }).bindPopup(staticPopupHtml(point, kind), {
          className: "spectator-popup",
          maxWidth: 300,
          minWidth: 240,
        });

        clusterRef.current?.addLayer(marker);
        bounds.extend(marker.getLatLng());
      });

      if (layers.ben) {
        benSightings.forEach((sighting) => {
          const marker = L.marker([sighting.point.coordinates.lat, sighting.point.coordinates.lng], {
            icon: L.divIcon({
              className: "race-marker race-marker-ben-sighting",
              html: markerIconHtml("ben"),
              iconSize: [44, 44],
              iconAnchor: [22, 22],
              popupAnchor: [0, -22],
            }),
            title: sighting.update.location || sighting.point.name,
          }).bindPopup(benSightingPopupHtml(sighting), {
            className: "spectator-popup",
            maxWidth: 300,
            minWidth: 240,
          });

          clusterRef.current?.addLayer(marker);
          bounds.extend(marker.getLatLng());
        });
      }

      checkIns.forEach((checkIn) => {
        const marker = L.marker([checkIn.lat, checkIn.lng], {
          icon: L.divIcon({
            className: "race-marker race-marker-family",
            html: markerIconHtml("family"),
            iconSize: [46, 46],
            iconAnchor: [23, 23],
            popupAnchor: [0, -23],
          }),
          title: checkIn.name,
        }).bindPopup(checkInPopupHtml(checkIn), {
          className: "spectator-popup",
          maxWidth: 300,
          minWidth: 240,
        });

        clusterRef.current?.addLayer(marker);
        bounds.extend(marker.getLatLng());
      });

      if (bounds.isValid() && !hasFitInitialBoundsRef.current) {
        mapRef.current.fitBounds(bounds, {
          maxZoom: 14,
          padding: [34, 34],
        });
        hasFitInitialBoundsRef.current = true;
      }

      window.setTimeout(() => mapRef.current?.invalidateSize(), 0);
    }

    drawMap();

    return () => {
      cancelled = true;
    };
  }, [benSightings, checkIns, layers]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !isPickingManual) {
      return;
    }

    const handler = (event: LeafletMouseEvent) => onManualPick(event.latlng);
    map.on("click", handler);

    return () => {
      map.off("click", handler);
    };
  }, [isPickingManual, onManualPick]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      clusterRef.current = null;
      hasFitInitialBoundsRef.current = false;
    };
  }, []);

  return (
    <div
      ref={mapElementRef}
      aria-label="Realtime IRONMAN Jacksonville family coordination map"
      className={`h-full min-h-dvh w-full ${isPickingManual ? "cursor-crosshair" : ""}`}
      role="application"
    />
  );
}

function GlassCard({
  action,
  detail,
  label,
  title,
}: {
  action?: ReactNode;
  detail: string;
  label: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-ink/[0.65] p-3 text-white shadow-2xl backdrop-blur-lg sm:p-4">
      <p className="text-[0.68rem] font-black uppercase text-white/50">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-black leading-tight sm:text-xl">{title}</h2>
          <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-white/70">{detail}</p>
        </div>
        {action}
      </div>
    </section>
  );
}

function UpdateFeed({ updates }: { updates: RaceUpdate[] }) {
  if (updates.length === 0) {
    return (
      <p className="rounded-md bg-white/10 p-3 text-sm font-bold leading-6 text-white/70">
        No updates yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {updates.slice(0, 6).map((update) => (
        <article key={update.id} className="rounded-md bg-white/10 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-black text-white">
              {formatType(update.type)} · {update.author}
            </p>
            <p className="shrink-0 text-xs font-bold uppercase text-white/50">
              {formatTime(update.createdAt)}
            </p>
          </div>
          <p className="mt-1 text-sm leading-6 text-white/80">{update.message}</p>
          {update.location || update.optimistic ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {update.location ? (
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold text-white/80">
                  {update.location}
                </span>
              ) : null}
              {update.optimistic ? (
                <span className="rounded-full bg-river/30 px-2.5 py-1 text-xs font-bold text-white">
                  sending
                </span>
              ) : null}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function RaceDayApp() {
  const {
    checkIns,
    createCheckIn,
    error: checkInError,
    isConfigured: checkInsConfigured,
    isLoading: checkInsLoading,
  } = useCheckIns();
  const {
    error: updatesError,
    isConfigured: updatesConfigured,
    isLoading: updatesLoading,
    postUpdate,
    updates,
  } = useRaceUpdates();
  const [activeDockPanel, setActiveDockPanel] = useState<DockPanel>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [layers, setLayers] = useState<MapLayerState>(defaultLayers);
  const [manualDraft, setManualDraft] = useState<ManualDraft | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const isConfigured = checkInsConfigured && updatesConfigured;
  const isLoading = checkInsLoading || updatesLoading;
  const latestError = checkInError || updatesError;
  const latestUpdate = updates[0];
  const latestBenUpdate = updates.find((update) => update.type === "ben");
  const benStatus = getBenStatus(latestBenUpdate);
  const bestSpot = getBestSpot(latestBenUpdate);
  const activeFamily = recentCheckIns(checkIns);
  const activeFamilyNames = activeFamily
    .slice(0, 3)
    .map((checkIn) => checkIn.name)
    .join(", ");
  const benSightings = useMemo(
    () =>
      updates
        .filter((update) => update.type === "ben")
        .map((update) => {
          const point = matchPointForUpdate(update);
          return point ? { update, point } : null;
        })
        .filter((sighting): sighting is BenSighting => Boolean(sighting))
        .slice(0, 12),
    [updates],
  );

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleCreateCheckIn = useCallback(
    async (input: CheckInInput) => {
      await createCheckIn(input);
      setToast("Checked in.");
    },
    [createCheckIn],
  );

  const handleManualPick = useCallback(
    async (latLng: LatLng) => {
      if (!manualDraft) {
        return;
      }

      try {
        await createCheckIn({
          name: manualDraft.name,
          note: manualDraft.note,
          lat: latLng.lat,
          lng: latLng.lng,
          source: "manual",
        });
        setManualDraft(null);
        setToast("Custom check-in shared.");
      } catch (error) {
        setToast(error instanceof Error ? error.message : "Check-in failed.");
      }
    },
    [createCheckIn, manualDraft],
  );

  const togglePanel = (panel: Exclude<DockPanel, null>) => {
    setActiveDockPanel((current) => (current === panel ? null : panel));
  };

  const panelContent = (() => {
    if (activeDockPanel === "updates") {
      return (
        <section className="rounded-lg border border-white/10 bg-ink/[0.72] p-3 text-white shadow-2xl backdrop-blur-lg sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Updates</h2>
            <button
              className="focus-ring rounded-md bg-surge px-4 py-3 text-sm font-black text-white"
              type="button"
              onClick={() => setIsPostOpen(true)}
            >
              Post
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto pr-1">
            <UpdateFeed updates={updates} />
          </div>
        </section>
      );
    }

    if (activeDockPanel === "map") {
      return (
        <section className="rounded-lg border border-white/10 bg-ink/[0.72] p-3 text-white shadow-2xl backdrop-blur-lg sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Map</h2>
            <p className="text-xs font-bold uppercase text-white/45">Family always on</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(layers) as StaticMarkerKind[]).map((kind) => (
              <button
                key={kind}
                className={`focus-ring min-h-14 rounded-md border px-3 py-3 text-left text-sm font-black ${
                  layers[kind]
                    ? "border-white/20 bg-white text-ink"
                    : "border-white/15 bg-white/10 text-white"
                }`}
                type="button"
                onClick={() =>
                  setLayers((current) => ({
                    ...current,
                    [kind]: !current[kind],
                  }))
                }
              >
                {markerStyles[kind].label}
              </button>
            ))}
          </div>
        </section>
      );
    }

    if (activeDockPanel === "meetup") {
      return (
        <section className="rounded-lg border border-white/10 bg-ink/[0.72] p-3 text-white shadow-2xl backdrop-blur-lg sm:p-4">
          <p className="text-xs font-black uppercase text-white/50">Meetup</p>
          <h2 className="mt-1 text-2xl font-black">{bestSpot.title}</h2>
          <p className="mt-1 text-sm font-bold text-white/70">{bestSpot.why}</p>
          <a
            className="focus-ring mt-4 inline-flex min-h-12 items-center rounded-md bg-white px-4 py-3 text-sm font-black text-ink"
            href={bestSpot.mapsUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open maps
          </a>
        </section>
      );
    }

    return null;
  })();

  return (
    <main className="relative min-h-dvh overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 z-0">
        <Image
          aria-hidden="true"
          alt=""
          className="race-hero-image object-cover object-center"
          fill
          priority
          sizes="100vw"
          src={raceDayHeroImage.src}
        />
        <div className="absolute inset-0 bg-ink/20" />
      </div>

      <div className="race-map-layer absolute inset-0 z-10">
        <RaceMap
          benSightings={benSightings}
          checkIns={checkIns}
          isPickingManual={Boolean(manualDraft)}
          layers={layers}
          onManualPick={handleManualPick}
        />
      </div>
      <div className="race-day-scrim pointer-events-none absolute inset-0 z-20" />

      <div className="pointer-events-none relative z-[1000] flex min-h-dvh flex-col justify-between p-3 pb-[6.75rem] sm:p-5 sm:pb-[7rem]">
        <div className="pointer-events-auto max-w-5xl space-y-2">
          <section className="max-w-xl rounded-lg border border-white/10 bg-ink/[0.70] p-4 text-white shadow-2xl backdrop-blur-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase text-surge">IRONMAN Jacksonville</p>
                <h1 className="mt-1 text-3xl font-black leading-none sm:text-4xl">Ben Race HQ</h1>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-black uppercase ${
                  isConfigured ? "bg-split text-white" : "bg-surge text-white"
                }`}
              >
                {isConfigured ? "Live" : "Setup"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-[6.5rem_1fr] gap-3">
              <div className="rounded-md bg-white/10 p-3">
                <p className="text-xs font-black uppercase text-white/50">Phase</p>
                <p className="mt-1 text-2xl font-black">{benStatus.phase}</p>
              </div>
              <div className="rounded-md bg-white/10 p-3">
                <p className="text-xs font-black uppercase text-white/50">Last seen</p>
                <p className="mt-1 line-clamp-2 text-base font-black leading-5">
                  {benStatus.lastSeen}
                </p>
                <p className="mt-2 text-xs font-bold uppercase text-white/50">
                  Next: {benStatus.next}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                className="focus-ring min-h-12 rounded-md bg-river px-4 py-3 text-sm font-black text-white"
                type="button"
                onClick={() => setIsCheckInOpen(true)}
              >
                Check In Here
              </button>
              <button
                className="focus-ring min-h-12 rounded-md border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white"
                type="button"
                onClick={() => setIsPostOpen(true)}
              >
                Saw Ben
              </button>
            </div>

            {!isConfigured ? (
              <p className="mt-3 rounded-md bg-surge/25 p-3 text-sm font-bold leading-6 text-white">
                Add Supabase env vars for live mode.
              </p>
            ) : null}
            {latestError ? (
              <p className="mt-3 rounded-md bg-surge/25 p-3 text-sm font-bold leading-6 text-white">
                {latestError}
              </p>
            ) : null}
          </section>

          <div className="grid max-w-5xl gap-2 sm:grid-cols-3">
            <GlassCard
              label="Best spot now"
              title={bestSpot.title}
              detail={bestSpot.why}
              action={
                <a
                  className="focus-ring shrink-0 rounded-md bg-white px-3 py-2 text-xs font-black text-ink"
                  href={bestSpot.mapsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Maps
                </a>
              }
            />
            <GlassCard
              label="Family active"
              title={`${activeFamily.length} checked in`}
              detail={activeFamilyNames || "Check in so everyone can find you"}
            />
            <GlassCard
              label="Latest update"
              title={latestUpdate ? formatType(latestUpdate.type) : "No updates"}
              detail={
                latestUpdate
                  ? `${latestUpdate.message} · ${formatTime(latestUpdate.createdAt)}`
                  : isLoading
                    ? "Syncing"
                    : "Post the first sighting"
              }
            />
          </div>
        </div>

        <div className="pointer-events-auto mx-auto w-full max-w-xl space-y-3">
          {manualDraft ? (
            <div className="rounded-lg border border-surge/40 bg-ink/[0.75] p-4 text-center shadow-2xl backdrop-blur-lg">
              <p className="text-lg font-black">Tap the map</p>
              <p className="mt-1 text-sm font-bold text-white/70">Custom pin for {manualDraft.name}</p>
              <button
                className="focus-ring mt-3 rounded-md border border-white/20 px-4 py-2 text-sm font-black"
                type="button"
                onClick={() => setManualDraft(null)}
              >
                Cancel
              </button>
            </div>
          ) : null}

          {panelContent}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-[1200] border-t border-white/10 bg-ink/[0.82] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-2xl backdrop-blur-lg">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-2">
          <button
            className="focus-ring min-h-16 rounded-md bg-river px-2 py-3 text-sm font-black leading-tight text-white"
            type="button"
            onClick={() => setIsCheckInOpen(true)}
          >
            Check In Here
          </button>
          <button
            className={`focus-ring min-h-16 rounded-md px-2 py-3 text-sm font-black text-white ${
              activeDockPanel === "updates" ? "bg-surge" : "bg-white/10"
            }`}
            type="button"
            onClick={() => togglePanel("updates")}
          >
            Updates
          </button>
          <button
            className={`focus-ring min-h-16 rounded-md px-2 py-3 text-sm font-black text-white ${
              activeDockPanel === "map" ? "bg-white/20" : "bg-white/10"
            }`}
            type="button"
            onClick={() => togglePanel("map")}
          >
            Map
          </button>
          <button
            className={`focus-ring min-h-16 rounded-md px-2 py-3 text-sm font-black text-white ${
              activeDockPanel === "meetup" ? "bg-white/20" : "bg-white/10"
            }`}
            type="button"
            onClick={() => togglePanel("meetup")}
          >
            Meetup
          </button>
        </div>
      </nav>

      {toast ? (
        <div className="fixed left-3 right-3 top-3 z-[2100] mx-auto max-w-sm rounded-lg border border-white/10 bg-ink/[0.80] p-3 text-center text-sm font-black text-white shadow-2xl backdrop-blur-lg">
          {toast}
        </div>
      ) : null}

      <CheckInModal
        isConfigured={isConfigured}
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onCreate={handleCreateCheckIn}
        onManualPick={(draft) => {
          setManualDraft(draft);
          setIsCheckInOpen(false);
          setToast("Tap the map to place your check-in.");
        }}
      />

      <PostUpdateModal
        isConfigured={isConfigured}
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        onPost={async (input) => {
          await postUpdate(input);
          setToast(input.type === "ben" ? "Ben sighting posted." : "Update posted.");
          setActiveDockPanel("updates");
        }}
      />
    </main>
  );
}
