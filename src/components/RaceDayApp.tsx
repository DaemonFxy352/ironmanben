"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import AthleteStatusBar from "@/components/AthleteStatusBar";
import { AuthScreen } from "@/components/AuthScreen";
import { CheckInModal } from "@/components/CheckInModal";
import { PostUpdateModal } from "@/components/PostUpdateModal";
import { RaceHeader } from "@/components/RaceHeader";
import { RaceTimeline } from "@/components/RaceTimeline";
import Toast from "@/components/Toast";
import { mapPoints } from "@/data/mapPoints";
import { raceDayHeroImage } from "@/data/visuals";
import { useBenSightingNotifications } from "@/hooks/useBenSightingNotifications";
import { useCheckIns } from "@/hooks/useCheckIns";
import { usePhoneAuth } from "@/hooks/usePhoneAuth";
import { quickBroadcasts, useQuickSync } from "@/hooks/useQuickSync";
import { useRaceUpdates } from "@/hooks/useRaceUpdates";
import type { ReactNode } from "react";
import type { CheckIn, CheckInInput } from "@/types/checkIn";
import type { MapPoint } from "@/types/map";
import type { QuickMessage, QuickMessageKind } from "@/types/message";
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

type Coordinates = {
  lat: number;
  lng: number;
};

type MapFocusRequest = {
  id: number;
  athlete?: Coordinates;
  user?: Coordinates;
};

type MarkerKind = "family" | "ben" | "parking" | "food" | "meetup";
type StaticMarkerKind = Exclude<MarkerKind, "family">;
type ActiveLayer = "route" | "family" | "parking" | "food" | "meetup" | "cheer" | "mobility";
type ActiveNav = "home" | "map" | "updates" | "crew";
type DockPanel = "updates" | "crew" | null;

type BenSighting = {
  update: RaceUpdate;
  point: MapPoint;
};

const jacksonvilleCenter = {
  lat: 30.321,
  lng: -81.672,
};

const defaultActiveLayers: ActiveLayer[] = ["route", "family", "meetup", "cheer"];
const FAMILY_COLORS = ["#1e7a3c", "#1a4ea8", "#7a1e6a", "#a85e1a", "#1a7a7a", "#7a1a1a"];

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

const raceRoutePointIds = [
  "metropolitan-park-swim-start",
  "post-st-dock-swim-exit",
  "memorial-park-transition",
  "ponte-vedra-a1a-bike",
  "memorial-park-transition",
  "five-points",
  "willow-branch-park",
  "riverwalk-accessible-viewing",
  "riverfront-plaza-finish",
];

const safePathRoutes = [
  ["water-street-garage", "riverfront-plaza-finish", "riverwalk-accessible-viewing"],
  ["yates-garage", "riverfront-plaza-finish", "riverwalk-accessible-viewing"],
  ["memorial-park-transition", "riverside-arts-market", "five-points"],
  ["five-points", "riverside-park", "willow-branch-park"],
];

const meetupAnchorId = "memorial-park-transition";

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

const savedNameKey = "ironmanben-family-name";

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

function layerForStaticPoint(point: MapPoint): ActiveLayer {
  if (point.category === "parking") {
    return "parking";
  }

  if (point.category === "restaurants") {
    return "food";
  }

  if (point.category === "cheerZones") {
    return "cheer";
  }

  return "meetup";
}

function shouldShowStaticPoint(point: MapPoint, activeLayers: Set<ActiveLayer>) {
  const layer = layerForStaticPoint(point);

  if (!activeLayers.has(layer)) {
    return false;
  }

  if (layer === "parking" || layer === "food" || layer === "cheer") {
    return true;
  }

  return priorityStaticIds.has(point.id);
}

function getPersonColor(name: string) {
  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }

  return FAMILY_COLORS[Math.abs(hash) % FAMILY_COLORS.length];
}

function markerIconHtml(kind: MarkerKind) {
  const style = markerStyles[kind];
  return `<span class="race-marker-dot" style="background: ${style.color}">${style.glyph}</span>`;
}

function familyMarkerIconHtml(checkIn: CheckIn) {
  const initial = escapeHtml(checkIn.name.trim().slice(0, 1).toUpperCase() || "F");
  const color = getPersonColor(checkIn.name);

  return `<span class="family-marker-dot" style="background: ${color}">${initial}</span>`;
}

function walkingDirectionsUrl(point: MapPoint, provider: "apple" | "google") {
  const destination = `${point.coordinates.lat},${point.coordinates.lng}`;

  if (provider === "apple") {
    return `https://maps.apple.com/?daddr=${encodeURIComponent(destination)}&dirflg=w`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination,
  )}&travelmode=walking`;
}

function meetupAnchorIconHtml() {
  return `<span class="meetup-anchor-star" aria-hidden="true">★</span>`;
}

function meetupAnchorPopupHtml(point: MapPoint) {
  return `
    <div class="map-popup-card">
      <p class="map-popup-type" style="color: #ef4444">Meetup spot</p>
      <h3>${escapeHtml(point.name)}</h3>
      <p>Persistent regroup anchor for the family. Use walking directions before moving through crowds.</p>
      <div class="map-popup-actions">
        <a class="map-popup-link" href="${escapeHtml(
          walkingDirectionsUrl(point, "google"),
        )}" target="_blank" rel="noreferrer">Google walking</a>
        <a class="map-popup-link" href="${escapeHtml(
          walkingDirectionsUrl(point, "apple"),
        )}" target="_blank" rel="noreferrer">Apple walking</a>
      </div>
    </div>
  `;
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

function distanceKm(a: Coordinates, b: Coordinates) {
  const earthRadiusKm = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const value =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function shouldShowFinishHype(latestBenUpdate: RaceUpdate | undefined, latestPoint: MapPoint | null) {
  if (!latestBenUpdate) {
    return false;
  }

  const finishPoint = mapPoints.find((point) => point.id === "riverfront-plaza-finish");
  const latestText = `${latestBenUpdate.location ?? ""} ${latestBenUpdate.message}`.toLowerCase();
  const finishTextSignal =
    latestText.includes("5k") ||
    latestText.includes("5 km") ||
    latestText.includes("3 miles") ||
    latestText.includes("riverwalk") ||
    latestText.includes("finish");

  if (finishTextSignal) {
    return true;
  }

  if (!finishPoint || !latestPoint) {
    return false;
  }

  return (
    latestBenUpdate.type === "ben" &&
    distanceKm(latestPoint.coordinates, finishPoint.coordinates) <= 5
  );
}

function RaceMap({
  activeLayers,
  benSightings,
  checkIns,
  isPickingManual,
  onManualPick,
  recenterRequest,
}: {
  activeLayers: Set<ActiveLayer>;
  benSightings: BenSighting[];
  checkIns: CheckIn[];
  isPickingManual: boolean;
  onManualPick: (latLng: LatLng) => void;
  recenterRequest: MapFocusRequest | null;
}) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const clusterRef = useRef<MarkerClusterGroup | null>(null);
  const cheerZoneRefs = useRef<Array<{ remove: () => void }>>([]);
  const routeLineRef = useRef<{ remove: () => void } | null>(null);
  const safePathRefs = useRef<Array<{ remove: () => void }>>([]);
  const meetupAnchorRef = useRef<{ remove: () => void } | null>(null);
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

        L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
          attribution: '© <a href="https://stadiamaps.com/">Stadia Maps</a>',
          maxZoom: 20,
        }).addTo(mapRef.current);

        clusterRef.current = L.markerClusterGroup({
          maxClusterRadius: 42,
          showCoverageOnHover: false,
          spiderfyOnMaxZoom: true,
        });
        clusterRef.current.addTo(mapRef.current);
      }

      clusterRef.current?.clearLayers();
      cheerZoneRefs.current.forEach((marker) => marker.remove());
      cheerZoneRefs.current = [];
      routeLineRef.current?.remove();
      routeLineRef.current = null;
      safePathRefs.current.forEach((line) => line.remove());
      safePathRefs.current = [];
      meetupAnchorRef.current?.remove();
      meetupAnchorRef.current = null;
      const bounds = L.latLngBounds([]);

      const routeCoordinates = raceRoutePointIds
        .map((id) => mapPoints.find((point) => point.id === id))
        .filter((point): point is MapPoint => Boolean(point))
        .map((point) => [point.coordinates.lat, point.coordinates.lng] as [number, number]);

      if (activeLayers.has("route") && routeCoordinates.length > 1 && mapRef.current) {
        routeLineRef.current = L.polyline(routeCoordinates, {
          className: "race-route-line",
          color: "#e84b1a",
          dashArray: "8, 5",
          lineCap: "round",
          lineJoin: "round",
          opacity: 0.85,
          weight: 3,
        }).addTo(mapRef.current);

        routeCoordinates.forEach((coordinate) => bounds.extend(coordinate));
      }

      if (activeLayers.has("mobility") && mapRef.current) {
        safePathRefs.current = safePathRoutes
          .map((route) =>
            route
              .map((id) => mapPoints.find((point) => point.id === id))
              .filter((point): point is MapPoint => Boolean(point))
              .map((point) => [point.coordinates.lat, point.coordinates.lng] as [number, number]),
          )
          .filter((coordinates) => coordinates.length > 1)
          .map((coordinates) => {
            coordinates.forEach((coordinate) => bounds.extend(coordinate));

            return L.polyline(coordinates, {
              className: "safe-path-line",
              color: "#ffffff",
              dashArray: "10 7",
              lineCap: "round",
              lineJoin: "round",
              opacity: 0.98,
              weight: 8,
            }).addTo(mapRef.current!);
          });
      }

      const meetupAnchor = mapPoints.find((point) => point.id === meetupAnchorId);

      if (meetupAnchor && mapRef.current) {
        const meetupMarker = L.marker([meetupAnchor.coordinates.lat, meetupAnchor.coordinates.lng], {
          icon: L.divIcon({
            className: "meetup-anchor-marker",
            html: meetupAnchorIconHtml(),
            iconSize: [58, 58],
            iconAnchor: [29, 29],
            popupAnchor: [0, -30],
          }),
          title: "Persistent meetup spot",
          zIndexOffset: 1200,
        }).bindPopup(meetupAnchorPopupHtml(meetupAnchor), {
          className: "spectator-popup",
          maxWidth: 310,
          minWidth: 250,
        });

        meetupMarker.addTo(mapRef.current);
        meetupAnchorRef.current = meetupMarker;
        bounds.extend([meetupAnchor.coordinates.lat, meetupAnchor.coordinates.lng]);
      }

      mapPoints.forEach((point) => {
        if (point.category === "cheerZones") {
          if (!activeLayers.has("cheer") || !mapRef.current) {
            return;
          }

          const marker = L.circleMarker([point.coordinates.lat, point.coordinates.lng], {
            className: "cheer-marker",
            radius: 10,
            fillColor: "#e84b1a",
            color: "#e84b1a",
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.35,
          }).bindPopup(staticPopupHtml(point, "ben"), {
            className: "spectator-popup",
            maxWidth: 300,
            minWidth: 240,
          });

          marker.addTo(mapRef.current);
          cheerZoneRefs.current.push(marker);
          bounds.extend(marker.getLatLng());
          return;
        }

        const kind = staticMarkerKind(point);

        if (!shouldShowStaticPoint(point, activeLayers)) {
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

      if (activeLayers.has("family")) {
        checkIns.forEach((checkIn) => {
          const marker = L.marker([checkIn.lat, checkIn.lng], {
            icon: L.divIcon({
              className: "family-marker-wrapper",
              html: familyMarkerIconHtml(checkIn),
              iconSize: [28, 28],
              iconAnchor: [14, 14],
              popupAnchor: [0, -18],
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
      }

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
  }, [activeLayers, benSightings, checkIns]);

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
    if (!recenterRequest || !mapRef.current) {
      return;
    }

    const request = recenterRequest;
    let cancelled = false;

    async function recenterMap() {
      const L = await import("leaflet");
      const map = mapRef.current;
      const targets = [request.user, request.athlete].filter(
        (target): target is Coordinates => Boolean(target),
      );

      if (cancelled || !map || targets.length === 0) {
        return;
      }

      if (targets.length === 1) {
        map.setView([targets[0].lat, targets[0].lng], 15, {
          animate: true,
        });
        return;
      }

      const bounds = L.latLngBounds(
        targets.map((target) => [target.lat, target.lng] as [number, number]),
      );
      map.fitBounds(bounds, {
        animate: true,
        maxZoom: 15,
        padding: [72, 72],
      });
    }

    recenterMap();

    return () => {
      cancelled = true;
    };
  }, [recenterRequest]);

  useEffect(() => {
    return () => {
      routeLineRef.current?.remove();
      cheerZoneRefs.current.forEach((marker) => marker.remove());
      safePathRefs.current.forEach((line) => line.remove());
      meetupAnchorRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
      clusterRef.current = null;
      routeLineRef.current = null;
      cheerZoneRefs.current = [];
      safePathRefs.current = [];
      meetupAnchorRef.current = null;
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
    <section className="rounded-xl border border-white/20 bg-zinc-950/85 p-3 text-white shadow-2xl backdrop-blur-lg sm:p-4">
      <p className="text-[0.68rem] font-black uppercase text-white/50">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-black leading-tight sm:text-xl">{title}</h2>
          <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-white/70">
            {detail}
          </p>
        </div>
        {action}
      </div>
    </section>
  );
}

const TAG_STYLES: Record<RaceUpdate["type"], { bg: string; color: string; label: string }> = {
  ben: { bg: "rgba(232,75,26,0.2)", color: "#f07050", label: "Sighting" },
  food: { bg: "rgba(250,180,100,0.15)", color: "#fabb64", label: "Food" },
  general: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", label: "Update" },
  help: { bg: "rgba(248,113,113,0.16)", color: "#f87171", label: "Help" },
  meetup: { bg: "rgba(100,160,255,0.15)", color: "#6488f5", label: "Meetup" },
  parking: { bg: "rgba(250,180,100,0.15)", color: "#fabb64", label: "Parking" },
};

function useRelativeTime(dateStr: string) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function update() {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);

      if (diff < 1) {
        setLabel("just now");
      } else if (diff < 60) {
        setLabel(`${diff} min ago`);
      } else {
        setLabel(`${Math.floor(diff / 60)}h ${diff % 60}m ago`);
      }
    }

    update();
    const interval = window.setInterval(update, 30000);
    return () => window.clearInterval(interval);
  }, [dateStr]);

  return label;
}

function getUpdateOpacity(dateStr: string) {
  const ageMinutes = (Date.now() - new Date(dateStr).getTime()) / 60000;

  if (ageMinutes > 120) {
    return 0;
  }

  if (ageMinutes > 30) {
    return 0.4;
  }

  return 1;
}

function FeedItem({ update }: { update: RaceUpdate }) {
  const relativeTime = useRelativeTime(update.createdAt);
  const style = TAG_STYLES[update.type];

  return (
    <article className="rounded-lg bg-white/10 p-3" style={{ opacity: getUpdateOpacity(update.createdAt) }}>
      <div className="flex items-center justify-between gap-3">
        <span
          className="shrink-0 rounded-full px-2 py-1 text-xs font-bold uppercase tracking-wide"
          style={{ background: style.bg, color: style.color }}
        >
          {style.label}
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-black text-white">{update.author}</p>
        <p className="shrink-0 font-mono text-xs font-bold uppercase text-white/50">{relativeTime}</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-white/80">{update.message}</p>
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
  );
}

function UpdateFeed({ updates }: { updates: RaceUpdate[] }) {
  const visibleUpdates = updates.filter((update) => getUpdateOpacity(update.createdAt) > 0).slice(0, 10);

  if (visibleUpdates.length === 0) {
    return (
      <p className="rounded-lg bg-white/10 p-3 text-sm font-bold leading-6 text-white/70">
        No updates yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {visibleUpdates.map((update) => (
        <FeedItem key={update.id} update={update} />
      ))}
    </div>
  );
}

export function RaceDayApp() {
  const auth = usePhoneAuth();
  const [activeNav, setActiveNav] = useState<ActiveNav>("home");
  const [activeDockPanel, setActiveDockPanel] = useState<DockPanel>(null);
  const [activeLayers, setActiveLayers] = useState<Set<ActiveLayer>>(
    () => new Set(defaultActiveLayers),
  );
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [manualDraft, setManualDraft] = useState<ManualDraft | null>(null);
  const [meetupBanner, setMeetupBanner] = useState<QuickMessage | null>(null);
  const [isRecentering, setIsRecentering] = useState(false);
  const [recenterRequest, setRecenterRequest] = useState<MapFocusRequest | null>(null);
  const [sendingQuickKind, setSendingQuickKind] = useState<QuickMessageKind | null>(null);
  const [isFinishHypeDismissed, setIsFinishHypeDismissed] = useState(false);
  const [showFinishHype, setShowFinishHype] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false });
  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);
  const handleQuickSyncBroadcast = useCallback((message: QuickMessage) => {
    if ("vibrate" in navigator) {
      navigator.vibrate([90, 40, 90]);
    }

    setMeetupBanner(message);
  }, []);
  const {
    error: quickSyncError,
    isConfigured: quickSyncConfigured,
    isLoading: quickSyncLoading,
    isRealtimeStale: quickSyncRealtimeStale,
    messages: quickSyncMessages,
    sendQuickBroadcast,
  } = useQuickSync({ onBroadcast: handleQuickSyncBroadcast });
  const {
    checkIns,
    createCheckIn,
    error: checkInError,
    isConfigured: checkInsConfigured,
    isLoading: checkInsLoading,
    isRealtimeStale: checkInsRealtimeStale,
  } = useCheckIns();
  const {
    error: updatesError,
    isConfigured: updatesConfigured,
    isLoading: updatesLoading,
    isRealtimeStale: updatesRealtimeStale,
    postUpdate,
    updates,
  } = useRaceUpdates();

  useBenSightingNotifications({
    enabled: auth.isAuthenticated,
    updates,
  });

  const isConfigured = checkInsConfigured && updatesConfigured && quickSyncConfigured;
  const isLoading = checkInsLoading || updatesLoading || quickSyncLoading;
  const isRealtimeStale =
    checkInsRealtimeStale || updatesRealtimeStale || quickSyncRealtimeStale;
  const latestError = checkInError || updatesError || quickSyncError;
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
  const latestAthletePoint =
    benSightings[0]?.point ?? (latestBenUpdate ? matchPointForUpdate(latestBenUpdate) : null);
  const isFinishHypeReady = shouldShowFinishHype(latestBenUpdate, latestAthletePoint);
  const finishPoint = mapPoints.find((point) => point.id === "riverfront-plaza-finish");
  const finishDistanceLabel =
    finishPoint && latestAthletePoint
      ? `${Math.max(0.1, distanceKm(latestAthletePoint.coordinates, finishPoint.coordinates)).toFixed(
          1,
        )} KM`
      : "5 KM";

  useEffect(() => {
    if (isFinishHypeReady && !isFinishHypeDismissed) {
      setShowFinishHype(true);
    }
  }, [isFinishHypeDismissed, isFinishHypeReady]);

  const handleCreateCheckIn = useCallback(
    async (input: CheckInInput) => {
      await createCheckIn(input);
      showToast("Checked in.");
    },
    [createCheckIn, showToast],
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
        showToast("Custom check-in shared.");
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Check-in failed.");
      }
    },
    [createCheckIn, manualDraft, showToast],
  );

  const handleQuickBroadcast = useCallback(
    async (template: (typeof quickBroadcasts)[number]) => {
      setSendingQuickKind(template.kind);

      try {
        const author =
          window.localStorage.getItem("crew_name") ||
          window.localStorage.getItem(savedNameKey) ||
          "Family";
        await sendQuickBroadcast(template, author);
        setActiveNav("crew");
        setActiveDockPanel("crew");
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Quick Sync failed.");
      } finally {
        setSendingQuickKind(null);
      }
    },
    [sendQuickBroadcast, showToast],
  );

  const handleRecenterMap = useCallback(() => {
    const athlete = latestAthletePoint?.coordinates;

    if (!navigator.geolocation) {
      setRecenterRequest({
        id: Date.now(),
        athlete,
      });
      showToast(
        athlete ? "GPS unavailable. Centered on Ben's last known spot." : "GPS is unavailable.",
      );
      return;
    }

    setIsRecentering(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const user = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setRecenterRequest({
          id: Date.now(),
          athlete,
          user,
        });
        showToast(
          athlete
            ? "Map centered on you and Ben's last known spot."
            : "No Ben sighting yet. Centered on you.",
        );
        setIsRecentering(false);
      },
      (error) => {
        setRecenterRequest({
          id: Date.now(),
          athlete,
        });
        showToast(
          athlete
            ? `${error.message}. Centered on Ben's last known spot.`
            : error.message || "Location permission was not granted.",
        );
        setIsRecentering(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 10000,
      },
    );
  }, [latestAthletePoint, showToast]);

  const toggleLayer = (layer: ActiveLayer) => {
    setActiveLayers((current) => {
      const next = new Set(current);

      if (next.has(layer)) {
        next.delete(layer);
      } else {
        next.add(layer);
      }

      return next;
    });
  };

  const activateNav = (nav: ActiveNav) => {
    setActiveNav(nav);
    setActiveDockPanel(nav === "updates" || nav === "crew" ? nav : null);
  };

  const panelContent = (() => {
    if (activeDockPanel === "updates") {
      return (
        <section className="rounded-xl border border-white/20 bg-zinc-950/90 p-3 text-white shadow-2xl backdrop-blur-lg sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Updates</h2>
            <button
              className="focus-ring bg-surge px-4 py-3 text-sm font-black text-white"
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

    if (activeDockPanel === "crew") {
      return (
        <section className="rounded-xl border border-white/20 bg-zinc-950/90 p-3 text-white shadow-2xl backdrop-blur-lg sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-lime-300">Crew</p>
              <h2 className="text-xl font-black">Family Positions</h2>
            </div>
            <button
              className="focus-ring border border-white/25 bg-white px-4 py-3 text-sm font-black text-zinc-950"
              type="button"
              onClick={() => setIsCheckInOpen(true)}
            >
              Check In
            </button>
          </div>

          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {activeFamily.slice(0, 8).map((checkIn) => (
              <article key={checkIn.id} className="rounded-lg bg-white/10 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-black text-white">{checkIn.name}</p>
                  <p className="shrink-0 font-mono text-xs font-bold text-white/50">
                    {formatTime(checkIn.createdAt)}
                  </p>
                </div>
                <p className="mt-1 text-xs font-bold text-white/60">
                  {checkIn.note || "Checked in on the map"}
                </p>
              </article>
            ))}
            {activeFamily.length === 0 ? (
              <p className="rounded-lg bg-white/10 p-3 text-sm font-bold text-white/60">
                No crew check-ins yet.
              </p>
            ) : null}
          </div>

          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="text-xs font-black uppercase text-white/45">Quick Broadcast</p>
            <div className="mt-2 grid gap-2">
              {quickBroadcasts.map((template) => (
              <button
                key={template.kind}
                className={`focus-ring flex items-center justify-between gap-3 border px-4 py-3 text-left text-base font-black transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${
                  template.kind === "help_water"
                    ? "border-orange-300/50 bg-orange-500/20 text-white"
                    : "border-lime-300/35 bg-lime-300/10 text-lime-50"
                }`}
                disabled={!isConfigured || Boolean(sendingQuickKind)}
                type="button"
                onClick={() => handleQuickBroadcast(template)}
              >
                <span>{sendingQuickKind === template.kind ? "Sending..." : template.label}</span>
                {sendingQuickKind === template.kind ? (
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/25 border-t-lime-300"
                  />
                ) : null}
              </button>
            ))}
            </div>
          </div>

          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="text-xs font-black uppercase text-white/45">Latest broadcasts</p>
            <div className="mt-2 space-y-2">
              {quickSyncMessages.slice(0, 3).map((message) => (
                <article key={message.id} className="rounded-lg bg-white/10 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-black text-white">{message.message}</p>
                    <p className="shrink-0 font-mono text-xs font-bold text-white/50">
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs font-bold text-white/60">
                    {message.author}
                    {message.location ? ` / ${message.location}` : ""}
                  </p>
                </article>
              ))}
              {quickSyncMessages.length === 0 ? (
                <p className="rounded-lg bg-white/10 p-3 text-sm font-bold text-white/60">
                  No broadcasts yet.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      );
    }

    return null;
  })();

  if (auth.isConfigured && auth.isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-zinc-950 p-6 text-white">
        <div className="w-full max-w-sm rounded-xl border border-white/20 bg-black p-5 text-center shadow-2xl">
          <p className="text-sm font-black uppercase text-lime-300">Loading login</p>
          <h1 className="mt-2 text-3xl font-black">Ben Race HQ</h1>
        </div>
      </main>
    );
  }

  if (auth.isConfigured && !auth.isAuthenticated) {
    return (
      <AuthScreen
        isConfigured={auth.isConfigured}
        isLoading={auth.isLoading}
        onSendOtp={auth.sendOtp}
        onVerifyOtp={auth.verifyOtp}
      />
    );
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-zinc-950 text-white">
      <RaceHeader isRealtimeStale={isRealtimeStale} racePhase={benStatus.phase} />
      <AthleteStatusBar isRealtimeStale={isRealtimeStale} latestBenUpdate={latestBenUpdate} />
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
        <div className="absolute inset-0 bg-zinc-950/25" />
      </div>

      <div className="race-map-layer absolute inset-0 z-10">
        <RaceMap
          activeLayers={activeLayers}
          benSightings={benSightings}
          checkIns={checkIns}
          isPickingManual={Boolean(manualDraft)}
          onManualPick={handleManualPick}
          recenterRequest={recenterRequest}
        />
      </div>
      <div className="race-day-scrim pointer-events-none absolute inset-0 z-20" />

      {activeNav === "map" ? (
        <div className="fixed left-3 top-[9rem] z-[1300] flex flex-col gap-1.5">
          {[
            { id: "route", label: "Route" },
            { id: "family", label: "Family" },
            { id: "parking", label: "Parking" },
            { id: "mobility", label: "Mobility" },
          ].map(({ id, label }) => {
            const layer = id as ActiveLayer;
            const isActive = activeLayers.has(layer);

            return (
              <button
                key={id}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95"
                style={{
                  background: isActive ? "rgba(232,75,26,0.3)" : "rgba(20,28,42,0.85)",
                  border: isActive
                    ? "1px solid rgba(232,75,26,0.5)"
                    : "0.5px solid rgba(255,255,255,0.15)",
                  color: isActive ? "#f07050" : "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(8px)",
                }}
                type="button"
                onClick={() => toggleLayer(layer)}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                {label}
              </button>
            );
          })}
        </div>
      ) : null}

      <button
        className="focus-ring fixed right-3 top-[9rem] z-[1300] flex items-center gap-2 border-2 border-lime-300 bg-black px-4 py-3 text-sm font-black text-white shadow-2xl transition-all active:scale-95"
        disabled={isRecentering}
        type="button"
        onClick={handleRecenterMap}
      >
        <span aria-hidden="true" className="crosshair-icon" />
        {isRecentering ? "Locating..." : "Recenter Map"}
      </button>

      <div className="pointer-events-none relative z-[1000] flex min-h-dvh flex-col justify-between px-2 pb-[6.75rem] pt-[8.75rem] sm:px-4 sm:pb-[7rem]">
        <div className="pointer-events-auto max-w-5xl space-y-2">
          {activeNav === "home" ? (
            <>
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <section className="rounded-xl border border-white/20 bg-zinc-950/90 p-3 text-white shadow-2xl backdrop-blur-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase text-lime-300">Family Command</p>
                  <h1 className="mt-1 text-2xl font-black leading-none sm:text-3xl">
                    Ben Race HQ
                  </h1>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-[6.25rem_1fr] gap-2">
                <div className="rounded-lg border border-white/10 bg-white/10 p-3">
                  <p className="text-xs font-black uppercase text-white/50">Phase</p>
                  <p className="mt-1 font-mono text-xl font-black">{benStatus.phase}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/10 p-3">
                  <p className="text-xs font-black uppercase text-white/50">Last seen</p>
                  <p className="mt-1 line-clamp-2 text-base font-black leading-5">
                    {benStatus.lastSeen}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase text-white/50">
                    Next: {benStatus.next}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  className="btn-primary focus-ring bg-river px-4 py-3 text-sm font-black text-white"
                  type="button"
                  onClick={() => setIsCheckInOpen(true)}
                >
                  Check In Here
                </button>
                <button
                  className="btn-primary focus-ring border border-white/25 bg-white/10 px-4 py-3 text-sm font-black text-white"
                  type="button"
                  onClick={() => setIsPostOpen(true)}
                >
                  Saw Ben
                </button>
              </div>
            </section>

            <RaceTimeline latestBenUpdate={latestBenUpdate} />
          </div>

          <div
            className="mb-3 flex items-center justify-between rounded-xl px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(255,255,255,0.09)",
            }}
          >
            <div className="min-w-0">
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-white/35">
                Meetup point
              </p>
              <p className="truncate text-base font-bold text-white">Memorial Park</p>
              <p className="mt-0.5 text-xs text-white/40">If separated, go here</p>
            </div>
            <a
              className="flex items-center rounded-lg px-3 py-2 text-xs font-semibold"
              href="https://maps.apple.com/?q=Memorial+Park+Jacksonville+FL"
              rel="noreferrer"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.7)",
                minHeight: "44px",
              }}
              target="_blank"
            >
              Directions
            </a>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <GlassCard
              label="Best spot now"
              title={bestSpot.title}
              detail={bestSpot.why}
              action={
                <a
                  className="focus-ring shrink-0 rounded-xl border border-white/25 bg-white px-3 py-2 text-xs font-black text-zinc-950"
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
            </>
          ) : null}

          {process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_SUPABASE_URL ? (
            <div className="py-1 text-center text-xs" style={{ background: "#3a1a0a", color: "#f07050" }}>
              Dev: Supabase not configured
            </div>
          ) : null}
        </div>

        <div className="pointer-events-auto mx-auto w-full max-w-xl space-y-3">
          {manualDraft ? (
            <div className="rounded-xl border border-surge/40 bg-zinc-950/90 p-4 text-center shadow-2xl backdrop-blur-lg">
              <p className="text-lg font-black">Tap the map</p>
              <p className="mt-1 text-sm font-bold text-white/70">
                Custom pin for {manualDraft.name}
              </p>
              <button
                className="focus-ring mt-3 border border-white/25 px-4 py-2 text-sm font-black"
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

      <nav
        className="pb-safe fixed bottom-0 left-0 right-0 z-[1200] flex items-center border-t border-white/[0.07] bg-zinc-950/94 px-2 pt-2 shadow-2xl backdrop-blur-lg"
        style={{ minHeight: "64px" }}
      >
        <div className="mx-auto grid w-full max-w-xl grid-cols-4 gap-1">
          {[
            { id: "home", label: "Home", icon: "⌂" },
            { id: "map", label: "Map", icon: "◈" },
            { id: "updates", label: "Updates", icon: "◉" },
            { id: "crew", label: "Crew", icon: "⊕" },
          ].map((item) => {
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                className="focus-ring flex flex-col items-center justify-center gap-0.5 border-0 bg-transparent px-2 py-2 transition-all active:scale-95"
                style={{ minHeight: "56px" }}
                type="button"
                onClick={() => activateNav(item.id as ActiveNav)}
              >
                <span
                  className="text-2xl leading-none"
                  style={{ color: isActive ? "#e84b1a" : "rgba(255,255,255,0.35)" }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-xs"
                  style={{
                    color: isActive ? "#f07050" : "rgba(255,255,255,0.3)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {meetupBanner ? (
        <div className="fixed left-0 right-0 top-[60px] z-[2200] border-b-2 border-lime-300 bg-black px-3 py-3 text-white shadow-2xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase text-lime-300">Meetup Broadcast</p>
              <p className="mt-1 text-base font-black leading-5">
                {meetupBanner.author}: {meetupBanner.message}
              </p>
              <p className="mt-1 font-mono text-xs font-black text-white/55">
                {meetupBanner.location ? `${meetupBanner.location} / ` : ""}
                {formatTime(meetupBanner.createdAt)}
              </p>
            </div>
            <button
              className="focus-ring shrink-0 border border-white/30 bg-white px-4 py-2 text-sm font-black text-zinc-950 transition-all active:scale-95"
              type="button"
              onClick={() => setMeetupBanner(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {showFinishHype ? (
        <div className="fixed inset-0 z-[2300] bg-black text-white">
          <Image
            aria-hidden="true"
            alt=""
            className="object-cover object-center"
            fill
            priority
            sizes="100vw"
            src={raceDayHeroImage.src}
          />
          <div className="absolute inset-0 bg-black/58" />
          <div className="relative flex min-h-dvh flex-col justify-between p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="rounded-xl border-2 border-lime-300 bg-black/86 p-4 shadow-[0_0_28px_rgba(190,242,100,0.35)]">
              <p className="text-sm font-black uppercase text-lime-300">Finish Line Countdown</p>
              <h2 className="mt-2 font-mono text-6xl font-black leading-none text-white">
                {finishDistanceLabel}
              </h2>
              <p className="mt-2 text-xl font-black uppercase leading-6 text-white">
                Ben is inside the final push.
              </p>
            </div>

            <div className="rounded-xl border border-white/25 bg-black/82 p-4">
              <p className="text-3xl font-black leading-tight">Get the crew to the finish.</p>
              <p className="mt-2 text-base font-bold leading-6 text-white/78">
                Move to the meetup anchor, keep phones ready, and take the family photo.
              </p>
              <button
                className="focus-ring mt-4 w-full border-2 border-white bg-white px-4 py-3 text-base font-black text-zinc-950 transition-all active:scale-95"
                type="button"
                onClick={() => {
                  setIsFinishHypeDismissed(true);
                  setShowFinishHype(false);
                }}
              >
                Keep Tracking
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Toast
        message={toast.message}
        visible={toast.visible}
        onDismiss={() => setToast((current) => ({ ...current, visible: false }))}
      />

      <CheckInModal
        isConfigured={isConfigured}
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onCreate={handleCreateCheckIn}
        onManualPick={(draft) => {
          setManualDraft(draft);
          setIsCheckInOpen(false);
          showToast("Tap the map to place your check-in.");
        }}
      />

      <PostUpdateModal
        isConfigured={isConfigured}
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        onPost={async (input) => {
          await postUpdate(input);
          showToast(input.type === "ben" ? "Ben sighting posted." : "Update posted.");
          setActiveNav("updates");
          setActiveDockPanel("updates");
        }}
      />
    </main>
  );
}
