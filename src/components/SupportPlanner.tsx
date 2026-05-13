"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlannerMap } from "@/components/PlannerMap";
import {
  disciplineColors,
  parkingSpots,
  recommendedSpots,
  type Discipline,
} from "@/data/raceSpots";

const hassleLabels: Record<1 | 2 | 3, string> = {
  1: "Low hassle",
  2: "Some walking",
  3: "Harder trip",
};

function HassleDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span aria-label={hassleLabels[level]} className="dot-row">
      <span className={`dot ${level >= 1 ? "dot-on" : ""}`} aria-hidden="true" />
      <span className={`dot ${level >= 2 ? "dot-on" : ""}`} aria-hidden="true" />
      <span className={`dot ${level >= 3 ? "dot-on" : ""}`} aria-hidden="true" />
    </span>
  );
}

const disciplineWordmark: Record<Discipline, string> = {
  swim: "Swim",
  bike: "Bike",
  run: "Run",
};

export function SupportPlanner() {
  const [focusId, setFocusId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sortedSpots = [...recommendedSpots].sort((a, b) => a.priority - b.priority);

  return (
    <main className="planner-page">
      <header className="planner-hero">
        <p className="planner-eyebrow">Ben&apos;s Crew · IRONMAN Jacksonville · Nov 2026</p>
        <h1>Where to go to cheer Ben on</h1>
        <p className="planner-lead">
          This page helps the family and friends plan race day. The map below
          shows the swim, bike, and run in three different colors. The stars
          show the best places to stand and cheer. Tap any star to see why it
          matters, how easy it is, and how to get there.
        </p>
        <div className="planner-hero-actions">
          <a className="planner-cta" href="#map">See the map</a>
          <a className="planner-cta planner-cta-secondary" href="#spots">
            See recommended spots
          </a>
          <Link className="planner-cta planner-cta-secondary" href="/race-day">
            Open live race-day app
          </Link>
        </div>
      </header>

      <section className="planner-section planner-key-idea">
        <h2>The one thing to remember</h2>
        <p>
          Ben is a fast swimmer but the run is when he needs the most
          encouragement. The run goes through the same neighborhood{" "}
          <strong>three times</strong>. So picking a spot on the run is the
          best way to spend your cheering time — you will see him over and
          over, and your shouts will help him most.
        </p>
      </section>

      <section className="planner-section" id="map">
        <h2>Map of the race</h2>
        <p className="planner-section-lead">
          Each part of the race is in its own color. Stars mark the best places
          to cheer. <strong>P</strong> markers show parking near cheer spots.
          Use the checkboxes on the legend to hide or show layers.
        </p>
        {isMounted ? (
          <PlannerMap focusId={focusId} />
        ) : (
          <div className="planner-map-loading">
            <p>Loading race map…</p>
          </div>
        )}
      </section>

      <section className="planner-section" id="spots">
        <h2>Recommended places to cheer</h2>
        <p className="planner-section-lead">
          Pick one or two spots based on who is in your group and how much
          walking you want to do. The list is ordered with the best picks
          first.
        </p>

        <ol className="spot-list">
          {sortedSpots.map((spot) => {
            const color = disciplineColors[spot.discipline];
            return (
              <li key={spot.id} className="spot-card">
                <div className="spot-card-header">
                  <span
                    className="spot-card-badge"
                    style={{ background: color }}
                  >
                    {disciplineWordmark[spot.discipline]}
                  </span>
                  <h3>{spot.name}</h3>
                </div>
                <p className="spot-card-priority" style={{ color }}>
                  {spot.priorityLabel}
                </p>
                <p className="spot-card-why">{spot.why}</p>

                <dl className="spot-card-facts">
                  <div>
                    <dt>Expected Ben sightings</dt>
                    <dd>
                      <span className="big-number">{spot.expectedSightings}</span>
                      {spot.expectedSightings === 1 ? " sighting" : " sightings"}
                    </dd>
                  </div>
                  <div>
                    <dt>How hard is it?</dt>
                    <dd>
                      <HassleDots level={spot.hassle} /> {hassleLabels[spot.hassle]}
                      <p className="spot-card-subnote">{spot.hassleNote}</p>
                    </dd>
                  </div>
                  <div>
                    <dt>Parking</dt>
                    <dd>{spot.parkingNote}</dd>
                  </div>
                </dl>

                <div className="spot-card-actions">
                  <a
                    className="spot-card-button spot-card-button-primary"
                    href={spot.directionsUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Get driving directions
                  </a>
                  <a
                    className="spot-card-button"
                    href="#map"
                    onClick={() => setFocusId(spot.id)}
                  >
                    Show on map
                  </a>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="planner-section">
        <h2>Parking near the best cheer spots</h2>
        <p className="planner-section-lead">
          These are the closest places to park. Garage hours and race-day
          access can change, so double-check before you drive in.
        </p>
        <ul className="parking-list">
          {parkingSpots.map((spot) => (
            <li key={spot.id} className="parking-card">
              <h3>{spot.name}</h3>
              <p className="parking-card-serves">
                <strong>Best for:</strong> {spot.serves}
              </p>
              <p className="parking-card-note">{spot.note}</p>
              <a
                className="spot-card-button"
                href={spot.directionsUrl}
                rel="noreferrer"
                target="_blank"
              >
                Get directions
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="planner-section planner-race-facts">
        <h2>What happens on race day</h2>
        <p className="planner-section-lead">
          Here is the race in plain English so you can plan your day.
        </p>
        <div className="race-facts-grid">
          <article className="race-fact" style={{ borderColor: disciplineColors.swim }}>
            <p className="race-fact-eyebrow" style={{ color: disciplineColors.swim }}>
              Swim
            </p>
            <p className="race-fact-big">2.4 miles</p>
            <p className="race-fact-line">Starts at 7:30 AM (age-group start)</p>
            <p className="race-fact-line">
              Point-to-point in the St Johns River, from Metropolitan Park up
              to Post St dock near Memorial Park.
            </p>
            <p className="race-fact-note">
              Ben is fast in the water. You will likely only see him once and
              from far away — don&apos;t over-plan the morning around this.
            </p>
          </article>

          <article className="race-fact" style={{ borderColor: disciplineColors.bike }}>
            <p className="race-fact-eyebrow" style={{ color: disciplineColors.bike }}>
              Bike
            </p>
            <p className="race-fact-big">112 miles · 2 laps</p>
            <p className="race-fact-line">
              Out toward Ponte Vedra Beach and back, twice.
            </p>
            <p className="race-fact-note">
              He passes any given spot once at high speed. Bike cheering is the
              hardest to time and gives the fewest sightings — only do this if
              a small group really wants the adventure.
            </p>
          </article>

          <article className="race-fact" style={{ borderColor: disciplineColors.run }}>
            <p className="race-fact-eyebrow" style={{ color: disciplineColors.run }}>
              Run
            </p>
            <p className="race-fact-big">26.2 miles · 3 laps</p>
            <p className="race-fact-line">
              Through downtown, the Riverwalk, Memorial Park, Riverside, Five
              Points, and Willow Branch — three times.
            </p>
            <p className="race-fact-note">
              <strong>This is where you matter most.</strong> Pick a spot on
              the run loop and you will see Ben come past you up to three times.
            </p>
          </article>
        </div>
      </section>

      <section className="planner-section planner-footer-note">
        <h2>Want to do more than cheer?</h2>
        <p>
          On race day, the live tracking and check-in tools are on the{" "}
          <Link href="/race-day">live race-day app</Link>. You can leave this
          page open for the plan and open the live app when the race starts.
        </p>
      </section>
    </main>
  );
}
