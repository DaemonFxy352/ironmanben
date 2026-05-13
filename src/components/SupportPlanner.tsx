import { disciplineColors } from "@/data/raceSpots";

const directionsLink = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

// Map corridor: Willow Branch (W) to a touch east of Metropolitan Park (E),
// Riverfront/Metro Park (N) to Riverside (S). Locked bbox keeps the OSM
// tile iframe from drifting and lets our SVG overlay align with streets.
const MAP_BBOX = {
  west: -81.7,
  east: -81.63,
  north: 30.33,
  south: 30.305,
};

// OSM export/embed renders a static-looking street tile view of the bbox.
// We disable pointer events on the iframe (in CSS) so the SVG overlay
// remains aligned and users navigate via the pin links below.
const osmEmbedSrc = (() => {
  const { west, south, east, north } = MAP_BBOX;
  const bbox = `${west}%2C${south}%2C${east}%2C${north}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
})();

const VIEW_W = 800;
const VIEW_H = 340;

const project = (lat: number, lng: number) => {
  const x =
    ((lng - MAP_BBOX.west) / (MAP_BBOX.east - MAP_BBOX.west)) * VIEW_W;
  const y =
    ((MAP_BBOX.north - lat) / (MAP_BBOX.north - MAP_BBOX.south)) * VIEW_H;
  return { x, y };
};

const toPoints = (coords: Array<[number, number]>) =>
  coords
    .map(([lat, lng]) => {
      const { x, y } = project(lat, lng);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

// Swim: Metropolitan Park to the Cummer Museum / transition area, following
// the St. Johns River's curve.
const SWIM_PATH: Array<[number, number]> = [
  [30.3234, -81.6378], // Metropolitan Park start
  [30.3232, -81.65],
  [30.321, -81.658],
  [30.317, -81.665],
  [30.318, -81.675],
  [30.3221, -81.6831], // Cummer Museum end
];

// Run: 3-lap loop through Riverside, Willow Branch, downtown, and the Riverwalk.
// Drawn as a single representative loop polyline that visibly threads
// Willow Branch and the Riverwalk.
const RUN_PATH: Array<[number, number]> = [
  [30.3121, -81.6819], // Memorial Park / T2
  [30.3115, -81.69],
  [30.3099, -81.6945], // Willow Branch Park
  [30.3055, -81.6925],
  [30.3072, -81.685],
  [30.3095, -81.677],
  [30.3142, -81.671],
  [30.319, -81.6675],
  [30.3229, -81.6667], // Downtown Riverwalk
  [30.3254, -81.6591], // Riverfront Plaza finish
  [30.324, -81.6655],
  [30.321, -81.672],
  [30.3175, -81.6775],
  [30.3148, -81.681],
  [30.3121, -81.6819], // back to Memorial Park
];

type KeyLocation = {
  id: string;
  name: string;
  role: string;
  discipline: "swim" | "bike" | "run";
  badgeIcon: string;
  badgeLabel: string;
  searchQuery: string;
  lat: number;
  lng: number;
};

const KEY_LOCATIONS: KeyLocation[] = [
  {
    id: "cummer",
    name: "Cummer Art Museum lot",
    role: "Swim morning parking · close to water and transition",
    discipline: "swim",
    badgeIcon: "P",
    badgeLabel: "Park here for swim",
    searchQuery:
      "Cummer Museum of Art and Gardens, 829 Riverside Ave, Jacksonville, FL 32204",
    lat: 30.3221,
    lng: -81.6831,
  },
  {
    id: "metro-park",
    name: "Metropolitan Park",
    role: "Swim start · 7:30 AM age-group wave",
    discipline: "swim",
    badgeIcon: "S",
    badgeLabel: "Swim start",
    searchQuery: "Metropolitan Park, 64 Gator Bowl Blvd, Jacksonville, FL 32202",
    lat: 30.3234,
    lng: -81.6378,
  },
  {
    id: "transition",
    name: "Transition area (near Cummer / Memorial Park)",
    role: "Swim exit + bike start · short walk from Cummer lot",
    discipline: "swim",
    badgeIcon: "T",
    badgeLabel: "Transition",
    searchQuery: "Memorial Park, 1620 Riverside Ave, Jacksonville, FL 32204",
    lat: 30.3121,
    lng: -81.6819,
  },
  {
    id: "willow-branch",
    name: "Willow Branch Park",
    role: "Run HQ · Ben passes 3 times · shade, easy parking",
    discipline: "run",
    badgeIcon: "★",
    badgeLabel: "Run HQ",
    searchQuery: "Willow Branch Park, 2870 Park St, Jacksonville, FL 32205",
    lat: 30.3099,
    lng: -81.6945,
  },
  {
    id: "memorial-park",
    name: "Memorial Park",
    role: "Optional run cheer stop · transition-adjacent",
    discipline: "run",
    badgeIcon: "M",
    badgeLabel: "Run cheer (optional)",
    searchQuery: "Memorial Park, 1620 Riverside Ave, Jacksonville, FL 32204",
    lat: 30.3121,
    lng: -81.6819,
  },
  {
    id: "riverfront-plaza",
    name: "Riverfront Plaza",
    role: "Finish line · IRONMAN Village · easy seated viewing",
    discipline: "run",
    badgeIcon: "F",
    badgeLabel: "Finish line",
    searchQuery: "Riverfront Plaza, 2 Independent Dr, Jacksonville, FL 32202",
    lat: 30.3254,
    lng: -81.6591,
  },
];

const SWIM_FOOD_WARNING =
  "There are no cafes or restaurants along the riverside walking path where you will be watching the swim. This path runs through Brooklyn and into Riverside along the water. Riverside has restaurants but they are not on or near this walking trail. Eat beforehand or grab something before you head to the water.";

const PARKING_OPTIONS = [
  {
    name: "Cummer Art Museum surface lot",
    bestFor: "Swim morning",
    note: "Flat, close to the water and the transition area just past the museum. This is the lot Cat recommends for the morning — do not use the downtown garages for the swim, the walk is too long.",
    accessibility: "Most accessible · flat walk",
    query:
      "Cummer Museum of Art and Gardens, 829 Riverside Ave, Jacksonville, FL 32204",
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
    body: "This is the best parking for the swim morning. The transition area is just past the museum, near Memorial Park, and the riverside walking path is right there. Do not use the downtown garages for the swim — the walk is too long.",
    note: `FOOD NOTE: ${SWIM_FOOD_WARNING}`,
    accent: "swim",
  },
  {
    time: "~7:30 AM",
    title: "Watch the swim start",
    body: "Ben starts at Metropolitan Park, across the St. Johns River. From the riverside walking path through Brooklyn and Riverside you can see the swim unfold on the water. He is a strong swimmer — you will likely see him once from a distance. Don't over-plan the morning around this.",
    accent: "swim",
  },
  {
    time: "~8:00 AM",
    title: "Catch him coming out of the water",
    body: "The swim ends near the Cummer Museum of Art and Gardens. The transition area is just past the Cummer, at or near Memorial Park. Worth seeing if you're already parked nearby.",
    accent: "swim",
  },
  {
    time: "~8:30 AM – Midday",
    title: "Break while he bikes",
    body: "Ben bikes 112 miles southeast toward Ponte Vedra Beach and back, twice. This takes several hours. Get lunch. Rest. You do not need to chase the bike.",
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

function CorridorMap() {
  const swimPoints = toPoints(SWIM_PATH);
  const runPoints = toPoints(RUN_PATH);

  // Bike: arrow leaving the transition area heading southeast off-frame.
  const t = project(30.3121, -81.6819);
  const bikeStart = { x: t.x + 6, y: t.y + 6 };
  const bikeEnd = { x: VIEW_W - 10, y: VIEW_H - 10 };

  return (
    <div className="corridor-map">
      <div className="corridor-map-frame">
        <iframe
          title="OpenStreetMap of Brooklyn, Riverside, and downtown Jacksonville race corridor"
          src={osmEmbedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="corridor-map-tiles"
        />
        <svg
          aria-label="Race-day routes and pins"
          className="corridor-map-overlay"
          preserveAspectRatio="none"
          role="img"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker
              id="bikeArrow"
              markerHeight="10"
              markerWidth="10"
              orient="auto"
              refX="6"
              refY="5"
              viewBox="0 0 10 10"
            >
              <path d="M0,0 L10,5 L0,10 z" fill={disciplineColors.bike} />
            </marker>
          </defs>

          {/* Swim — blue line along the St. Johns River */}
          <polyline
            fill="none"
            points={swimPoints}
            stroke="#ffffff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="10"
            opacity="0.85"
          />
          <polyline
            fill="none"
            points={swimPoints}
            stroke={disciplineColors.swim}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="6"
          />

          {/* Run — orange 3-lap loop (drawn as one loop for clarity) */}
          <polyline
            fill="none"
            points={runPoints}
            stroke="#ffffff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="11"
            opacity="0.85"
          />
          <polyline
            fill="none"
            points={runPoints}
            stroke={disciplineColors.run}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="7"
          />
          {/* Lap badge near Willow Branch to communicate "3 laps" */}
          {(() => {
            const w = project(30.3099, -81.6945);
            return (
              <g>
                <circle
                  cx={w.x - 22}
                  cy={w.y + 22}
                  fill="#ffffff"
                  r="14"
                  stroke={disciplineColors.run}
                  strokeWidth="3"
                />
                <text
                  fill={disciplineColors.run}
                  fontSize="14"
                  fontWeight="900"
                  textAnchor="middle"
                  x={w.x - 22}
                  y={w.y + 27}
                >
                  3×
                </text>
              </g>
            );
          })()}

          {/* Bike — purple arrow heading southeast off-frame */}
          <line
            stroke="#ffffff"
            strokeLinecap="round"
            strokeWidth="12"
            opacity="0.85"
            x1={bikeStart.x}
            x2={bikeEnd.x}
            y1={bikeStart.y}
            y2={bikeEnd.y}
          />
          <line
            markerEnd="url(#bikeArrow)"
            stroke={disciplineColors.bike}
            strokeDasharray="14 8"
            strokeLinecap="round"
            strokeWidth="6"
            x1={bikeStart.x}
            x2={bikeEnd.x - 16}
            y1={bikeStart.y}
            y2={bikeEnd.y - 16}
          />
          <g>
            <rect
              fill="#ffffff"
              height="22"
              rx="5"
              stroke={disciplineColors.bike}
              strokeWidth="2"
              width="170"
              x={VIEW_W - 200}
              y={VIEW_H - 60}
            />
            <text
              fill={disciplineColors.bike}
              fontSize="13"
              fontWeight="800"
              x={VIEW_W - 192}
              y={VIEW_H - 44}
            >
              Bike → Ponte Vedra (×2)
            </text>
          </g>

          {/* Pins */}
          {KEY_LOCATIONS.map((loc) => {
            const { x, y } = project(loc.lat, loc.lng);
            const color = disciplineColors[loc.discipline];
            return (
              <g key={loc.id}>
                <circle
                  cx={x}
                  cy={y}
                  fill={color}
                  r="11"
                  stroke="#ffffff"
                  strokeWidth="3"
                />
                <text
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="900"
                  textAnchor="middle"
                  x={x}
                  y={y + 4}
                >
                  {loc.badgeIcon}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="corridor-map-legend">
        <li>
          <span
            aria-hidden="true"
            className="corridor-map-swatch"
            style={{ background: disciplineColors.swim }}
          />
          <span>
            <strong>Swim</strong> — blue line along the St. Johns River from
            Metropolitan Park to the Cummer Museum (transition is just past
            the museum, at Memorial Park).
          </span>
        </li>
        <li>
          <span
            aria-hidden="true"
            className="corridor-map-swatch"
            style={{ background: disciplineColors.bike }}
          />
          <span>
            <strong>Bike</strong> — purple arrow southeast toward Ponte Vedra
            Beach and back, twice. (Course continues off the map.)
          </span>
        </li>
        <li>
          <span
            aria-hidden="true"
            className="corridor-map-swatch"
            style={{ background: disciplineColors.run }}
          />
          <span>
            <strong>Run</strong> — orange 3-lap loop through Riverside, Willow
            Branch, downtown, and the Riverwalk. Willow Branch sits right on
            the loop — the best place to stand.
          </span>
        </li>
      </ul>
    </div>
  );
}

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
          Brooklyn / Riverside / downtown Jacksonville corridor. The colored
          lines show where Ben goes: blue swim along the river, purple bike
          heading southeast, orange run loop through the neighborhood. The
          orange loop is the one to watch — it threads right through Willow
          Branch.
        </p>

        <CorridorMap />

        <p className="map-orientation-note">
          <strong>Food note for the swim:</strong> {SWIM_FOOD_WARNING}
        </p>

        <p className="map-pins-title">Pins for the day</p>
        <ul className="map-pins-list">
          {KEY_LOCATIONS.map((loc) => {
            const color = disciplineColors[loc.discipline];
            const isTransition = loc.id === "transition";
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
                {isTransition ? (
                  <p className="map-pin-desc">
                    The swim ends near the Cummer Museum of Art and Gardens.
                    The transition area is just past the Cummer, at or near
                    Memorial Park.
                  </p>
                ) : null}
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
          Metropolitan Park down the St. Johns River to the Cummer Museum /
          Memorial Park transition ·{" "}
          <span style={{ color: disciplineColors.bike }}>● Bike</span> out
          toward Ponte Vedra Beach and back, twice ·{" "}
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
                Point-to-point in the St. Johns River, from Metropolitan Park
                down to the Cummer Museum, with the transition just past the
                museum at Memorial Park.
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
