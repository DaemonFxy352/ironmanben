"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { DraggableInfoSheet } from "@/components/DraggableInfoSheet";
import { FloatingDock } from "@/components/FloatingDock";
import { AuthScreen } from "@/components/AuthScreen";
import { CheckInModal } from "@/components/CheckInModal";
import { PostUpdateModal } from "@/components/PostUpdateModal";
import { RaceTimeline } from "@/components/RaceTimeline";
import Toast from "@/components/Toast";
import { StatusBar } from "@/components/StatusBar";
import { ActionBar } from "@/components/ActionBar";
import { MainPanel } from "@/components/panels/MainPanel";
import type { MapLayer } from "@/components/panels/LayersPanel";
import type { QuickBroadcastTemplate } from "@/types/message";
import { mapPoints } from "@/data/mapPoints";
import { raceDayHeroImage } from "@/data/visuals";
import { useBenSightingNotifications } from "@/hooks/useBenSightingNotifications";
import { useCheckIns } from "@/hooks/useCheckIns";
import { quickBroadcasts, useQuickSync } from "@/hooks/useQuickSync";
import { useRaceUpdates } from "@/hooks/useRaceUpdates";
import { addRaceMinutes } from "@/lib/raceSchedule";
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
type DockPanel = "updates" | "crew" | null;

type BenSighting = {
  update: RaceUpdate;
  point: MapPoint;
};

const jacksonvilleCenter = {
  lat: 30.3322,
  lng: -81.6557,
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
      lastSeen: "Map ready",
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

function getPhaseIcon(phase: string) {
  if (phase === "Bike") {
    return "🚴";
  }

  if (phase === "Run" || phase === "Finish") {
    return "🏃";
  }

  return "🏊";
}

function getNextTarget(phase: string) {
  const targetId =
    phase === "Finish"
      ? "riverfront-plaza-finish"
      : phase === "Run"
        ? "five-points"
        : "memorial-park-transition";

  return mapPoints.find((point) => point.id === targetId) ?? mapPoints[0];
}

function getPhaseEta(phase: string) {
  if (phase === "Bike") {
    return formatTime(addRaceMinutes(390).toISOString());
  }

  if (phase === "Run") {
    return formatTime(addRaceMinutes(638).toISOString());
  }

  if (phase === "Finish") {
    return "Now";
  }

  return formatTime(addRaceMinutes(90).toISOString());
}

function getCollapsedStatusText(phase: string, etaLabel: string) {
  if (phase === "Bike") {
    return `🚴 Out at Ponte Vedra - ETA T2: ${etaLabel}`;
  }

  if (phase === "Run" || phase === "Finish") {
    return `🏃 On Final Leg - ETA FINISH: ${etaLabel}`;
  }

  return `🏊 Ben in Water - ETA T1: ${etaLabel}`;
}

function milesLabel(from: MapPoint | null, to: MapPoint) {
  if (!from) {
    return "-- mi";
  }

  return `${(distanceKm(from.coordinates, to.coordinates) * 0.621371).toFixed(1)} mi`;
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

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 20,
            subdomains: "abcd",
          },
        ).addTo(mapRef.current);

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
          color: "#ff4d4d",
          lineCap: "round",
          lineJoin: "round",
          opacity: 1,
          weight: 6,
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
  const [activeLayers, setActiveLayers] = useState<Set<MapLayer>>(
    () => new Set(["route", "family"] as MapLayer[])
  );
  const [isAuthenticated, setIsAuthenticated] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem("auth_token") === "crew_authenticated"
  );
  const [isGuest, setIsGuest] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem("guest_name") === "Guest"
  );
  const [sendingQuickKind, setSendingQuickKind] = useState<QuickMessageKind | null>(null);
  const [toast, setToast] = useState({ message: "", visible: false });

  const { updates, isConfigured: updatesConfigured } = useRaceUpdates();
  const { checkIns, isConfigured: checkInsConfigured } = useCheckIns();
  const { sendQuickBroadcast, isConfigured: quickSyncConfigured } = useQuickSync();

  const isConfigured = updatesConfigured && checkInsConfigured && quickSyncConfigured;

  useEffect(() => {
    setIsGuest(window.localStorage.getItem("guest_name") === "Guest");
    setIsAuthenticated(window.localStorage.getItem("auth_token") === "crew_authenticated");
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      window.localStorage.removeItem("guest_name");
      setIsGuest(false);
    }
  }, [isAuthenticated]);

  const handleQuickBroadcast = useCallback(
    async (template: QuickBroadcastTemplate) => {
      if (!isConfigured) {
        setToast({ message: "System not configured", visible: true });
        return;
      }

      setSendingQuickKind(template.kind);

      try {
        const author =
          window.localStorage.getItem("crew_name") ||
          window.localStorage.getItem("ironmanben-family-name") ||
          "Family";
        await sendQuickBroadcast(template, author);
        setToast({ message: "Sent to crew", visible: true });
      } catch (error) {
        setToast({
          message: error instanceof Error ? error.message : "Failed to send",
          visible: true,
        });
      } finally {
        setSendingQuickKind(null);
      }
    },
    [isConfigured, sendQuickBroadcast]
  );

  const handleToggleLayer = useCallback((layer: MapLayer) => {
    setActiveLayers((current) => {
      const next = new Set(current);
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  }, []);

  if (!isAuthenticated && !isGuest) {
    return (
      <AuthScreen
        onAuthenticated={() => setIsAuthenticated(true)}
        onSkipGuest={() => setIsGuest(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StatusBar />

      <div className="pt-[100px] pb-[100px]">
        {/* Map placeholder - replace with real map */}
        <div className="h-[35vh] bg-muted/20 border-b border-border relative">
          <div className="absolute inset-0 flex items-center justify-center text-muted">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <div className="text-sm font-semibold">Map integration next</div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto px-4 py-6">
          <MainPanel
            updates={updates}
            checkIns={checkIns}
            onQuickBroadcast={handleQuickBroadcast}
            sendingQuickKind={sendingQuickKind}
            isConfigured={isConfigured}
            activeLayers={activeLayers}
            onToggleLayer={handleToggleLayer}
          />
        </div>
      </div>

      <ActionBar
        onCheckIn={() => setToast({ message: "Check In sheet coming next", visible: true })}
        onSawBen={() => setToast({ message: "Saw Ben sheet coming next", visible: true })}
        onCenterMap={() => setToast({ message: "Map centering coming next", visible: true })}
      />

      <Toast
        message={toast.message}
        visible={toast.visible}
        onDismiss={() => setToast((current) => ({ ...current, visible: false }))}
      />
    </div>
  );
}
