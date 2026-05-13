import { disciplineColors } from "@/data/raceSpots";

const directionsLink = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

// Google Maps embed pinned at a search query. No API key required and
// always renders street tiles in an iframe — cannot get stuck on
// "Loading race map" in any static-deploy context.
const mapsEmbedSrc = (query: string, zoom = 13) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`;

type KeyLocation = {
  id: string;
  name: string;
  role: string;
  discipline: "swim" | "bike" | "run";
  badgeIcon: string; // emoji
  badgeLabel: string;
  searchQuery: string;
};

const KEY_LOCATIONS: KeyLocation[] = [
  {
    id: "cummer",
    name: "Cummer Art Museum lot",
    role: "Swim morning parking · close to water and transition",
    discipline: "swim",
    badgeIcon: "🅿",
    badgeLabel: "Park here for swim",
    searchQuery: "Cummer Museum of Art and Gardens, 829 Riverside Ave, Jacksonville, FL 32204",
  },
  {
    id: "metro-park",
    name: "Metropolitan Park",
    role: "Swim start · 7:30 AM age-group wave",
    discipline: "swim",
    badgeIcon: "🏊",
    badgeLabel: "Swim start",
    searchQuery: "Metropolitan Park, 64 Gator Bowl Blvd, Jacksonville, FL 32202",
  },
  {
    id: "transition",
    name: "Transition area (near Cummer / Memorial Park)",
    role: "Swim exit + bike start · short walk from Cummer lot",
    discipline: "swim",
    badgeIcon: "🔁",
    badgeLabel: "Transition",
    searchQuery: "Memorial Park, 1620 Riverside Ave, Jacksonville, FL 32204",
  },
  {
    id: "willow-branch",
    name: "Willow Branch Park",
    role: "Run HQ · Ben passes 3 times · shade, easy parking",
    discipline: "run",
    badgeIcon: "⭐",
    badgeLabel: "Run HQ",
    searchQuery: "Willow Branch Park, 2870 Park St, Jacksonville, FL 32205",
  },
  {
    id: "memorial-park",
    name: "Memorial Park",
    role: "Optional run cheer stop · transition-adjacent",
    discipline: "run",
    badgeIcon: "📍",
    badgeLabel: "Run cheer (optional)",
    searchQuery: "Memorial Park, 1620 Riverside Ave, Jacksonville, FL 32204",
  },
  {
    id: "riverfront-plaza",
    name: "Riverfront Plaza",
    role: "Finish line · IRONMAN Village · easy seated viewing",
    discipline: "run",
    badgeIcon: "🏁",
    badgeLabel: "Finish line",
    searchQuery: "Riverfront Plaza, 2 Independent Dr, Jacksonville, FL 32202",
  },
];

const PARKING_OPTIONS = [
  {
    name: "Cummer Art Museum surface lot",
    bestFor: "Swim morning",
    note: "Flat, close to the water and the transition area. This is the lot Cat recommends for the morning — do not use the downtown garages for the swim, the walk is too long.",
    accessibility: "Most accessible · flat walk",
    query: "Cummer Museum of Art and Gardens, 829 Riverside Ave, Jacksonville, FL 32204",
  },
  {
    name: "Willow Branch Park area (street parking)",
    bestFor: "Run cheer · midday onward",
    note: "Side streets around Willow Branch Park. Shaded, flat walking, easy on seniors. Best for staying put while Ben loops past three times.",
    accessibility: "Most accessible · flat walk",
    query: "Willow Branch Park, 2870 Park St, Jacksonville, FL 32205",
  },
  {
    name: "Riverside Arts Market lot (under Fuller Warren Bridge)",
    bestFor: "Backup near Memorial Park / transition",
    note: "Check race-day access before driving in — the lot can be controlled by event ops in the morning.",
    accessibility: "Flat walk if open",
    query: "Riverside Arts Market, 715 Riverside Ave, Jacksonville, FL 32202",
  },
  {
    name: "Water Street Garage",
    bestFor: "Finish line only",
    note: "Closest garage to Riverfront Plaza. Expect slow exit after the race.",
    accessibility: "Elevators + slow garage exit",
    query: "Water Street Garage Jacksonville FL",
  },
  {
    name: "Yates Garage",
    bestFor: "Finish line only",
    note: "A short walk to the finish line. Confirm garage hours race morning.",
    accessibility: "Elevators + slow garage exit",
    query: "Yates Garage Jacksonville FL",
  },
  {
    name: "Jax Center Garage",
    bestFor: "Finish line only",
    note: "Downtown garage option near the IRONMAN Village.",
    accessibility: "Elevators + slow garage exit",
    query: "Jax Center Garage 110 E Bay St Jacksonville FL",
  },
  {
    name: "Duval Street Garage",
    bestFor: "Finish line backup",
    note: "Backup only. Closes at 7 PM — may close before Ben finishes. Use one of the other garages if you can.",
    accessibility: "Elevators + closing time risk",
    query: "Duval Street Garage Jacksonville FL",
  },
];

type ItineraryItem = {
  time: string;
  title: string;
  body: string;
  note?: string;
  accent: "swim" | "bike" | "run" | "info";
};

const ITINERARY: ItineraryItem[] = [
  {
    time: "7:00 AM",
    title: "Park at the Cummer Art Museum lot",
    body: "This is the best parking for the swim morning. It is close to the water and close to the transition area. Do not use the downtown garages for the swim — the walk is too long.",
    note: "FOOD NOTE: The Brooklyn area near the swim start has no cafes — it is office buildings. Eat beforehand or grab something before you head down. Riverside has restaurants but they are not reachable from the riverside walking trail along the swim course.",
    accent: "swim",
  },
  {
    time: "~7:30 AM",
    title: "Watch the swim start",
    body: "Ben starts at Metropolitan Park with the age-group wave. He is a strong swimmer. You will likely see him once from a distance. Don't over-plan the morning around this.",
    accent: "swim",
  },
  {
    time: "~8:00 AM",
    title: "Catch him coming out of the water",
    body: "The transition area is near the Cummer Museum. Worth seeing if you're already parked nearby.",
    accent: "swim",
  },
  {
    time: "~8:30 AM – Midday",
    title: "Break while he bikes",
    body: "Ben bikes 112 miles toward Ponte Vedra and back, twice. This takes several hours. Get lunch. Rest. You do not need to chase the bike.",
    accent: "bike",
  },
  {
    time: "~Midday onward",
    title: "Go to Willow Branch Park",
    body: "This is the most important part of your day. The run course loops through this neighborhood three times. Park at Willow Branch, find a shaded spot, and stay. You will see Ben three times without moving your car.",
    accent: "run",
  },
  {
    time: "After his LAST pass",
    title: "Drive to the finish line",
    body: "When you see him run through Willow Branch for the third time, pack up and drive to Riverfront Plaza. You will get there before him and be in position to see him cross the finish line.",
    accent: "run",
  },
];

const accentColor: Record<ItineraryItem["accent"], string> = {
  swim: disciplineColors.swim,
  bike: disciplineColors.bike,
  run: disciplineColors.run,
  info: "#555",
};

export function SupportPlanner() {
  return (
    <main className="planner-page">
      <header className="planner-hero planner-hero-with-image">
        <div className="planner-hero-image-wrap">
          <img
            alt="Ben's Crew in matching shirts at sunset on the beach"
            className="planner-hero-image"
            src="/assets/bens-crew-shirts-sunset.jpg"
          />
        </div>
        <div className="planner-hero-text">
          <p className="planner-eyebrow">Ben&apos;s Crew · IRONMAN Jacksonville · May 2026</p>
          <h1>Where to go to cheer Ben on</h1>
          <p className="planner-lead">
            This page helps the family and friends plan race day. The map below
            shows the swim, bike, and run in three different colors. The stars
            show the best places to stand and cheer. Tap any star to see why it
            matters, how easy it is, and how to get there.
          </p>
        </div>
      </header>

      <section className="planner-section destination-section" aria-label="Pick a place to cheer">
        <h2>Pick where you&apos;ll be</h2>
        <p className="planner-section-lead">
          Two best choices. Tap one to get driving directions.
        </p>
        <div className="destination-cards">
          <article className="destination-card" style={{ borderColor: disciplineColors.run }}>
            <p className="destination-card-eyebrow" style={{ color: disciplineColors.run }}>
              Willow Branch Park
            </p>
            <h3>Best if you want to see Ben the most</h3>
            <p>He runs past here <strong>3 times</strong> — shade and easy parking.</p>
            <a
              className="destination-card-cta"
              href={directionsLink("Willow Branch Park, 2870 Park St, Jacksonville, FL 32205")}
              rel="noreferrer"
              target="_blank"
            >
              Get directions
            </a>
          </article>

          <article className="destination-card" style={{ borderColor: disciplineColors.run }}>
            <p className="destination-card-eyebrow" style={{ color: disciplineColors.run }}>
              Riverfront Plaza · Finish Line
            </p>
            <h3>Best if you want easy access and less walking</h3>
            <p>Sit, wait, and watch him finish.</p>
            <a
              className="destination-card-cta"
              href={directionsLink("Riverfront Plaza, 2 Independent Dr, Jacksonville, FL 32202")}
              rel="noreferrer"
              target="_blank"
            >
              Get directions
            </a>
          </article>
        </div>
      </section>

      <section className="planner-section itinerary-section" id="itinerary">
        <h2>The plan for race day</h2>
        <p className="planner-section-lead">
          A simple timeline put together by Cat, who knows Jacksonville. Follow
          this order and you&apos;ll see Ben several times without scrambling.
        </p>
        <ol className="itinerary-list">
          {ITINERARY.map((item, idx) => {
            const color = accentColor[item.accent];
            return (
              <li key={idx} className="itinerary-item" style={{ borderColor: color }}>
                <div className="itinerary-time" style={{ color }}>{item.time}</div>
                <h3 className="itinerary-title">{item.title}</h3>
                <p className="itinerary-body">{item.body}</p>
                {item.note ? (
                  <p className="itinerary-note">{item.note}</p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="planner-section" id="map">
        <h2>Map of the race</h2>
        <p className="planner-section-lead">
          Real Jacksonville streets. Pinch to zoom or tap a pin name below to
          open it in Google Maps.
        </p>

        <div className="real-map-frame">
          <iframe
            title="Jacksonville race-day map"
            src={mapsEmbedSrc("Willow Branch Park, Jacksonville, FL", 12)}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <p className="map-orientation-note">
          <strong>Brooklyn area note:</strong> there are no cafes near the swim
          start — eat beforehand.
        </p>

        <p className="map-pins-title">Pins for the day</p>
        <ul className="map-pins-list">
          {KEY_LOCATIONS.map((loc) => {
            const color = disciplineColors[loc.discipline];
            return (
              <li key={loc.id} className="map-pin-card" style={{ borderColor: color }}>
                <div className="map-pin-head">
                  <span
                    aria-hidden="true"
                    className="map-pin-badge"
                    style={{ background: color }}
                  >
                    {loc.badgeIcon}
                  </span>
                  <div>
                    <p className="map-pin-name">{loc.name}</p>
                    <p className="map-pin-role" style={{ color }}>{loc.badgeLabel}</p>
                  </div>
                </div>
                <p className="map-pin-desc">{loc.role}</p>
                <a
                  className="map-pin-link"
                  href={directionsLink(loc.searchQuery)}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open in Google Maps
                </a>
              </li>
            );
          })}
        </ul>

        <p className="map-course-legend">
          <strong>Course colors:</strong>{" "}
          <span style={{ color: disciplineColors.swim }}>● Swim</span> from
          Metropolitan Park to the transition near Cummer ·{" "}
          <span style={{ color: disciplineColors.bike }}>● Bike</span> out
          toward Ponte Vedra and back, twice ·{" "}
          <span style={{ color: disciplineColors.run }}>● Run</span> 3 laps
          through Riverside, Willow Branch, downtown, and the Riverwalk.
        </p>
      </section>

      <section className="planner-section parking-section">
        <h2>Where to park</h2>
        <p className="planner-section-lead">
          The right lot depends on what time of day you&apos;re going and how
          much walking you&apos;re up for.
        </p>
        <ul className="parking-list">
          {PARKING_OPTIONS.map((p) => (
            <li key={p.name} className="parking-card">
              <h3>{p.name}</h3>
              <p className="parking-card-serves">
                <strong>Best for:</strong> {p.bestFor}
              </p>
              <p className="parking-card-note">{p.note}</p>
              <p className="parking-card-access">
                <strong>Accessibility:</strong> {p.accessibility}
              </p>
              <a
                className="spot-card-button"
                href={directionsLink(p.query)}
                rel="noreferrer"
                target="_blank"
              >
                Get directions
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="planner-section planner-finish-image">
        <figure>
          <img
            alt="Ben with family after the race, medal around his neck on the beach"
            className="planner-finish-image-img"
            src="/assets/medal-portrait.jpg"
          />
          <figcaption>
            The whole point. Get the crew to the finish — Ben earns the medal,
            you earn the photo.
          </figcaption>
        </figure>
      </section>

      <section className="planner-section">
        <details className="race-facts-accordion">
          <summary>
            <span className="race-facts-summary-title">What is an Ironman?</span>
            <span className="race-facts-summary-hint">Tap to expand</span>
          </summary>
          <div className="race-facts-grid">
            <article className="race-fact" style={{ borderColor: disciplineColors.swim }}>
              <p className="race-fact-eyebrow" style={{ color: disciplineColors.swim }}>
                Swim
              </p>
              <p className="race-fact-big">2.4 miles</p>
              <p className="race-fact-line">Starts at 7:30 AM (age-group start)</p>
              <p className="race-fact-line">
                Point-to-point in the St Johns River, from Metropolitan Park up
                to the transition area near the Cummer Museum.
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
            </article>
          </div>
        </details>
      </section>

      <section className="planner-section planner-footer-note">
        <h2>Want to do more than cheer?</h2>
        <p>
          On race day, the live tracking and check-in tools are on the{" "}
          <a href="./race-day/">live race-day app</a>. You can leave this
          page open for the plan and open the live app when the race starts.
        </p>
      </section>
    </main>
  );
}
