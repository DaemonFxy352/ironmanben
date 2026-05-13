"use client";

import { StatusBar } from "@/components/StatusBar";
import { ActionBar } from "@/components/ActionBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ShellPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Status Bar - Fixed top */}
      <StatusBar />

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

        {/* Main Panel - Scrollable content */}
        <div className="overflow-y-auto px-4 py-6 space-y-4">
          {/* What's Next Section */}
          <Card>
            <div className="mb-3">
              <div className="text-[13px] uppercase text-muted font-bold tracking-wide mb-1">
                PIT WALL — What&apos;s Next
              </div>
              <h2 className="text-xl font-bold text-primary-text">
                Task Checklist for Crew
              </h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-border"
                  id="task1"
                />
                <label htmlFor="task1" className="text-base text-primary-text">
                  Get to Memorial Park by 8:30 AM
                </label>
              </div>
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-border"
                  id="task2"
                />
                <label htmlFor="task2" className="text-base text-primary-text">
                  Check crew location sync
                </label>
              </div>
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-border"
                  id="task3"
                />
                <label htmlFor="task3" className="text-base text-primary-text">
                  Bring water and snacks
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
              <Button variant="primary" onClick={() => alert("Quick sync: I'm at Memorial Park")}>
                I&apos;m at Memorial Park 📍
              </Button>
              <Button variant="primary" onClick={() => alert("Quick sync: Heading over")}>
                Heading Over 🚗
              </Button>
              <Button variant="danger" onClick={() => alert("Quick sync: Need help/water")}>
                Need Help / Water 🆘
              </Button>
            </div>
          </Card>

          {/* Meetup Point Section */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex-1">
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
                className="px-6"
                onClick={() => alert("Opening directions")}
              >
                Directions
              </Button>
            </div>
          </Card>

          {/* Extra content to demonstrate scrolling */}
          <Card>
            <h3 className="font-bold text-primary-text mb-2">Updates Feed</h3>
            <p className="text-sm text-muted">
              Recent updates from crew members will appear here...
            </p>
          </Card>

          <Card>
            <h3 className="font-bold text-primary-text mb-2">Crew Locations</h3>
            <p className="text-sm text-muted">
              Family member check-ins will appear here...
            </p>
          </Card>
        </div>
      </div>

      {/* Action Bar - Fixed bottom */}
      <ActionBar
        onCheckIn={() => alert("Check In clicked")}
        onSawBen={() => alert("Saw Ben clicked")}
        onCenterMap={() => alert("Center Map clicked")}
      />
    </div>
  );
}
