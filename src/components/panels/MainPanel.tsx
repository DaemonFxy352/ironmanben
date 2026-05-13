"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UpdatesFeed } from "./UpdatesFeed";
import { CrewPanel } from "./CrewPanel";
import { LayersPanel, type MapLayer } from "./LayersPanel";
import type { RaceUpdate } from "@/types/raceUpdate";
import type { CheckIn } from "@/types/checkIn";
import { quickBroadcasts } from "@/hooks/useQuickSync";
import type { QuickBroadcastTemplate } from "@/types/message";

type PanelTab = "main" | "updates" | "crew" | "layers";

interface MainPanelProps {
  updates: RaceUpdate[];
  checkIns: CheckIn[];
  onQuickBroadcast?: (template: QuickBroadcastTemplate) => void;
  sendingQuickKind?: string | null;
  isConfigured?: boolean;
  activeLayers?: Set<MapLayer>;
  onToggleLayer?: (layer: MapLayer) => void;
}

export function MainPanel({
  updates,
  checkIns,
  onQuickBroadcast,
  sendingQuickKind,
  isConfigured = true,
  activeLayers = new Set(["route", "family"]),
  onToggleLayer = () => {},
}: MainPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>("main");

  return (
    <div className="space-y-4">
      {/* Tab Selector */}
      <Card className="!p-0">
        <div className="grid grid-cols-4 gap-0">
          {[
            { id: "main" as const, label: "Home" },
            { id: "updates" as const, label: "Updates" },
            { id: "crew" as const, label: "Crew" },
            { id: "layers" as const, label: "Layers" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-sm font-bold uppercase tracking-wide transition-all border-b-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                activeTab === tab.id
                  ? "border-accent-warm text-accent-warm"
                  : "border-transparent text-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === "main" && (
        <>
          {/* What's Next Section */}
          <Card>
            <div className="mb-3">
              <div className="text-[13px] uppercase text-muted font-bold tracking-wide mb-1">
                What&apos;s Next
              </div>
              <h2 className="text-xl font-bold text-primary-text">
                Task Checklist
              </h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-3 py-2">
                <input
                  type="checkbox"
                  className="mt-0.5 w-5 h-5 rounded border-border accent-primary"
                  id="task1"
                />
                <label htmlFor="task1" className="text-base text-primary-text leading-snug">
                  Get to Memorial Park by swim start
                </label>
              </div>
              <div className="flex items-start gap-3 py-2">
                <input
                  type="checkbox"
                  className="mt-0.5 w-5 h-5 rounded border-border accent-primary"
                  id="task2"
                />
                <label htmlFor="task2" className="text-base text-primary-text leading-snug">
                  Check in with crew location sync
                </label>
              </div>
              <div className="flex items-start gap-3 py-2">
                <input
                  type="checkbox"
                  className="mt-0.5 w-5 h-5 rounded border-border accent-primary"
                  id="task3"
                />
                <label htmlFor="task3" className="text-base text-primary-text leading-snug">
                  Move to finish line when Ben hits final 5K
                </label>
              </div>
            </div>
          </Card>

          {/* Quick Sync Section */}
          <Card>
            <div className="mb-3">
              <div className="text-[13px] uppercase text-muted font-bold tracking-wide">
                Quick Sync
              </div>
            </div>
            <div className="space-y-2">
              {quickBroadcasts.map((template) => {
                const isSending = sendingQuickKind === template.kind;
                const isDanger = template.kind === "help_water";

                return (
                  <Button
                    key={template.kind}
                    variant={isDanger ? "danger" : "primary"}
                    onClick={() => onQuickBroadcast?.(template)}
                    disabled={!isConfigured || Boolean(sendingQuickKind)}
                  >
                    {isSending ? "Sending..." : template.label}
                  </Button>
                );
              })}
            </div>
          </Card>

          {/* Meetup Point Section */}
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] uppercase text-muted font-bold tracking-wide mb-1">
                  Meetup Point
                </div>
                <h3 className="text-lg font-bold text-primary-text">
                  Memorial Park
                </h3>
                <p className="text-sm text-muted mt-1">
                  If separated, go here
                </p>
              </div>
              <Button
                variant="secondary"
                fullWidth={false}
                className="px-6 shrink-0"
                onClick={() => {
                  window.open(
                    "https://maps.apple.com/?q=Memorial+Park+Jacksonville+FL",
                    "_blank"
                  );
                }}
              >
                Directions
              </Button>
            </div>
          </Card>
        </>
      )}

      {activeTab === "updates" && <UpdatesFeed updates={updates} />}

      {activeTab === "crew" && <CrewPanel checkIns={checkIns} />}

      {activeTab === "layers" && (
        <LayersPanel activeLayers={activeLayers} onToggleLayer={onToggleLayer} />
      )}
    </div>
  );
}
