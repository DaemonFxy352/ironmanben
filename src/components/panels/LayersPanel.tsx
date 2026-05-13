"use client";

import { Card } from "@/components/ui/Card";

export type MapLayer = "route" | "family" | "parking" | "mobility";

interface LayerOption {
  id: MapLayer;
  label: string;
  description: string;
}

const LAYER_OPTIONS: LayerOption[] = [
  {
    id: "route",
    label: "Route",
    description: "Ben's course path (swim, bike, run)",
  },
  {
    id: "family",
    label: "Family",
    description: "Crew location dots from check-ins",
  },
  {
    id: "parking",
    label: "Parking",
    description: "Parking locations and garages",
  },
  {
    id: "mobility",
    label: "Mobility",
    description: "Accessible viewing spots and paths",
  },
];

interface LayersPanelProps {
  activeLayers: Set<MapLayer>;
  onToggleLayer: (layer: MapLayer) => void;
}

export function LayersPanel({ activeLayers, onToggleLayer }: LayersPanelProps) {
  return (
    <div className="space-y-3">
      <div className="px-1">
        <h3 className="text-sm font-bold text-muted uppercase tracking-wide">
          Map Layers
        </h3>
        <p className="text-sm text-muted mt-1">
          Control what&apos;s visible on the map
        </p>
      </div>

      <Card>
        <div className="space-y-4">
          {LAYER_OPTIONS.map((layer) => {
            const isActive = activeLayers.has(layer.id);

            return (
              <div key={layer.id} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="font-bold text-primary-text">{layer.label}</div>
                  <div className="text-sm text-muted mt-0.5">{layer.description}</div>
                </div>

                {/* iOS-style toggle switch */}
                <button
                  onClick={() => onToggleLayer(layer.id)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isActive ? "bg-primary" : "bg-muted/30"
                  }`}
                  role="switch"
                  aria-checked={isActive}
                  aria-label={`Toggle ${layer.label} layer`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
