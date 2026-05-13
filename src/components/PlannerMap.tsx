"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  bikeCoursePath,
  disciplineColors,
  disciplineLabels,
  parkingSpots,
  recommendedSpots,
  runCoursePath,
  swimCoursePath,
  type Discipline,
} from "@/data/raceSpots";
import type { Map as LeafletMap } from "leaflet";

type ActiveDisciplines = Record<Discipline, boolean>;

const jacksonvilleCenter: [number, number] = [30.3, -81.62];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function spotMarkerHtml(color: string) {
  return `<span class="planner-star-marker" style="color: ${color}">★</span>`;
}

function parkingMarkerHtml() {
  return `<span class="planner-parking-marker">P</span>`;
}

function spotPopupHtml(args: {
  name: string;
  why: string;
  expectedSightings: number;
  hassleNote: string;
  parkingNote: string;
  directionsUrl: string;
  color: string;
  priorityLabel: string;
}) {
  return `
    <div class="planner-popup-card">
      <p class="planner-popup-type" style="color: ${args.color}">${escapeHtml(args.priorityLabel)}</p>
      <h3>${escapeHtml(args.name)}</h3>
      <p>${escapeHtml(args.why)}</p>
      <dl>
        <dt>Expected sightings</dt>
        <dd>${args.expectedSightings}</dd>
        <dt>Hassle</dt>
        <dd>${escapeHtml(args.hassleNote)}</dd>
        <dt>Parking</dt>
        <dd>${escapeHtml(args.parkingNote)}</dd>
      </dl>
      <a class="planner-popup-link" href="${escapeHtml(args.directionsUrl)}" target="_blank" rel="noreferrer">Get directions</a>
    </div>
  `;
}

function parkingPopupHtml(args: { name: string; serves: string; note: string; directionsUrl: string }) {
  return `
    <div class="planner-popup-card">
      <p class="planner-popup-type" style="color: #455a64">Parking</p>
      <h3>${escapeHtml(args.name)}</h3>
      <p><strong>Best for:</strong> ${escapeHtml(args.serves)}</p>
      <p>${escapeHtml(args.note)}</p>
      <a class="planner-popup-link" href="${escapeHtml(args.directionsUrl)}" target="_blank" rel="noreferrer">Get directions</a>
    </div>
  `;
}

export function PlannerMap({ focusId }: { focusId?: string | null }) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRefs = useRef<Record<Discipline, { remove: () => void } | null>>({
    swim: null,
    bike: null,
    run: null,
  });
  const spotMarkerRefs = useRef<Record<string, { remove: () => void; openPopup: () => void; getLatLng: () => { lat: number; lng: number } }>>({});

  const [active, setActive] = useState<ActiveDisciplines>({
    swim: true,
    bike: true,
    run: true,
  });
  const [showParking, setShowParking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      const L = await import("leaflet");

      if (cancelled || !mapElementRef.current) {
        return;
      }

      if (!mapRef.current) {
        mapRef.current = L.map(mapElementRef.current, {
          center: jacksonvilleCenter,
          zoom: 12,
          scrollWheelZoom: false,
          zoomControl: true,
        });

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19,
            subdomains: "abcd",
          },
        ).addTo(mapRef.current);

        // Recommended cheer spots: star markers, colored by discipline
        recommendedSpots.forEach((spot) => {
          const color = disciplineColors[spot.discipline];
          const marker = L.marker([spot.coordinates.lat, spot.coordinates.lng], {
            icon: L.divIcon({
              className: "planner-star-marker-wrapper",
              html: spotMarkerHtml(color),
              iconSize: [44, 44],
              iconAnchor: [22, 22],
              popupAnchor: [0, -18],
            }),
            title: spot.name,
            zIndexOffset: 1000,
          }).bindPopup(
            spotPopupHtml({
              name: spot.name,
              why: spot.why,
              expectedSightings: spot.expectedSightings,
              hassleNote: spot.hassleNote,
              parkingNote: spot.parkingNote,
              directionsUrl: spot.directionsUrl,
              color,
              priorityLabel: spot.priorityLabel,
            }),
            {
              className: "planner-popup",
              maxWidth: 320,
              minWidth: 240,
            },
          );

          marker.addTo(mapRef.current!);
          spotMarkerRefs.current[spot.id] = marker;
        });

        // Fit bounds to recommended spots (downtown + Riverside cluster)
        const downtownIds = recommendedSpots
          .filter((spot) => spot.id !== "ponte-vedra-bike")
          .map((spot) => spot.id);
        const bounds = L.latLngBounds(
          downtownIds.map((id) => {
            const spot = recommendedSpots.find((item) => item.id === id)!;
            return [spot.coordinates.lat, spot.coordinates.lng] as [number, number];
          }),
        );
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }

      window.setTimeout(() => mapRef.current?.invalidateSize(), 0);
    }

    setupMap();

    return () => {
      cancelled = true;
    };
  }, []);

  // Discipline polylines
  useEffect(() => {
    let cancelled = false;

    async function draw() {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current) return;

      (Object.keys(layerRefs.current) as Discipline[]).forEach((discipline) => {
        layerRefs.current[discipline]?.remove();
        layerRefs.current[discipline] = null;
      });

      const paths: Record<Discipline, Array<[number, number]>> = {
        swim: swimCoursePath,
        bike: bikeCoursePath,
        run: runCoursePath,
      };

      (Object.keys(paths) as Discipline[]).forEach((discipline) => {
        if (!active[discipline]) return;
        const line = L.polyline(paths[discipline], {
          color: disciplineColors[discipline],
          weight: 6,
          opacity: 0.85,
          lineCap: "round",
          lineJoin: "round",
          dashArray: discipline === "bike" ? "10 8" : undefined,
        }).addTo(mapRef.current!);
        layerRefs.current[discipline] = line;
      });
    }

    draw();

    return () => {
      cancelled = true;
    };
  }, [active]);

  // Parking markers
  const parkingMarkerRefs = useRef<Array<{ remove: () => void }>>([]);
  useEffect(() => {
    let cancelled = false;

    async function draw() {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current) return;

      parkingMarkerRefs.current.forEach((m) => m.remove());
      parkingMarkerRefs.current = [];

      if (!showParking) return;

      parkingSpots.forEach((spot) => {
        const marker = L.marker([spot.coordinates.lat, spot.coordinates.lng], {
          icon: L.divIcon({
            className: "planner-parking-marker-wrapper",
            html: parkingMarkerHtml(),
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -14],
          }),
          title: spot.name,
        }).bindPopup(
          parkingPopupHtml({
            name: spot.name,
            serves: spot.serves,
            note: spot.note,
            directionsUrl: spot.directionsUrl,
          }),
          { className: "planner-popup", maxWidth: 300, minWidth: 220 },
        );
        marker.addTo(mapRef.current!);
        parkingMarkerRefs.current.push(marker);
      });
    }

    draw();

    return () => {
      cancelled = true;
    };
  }, [showParking]);

  // Focus on a specific spot when requested
  useEffect(() => {
    if (!focusId || !mapRef.current) return;
    const marker = spotMarkerRefs.current[focusId];
    if (!marker) return;
    const latLng = marker.getLatLng();
    mapRef.current.setView([latLng.lat, latLng.lng], 15, { animate: true });
    marker.openPopup();
  }, [focusId]);

  useEffect(() => {
    return () => {
      (Object.keys(layerRefs.current) as Discipline[]).forEach((discipline) => {
        layerRefs.current[discipline]?.remove();
      });
      Object.values(spotMarkerRefs.current).forEach((m) => m.remove());
      parkingMarkerRefs.current.forEach((m) => m.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const disciplineList = useMemo(
    () => (["swim", "bike", "run"] as Discipline[]),
    [],
  );

  return (
    <div className="planner-map-wrapper">
      <div
        ref={mapElementRef}
        aria-label="Race course map for IRONMAN Jacksonville"
        className="planner-map"
        role="application"
      />

      <div className="planner-legend" aria-label="Map legend">
        <p className="planner-legend-title">What the colors mean</p>
        <div className="planner-legend-rows">
          {disciplineList.map((discipline) => (
            <label key={discipline} className="planner-legend-row">
              <input
                aria-label={`Show ${disciplineLabels[discipline]}`}
                checked={active[discipline]}
                onChange={(event) =>
                  setActive((prev) => ({ ...prev, [discipline]: event.target.checked }))
                }
                type="checkbox"
              />
              <span
                aria-hidden="true"
                className="planner-legend-swatch"
                style={{
                  background: disciplineColors[discipline],
                  borderStyle: discipline === "bike" ? "dashed" : "solid",
                }}
              />
              <span className="planner-legend-text">{disciplineLabels[discipline]}</span>
            </label>
          ))}
          <label className="planner-legend-row">
            <input
              aria-label="Show parking"
              checked={showParking}
              onChange={(event) => setShowParking(event.target.checked)}
              type="checkbox"
            />
            <span aria-hidden="true" className="planner-legend-parking">P</span>
            <span className="planner-legend-text">Parking near cheer spots</span>
          </label>
          <div className="planner-legend-row planner-legend-row-static">
            <span aria-hidden="true" className="planner-legend-star">★</span>
            <span className="planner-legend-text">Star = recommended cheer spot</span>
          </div>
        </div>
      </div>
    </div>
  );
}
