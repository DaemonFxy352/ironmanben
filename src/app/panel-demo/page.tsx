"use client";

import { useState, useCallback } from "react";
import { StatusBar } from "@/components/StatusBar";
import { ActionBar } from "@/components/ActionBar";
import { MainPanel } from "@/components/panels/MainPanel";
import { useRaceUpdates } from "@/hooks/useRaceUpdates";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useQuickSync, quickBroadcasts } from "@/hooks/useQuickSync";
import type { QuickBroadcastTemplate } from "@/types/message";
import type { MapLayer } from "@/components/panels/LayersPanel";
import Toast from "@/components/Toast";

export default function PanelDemoPage() {
  const [sendingQuickKind, setSendingQuickKind] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<MapLayer>>(
    new Set(["route", "family"])
  );
  const [toast, setToast] = useState({ message: "", visible: false });
  const [pulseEmoji, setPulseEmoji] = useState(false);

  // Wire up Supabase realtime hooks
  const { updates, isConfigured: updatesConfigured } = useRaceUpdates();
  const { checkIns, isConfigured: checkInsConfigured } = useCheckIns();
  const { sendQuickBroadcast, isConfigured: quickSyncConfigured } = useQuickSync();

  const isConfigured = updatesConfigured && checkInsConfigured && quickSyncConfigured;

  const handleQuickBroadcast = useCallback(
    async (template: QuickBroadcastTemplate) => {
      if (!isConfigured) {
        alert("Supabase is not configured. Check your .env.local file.");
        return;
      }

      setSendingQuickKind(template.kind);

      try {
        const author =
          typeof window !== "undefined"
            ? window.localStorage.getItem("crew_name") ||
              window.localStorage.getItem("ironmanben-family-name") ||
              "Family"
            : "Family";

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

  return (
    <div className="min-h-screen bg-background">
      {/* Status Bar - Fixed top */}
      <StatusBar pulseEmoji={pulseEmoji} />

      {/* Main Content - Below status bar, above action bar */}
      <div className="pt-[100px] pb-[100px]">
        {/* Map Section - 35% viewport height */}
        <div className="h-[35vh] bg-muted/20 border-b border-border relative">
          <div className="absolute inset-0 flex items-center justify-center text-muted">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <div className="text-sm font-semibold">Map goes here</div>
              <div className="text-xs mt-1">Light CARTO tiles, 35vh height</div>
            </div>
          </div>
        </div>

        {/* Main Panel - Scrollable content with realtime data */}
        <div className="overflow-y-auto px-4 py-6">
          {!isConfigured && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-xl text-yellow-900">
              <p className="font-bold">⚠️ Supabase Not Configured</p>
              <p className="text-sm mt-1">
                Add your Supabase credentials to .env.local to see realtime updates.
              </p>
            </div>
          )}

          {/* Demo controls */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="font-bold text-primary-text mb-2">🎭 Demo Controls</p>
            <button
              onClick={() => setPulseEmoji(true)}
              className="px-4 py-2 bg-primary text-primary-text rounded-lg font-semibold text-sm"
            >
              Pulse Stage Emoji
            </button>
          </div>

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

      {/* Action Bar - Fixed bottom */}
      <ActionBar
        onCheckIn={() => alert("Check In sheet will open here")}
        onSawBen={() => alert("Saw Ben sheet will open here")}
        onCenterMap={() => alert("Map will center on your location")}
      />

      {/* Toast notifications */}
      <Toast
        message={toast.message}
        visible={toast.visible}
        onDismiss={() => setToast((current) => ({ ...current, visible: false }))}
      />
    </div>
  );
}
