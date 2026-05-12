"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { mapCategoryMeta, mapPoints } from "@/data/mapPoints";
import type { MapCategory, MapPoint } from "@/types/map";
import type { LayerGroup, Map as LeafletMap } from "leaflet";

const categoryIds = Object.keys(mapCategoryMeta) as MapCategory[];

const initialCategories = categoryIds.reduce(
  (active, category) => ({
    ...active,
    [category]: true,
  }),
  {} as Record<MapCategory, boolean>,
);

const jacksonvilleCenter = {
  lat: 30.321,
  lng: -81.672,
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function popupHtml(point: MapPoint) {
  const category = mapCategoryMeta[point.category];
  const mapsLink = point.googleMapsUrl
    ? `<a class="map-popup-link" href="${escapeHtml(point.googleMapsUrl)}" target="_blank" rel="noreferrer">Open in Google Maps</a>`
    : "";

  return `
    <div class="map-popup-card">
      <p class="map-popup-type" style="color: ${category.color}">${escapeHtml(point.type)}</p>
      <h3>${escapeHtml(point.name)}</h3>
      <p>${escapeHtml(point.description)}</p>
      <dl>
        <dt>Mobility</dt>
        <dd>${escapeHtml(point.mobilityNotes)}</dd>
        <dt>Best time</dt>
        <dd>${escapeHtml(point.bestTime)}</dd>
      </dl>
      ${mapsLink}
    </div>
  `;
}

function setAllCategories(isActive: boolean) {
  return categoryIds.reduce(
    (active, category) => ({
      ...active,
      [category]: isActive,
    }),
    {} as Record<MapCategory, boolean>,
  );
}

export function SpectatorMap() {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const hasFitInitialBoundsRef = useRef(false);
  const [activeCategories, setActiveCategories] = useState(initialCategories);

  const visiblePoints = useMemo(
    () => mapPoints.filter((point) => activeCategories[point.category]),
    [activeCategories],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      const L = await import("leaflet");

      if (cancelled || !mapElementRef.current) {
        return;
      }

      if (!mapRef.current) {
        mapRef.current = L.map(mapElementRef.current, {
          center: [jacksonvilleCenter.lat, jacksonvilleCenter.lng],
          zoom: 12,
          scrollWheelZoom: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(mapRef.current);

        layerRef.current = L.layerGroup().addTo(mapRef.current);
      }

      layerRef.current?.clearLayers();
      const bounds = L.latLngBounds([]);

      visiblePoints.forEach((point) => {
        const category = mapCategoryMeta[point.category];
        const marker = L.marker([point.coordinates.lat, point.coordinates.lng], {
          icon: L.divIcon({
            className: "spectator-marker",
            html: `<span style="background: ${category.color}"></span>`,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            popupAnchor: [0, -18],
          }),
          title: point.name,
        }).bindPopup(popupHtml(point), {
          className: "spectator-popup",
          maxWidth: 320,
          minWidth: 260,
        });

        marker.addTo(layerRef.current!);
        bounds.extend(marker.getLatLng());
      });

      if (visiblePoints.length > 0 && !hasFitInitialBoundsRef.current) {
        mapRef.current.fitBounds(bounds, {
          maxZoom: 13,
          padding: [28, 28],
        });
        hasFitInitialBoundsRef.current = true;
      }

      window.setTimeout(() => mapRef.current?.invalidateSize(), 0);
    }

    loadMap();

    return () => {
      cancelled = true;
    };
  }, [visiblePoints]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      hasFitInitialBoundsRef.current = false;
    };
  }, []);

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-3 shadow-soft sm:p-4">
      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <div className="rounded-md border border-ink/10 bg-paper p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-ink">Map filters</h2>
              <p className="mt-1 text-sm leading-6 text-ink/70">
                {visiblePoints.length} of {mapPoints.length} markers visible
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                className="focus-ring rounded-md border border-ink/15 bg-white px-2.5 py-2 text-xs font-black text-ink"
                type="button"
                onClick={() => setActiveCategories(setAllCategories(true))}
              >
                All
              </button>
              <button
                className="focus-ring rounded-md border border-ink/15 bg-white px-2.5 py-2 text-xs font-black text-ink"
                type="button"
                onClick={() => setActiveCategories(setAllCategories(false))}
              >
                None
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1">
            {categoryIds.map((category) => {
              const meta = mapCategoryMeta[category];
              const isActive = activeCategories[category];

              return (
                <button
                  key={category}
                  aria-pressed={isActive}
                  className="focus-ring min-h-12 rounded-md border px-3 py-2 text-left text-sm font-black leading-tight transition"
                  style={{
                    backgroundColor: isActive ? meta.color : "#FFFFFF",
                    borderColor: meta.color,
                    color: isActive ? "#FFFFFF" : "#17202A",
                  }}
                  type="button"
                  onClick={() =>
                    setActiveCategories((current) => ({
                      ...current,
                      [category]: !current[category],
                    }))
                  }
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-ink/10 bg-paper">
          <div
            ref={mapElementRef}
            aria-label="Interactive spectator map for IRONMAN Jacksonville"
            className="h-[62vh] min-h-[420px] w-full"
            role="application"
          />
        </div>
      </div>
    </section>
  );
}
