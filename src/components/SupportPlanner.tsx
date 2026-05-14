import type { ReactNode } from "react";

import { disciplineColors } from "@/data/raceSpots";

const directionsLink = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

// Schematic orientation map. Coordinates are SVG positions (not lat/lng)
// because we are deliberately NOT drawing a precise turn-by-turn course —
// we don't have the verified GPS lines, and pretending we do led to the
// orange run loop being drawn over the river. Instead this is a labeled
// "spectator orientation" diagram: a stylized river, the south-bank
// neighborhoods where the run loops, the downtown finish, and the six
// pins family/friends actually need to navigate to.

const VIEW_W = 800;
const VIEW_H = 420;

// Pin positions on the schematic (not lat/lng). Laid out west→east the
// way Jacksonville actually sits: Willow Branch is far west, Metropolitan
// Park is far east across the river, finish is east-downtown.
type PinXY = { x: number; y: number };
const PINS: Record<string, PinXY> = {
  willowBranch: { x: 110, y: 290 },
  memorial: { x: 285, y: 250 },
  transition: { x: 320, y: 240 },
  cummer: { x: 360, y: 215 },
  riverfront: { x: 690, y: 165 },
  metroPark: { x: 720, y: 70 },
};

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

type ItineraryStop = {
  label: string;
  address?: string;
  directionsQuery: string;
  detail?: string;
};

type ItineraryPath = {
  heading: string;
  bestFor?: string;
  body: string;
  stops?: ItineraryStop[];
};

type ItineraryItem = {
  time: string;
  title: string;
  body: string;
  note?: string;
  accent: "swim" | "bike" | "run" | "info";
  stops?: ItineraryStop[];
  paths?: ItineraryPath[];
};

const SOUTHERN_GROUNDS_ADDRESS =
  "3562 St Johns Ave, Jacksonville, FL 32205";
const SOUTHERN_GROUNDS_QUERY =
  "Southern Grounds, 3562 St Johns Ave, Jacksonville, FL 32205";
const RIVER_AND_POST_QUERY =
  "River & Post, 1000 Riverside Ave, Jacksonville, FL 32204";

const ITINERARY: ItineraryItem[] = [
  {
    time: "Around 7:30 AM",
    title: "Arrive at the Cummer Art Museum",
    body: "Park in the Cummer lot, coffee in hand. From here, walk along the riverwalk / riverside path toward where Ben exits the swim and transitions. Do not use the downtown garages for the swim — the walk is too long.",
    note: `FOOD NOTE: ${SWIM_FOOD_WARNING}`,
    accent: "swim",
    stops: [
      {
        label: "Cummer Art Museum lot",
        address: "829 Riverside Ave, Jacksonville, FL 32204",
        directionsQuery:
          "Cummer Museum of Art and Gardens, 829 Riverside Ave, Jacksonville, FL 32204",
        detail: "Morning parking · flat walk to the river path",
      },
    ],
  },
  {
    time: "~7:30 AM onward",
    title: "Walk the riverside path · watch the swim, then cheer at transition",
    body: "Ben starts the swim at Metropolitan Park, across the St. Johns River. Walk along the riverside path through Brooklyn and Riverside — you can see the swim out on the water. The swim ends near the Cummer, and the transition is just past it, at or near Memorial Park. Say goodbye and cheer as he bikes off.",
    accent: "swim",
  },
  {
    time: "After he bikes off",
    title: "Breakfast at Southern Grounds (Avondale)",
    body: "Mom, Cat, and Cyndee head to Southern Grounds on St. Johns Ave for breakfast. Large outdoor patio, only a couple minutes from the transition area — easy to settle in after the swim cheer.",
    accent: "info",
    stops: [
      {
        label: "Southern Grounds — Avondale",
        address: SOUTHERN_GROUNDS_ADDRESS,
        directionsQuery: SOUTHERN_GROUNDS_QUERY,
        detail: "Large outdoor patio · a couple minutes from transition",
      },
    ],
  },
  {
    time: "Through the bike (several hours)",
    title: "Pick one of two paths while Ben bikes",
    body: "Ben bikes 112 miles out toward Ponte Vedra Beach and back, twice. Bikes are fast and hard to cheer, so don't feel obligated to chase him. Use this window — it's the longest stretch of the day.",
    accent: "bike",
    paths: [
      {
        heading: "Stay local · easy path (recommended)",
        bestFor: "Best for Mom and Cyndee",
        body: "After Southern Grounds breakfast, wander Avondale or San Marco — shops, bookstores, the cute neighborhoods. Then lunch or an early dinner at River & Post, or a rooftop drink, while waiting for Ben to come back toward transition.",
        stops: [
          {
            label: "Southern Grounds — Avondale",
            address: SOUTHERN_GROUNDS_ADDRESS,
            directionsQuery: SOUTHERN_GROUNDS_QUERY,
            detail: "Breakfast · large patio",
          },
          {
            label: "Avondale shops & bookstores",
            directionsQuery: "Shoppes of Avondale, Jacksonville, FL",
            detail: "Walkable shopping district right around Southern Grounds",
          },
          {
            label: "San Marco Square",
            directionsQuery: "San Marco Square, Jacksonville, FL",
            detail: "Optional second neighborhood · shops and cafes",
          },
          {
            label: "River & Post",
            directionsQuery: RIVER_AND_POST_QUERY,
            detail: "Lunch / early dinner / rooftop drink near transition",
          },
        ],
      },
      {
        heading: "Ponte Vedra optional path",
        bestFor: "For anyone really wanting to try seeing him on the bike",
        body: "Drive out toward Ponte Vedra to try and catch Ben on the bike course. Keep expectations low — bikes are fast and hard to cheer from the roadside, and you can easily miss him. This is optional, not the main plan.",
      },
    ],
  },
  {
    time: "Late bike → start of the run",
    title: "Back near transition · cheer the bike-to-run handoff",
    body: "Head back near the transition zone to cheer Ben as he comes in off the bike and starts the run. River & Post is a short walk from here if you want to time it with a drink or a snack.",
    accent: "bike",
  },
  {
    time: "Through the run · 3 passes",
    title: "Willow Branch Park · the most important stop",
    body: "Move to Willow Branch Park and stay. The run course loops through this neighborhood three times — aim to cheer him on all 3 passes. Shade, flat walking, easy parking. You will see Ben three times without moving your car.",
    accent: "run",
    stops: [
      {
        label: "Willow Branch Park",
        address: "2870 Park St, Jacksonville, FL 32205",
        directionsQuery: "Willow Branch Park, 2870 Park St, Jacksonville, FL 32205",
        detail: "Plant yourself here · Ben passes 3 times",
      },
    ],
  },
  {
    time: "After his LAST pass",
    title: "Drive to Riverfront Plaza for the finish line",
    body: "When you see him run through Willow Branch for the third time, pack up and drive to Riverfront Plaza. You will get there before him and be in position to see him cross the finish line.",
    accent: "run",
    stops: [
      {
        label: "Riverfront Plaza · Finish Line",
        address: "2 Independent Dr, Jacksonville, FL 32202",
        directionsQuery:
          "Riverfront Plaza, 2 Independent Dr, Jacksonville, FL 32202",
        detail: "Finish line · IRONMAN Village · easy seated viewing",
      },
    ],
  },
];

const accentColor: Record<ItineraryItem["accent"], string> = {
  swim: disciplineColors.swim,
  bike: disciplineColors.bike,
  run: disciplineColors.run,
  info: "#555",
};

type PinKey = keyof typeof PINS;

const PIN_BY_ID: Record<string, PinKey> = {
  "willow-branch": "willowBranch",
  "memorial-park": "memorial",
  transition: "transition",
  cummer: "cummer",
  "riverfront-plaza": "riverfront",
  "metro-park": "metroPark",
};

function CorridorMap() {
  const runColor = disciplineColors.run;
  const swimColor = disciplineColors.swim;
  const bikeColor = disciplineColors.bike;

  return (
    <div className="corridor-map">
      <p className="corridor-map-caption">
        <strong>Orientation only — not a turn-by-turn course map.</strong>{" "}
        Use the pin links below for driving directions.
      </p>

      <div className="corridor-map-frame">
        <svg
          aria-label="Schematic orientation map of the IRONMAN Jacksonville spectator corridor"
          className="corridor-map-svg"
          role="img"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker
              id="arrowSwim"
              markerHeight="10"
              markerWidth="10"
              orient="auto"
              refX="6"
              refY="5"
              viewBox="0 0 10 10"
            >
              <path d="M0,0 L10,5 L0,10 z" fill={swimColor} />
            </marker>
            <marker
              id="arrowBike"
              markerHeight="10"
              markerWidth="10"
              orient="auto"
              refX="6"
              refY="5"
              viewBox="0 0 10 10"
            >
              <path d="M0,0 L10,5 L0,10 z" fill={bikeColor} />
            </marker>
            <marker
              id="arrowRun"
              markerHeight="9"
              markerWidth="9"
              orient="auto"
              refX="5"
              refY="4.5"
              viewBox="0 0 9 9"
            >
              <path d="M0,0 L9,4.5 L0,9 z" fill={runColor} />
            </marker>
          </defs>

          {/* Background land (south-bank neighborhoods + downtown) */}
          <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="#f3efe4" />

          {/* River band — curves across the frame. Swim happens INSIDE this. */}
          <path
            d={`M -20 30 C 180 90, 420 220, 820 140 L 820 200 C 420 280, 180 150, -20 90 Z`}
            fill="#cfe4f2"
            stroke="#a9c8df"
            strokeWidth="2"
          />
          <text
            fill="#3a6a8a"
            fontSize="14"
            fontStyle="italic"
            fontWeight="700"
            x="430"
            y="195"
          >
            St. Johns River
          </text>

          {/* South-bank neighborhood labels (no precise streets) */}
          <text fill="#6a5a2a" fontSize="13" fontWeight="800" x="60" y="350">
            RIVERSIDE / BROOKLYN
          </text>
          <text fill="#6a5a2a" fontSize="12" x="60" y="368">
            (where the run loops)
          </text>
          <text fill="#6a5a2a" fontSize="13" fontWeight="800" x="560" y="350">
            DOWNTOWN JACKSONVILLE
          </text>
          <text fill="#6a5a2a" fontSize="12" x="560" y="368">
            (finish line + Riverwalk)
          </text>

          {/* RUN — drawn as a highlighted ZONE, not a polyline. This is the
              spectator neighborhood; we don't pretend to know the exact streets. */}
          <ellipse
            cx="230"
            cy="295"
            rx="230"
            ry="55"
            fill={runColor}
            opacity="0.16"
            stroke={runColor}
            strokeDasharray="6 5"
            strokeWidth="2.5"
          />
          {/* Curved arrows around the run zone to show "it loops, 3 times". */}
          <path
            d="M 70 295 a 160 38 0 0 1 320 0"
            fill="none"
            markerEnd="url(#arrowRun)"
            opacity="0.75"
            stroke={runColor}
            strokeWidth="3"
          />
          <path
            d="M 390 295 a 160 38 0 0 1 -320 0"
            fill="none"
            markerEnd="url(#arrowRun)"
            opacity="0.75"
            stroke={runColor}
            strokeWidth="3"
          />
          {/* Big "3x" badge anchored near Willow Branch. */}
          <g>
            <circle
              cx={PINS.willowBranch.x - 35}
              cy={PINS.willowBranch.y + 36}
              fill="#ffffff"
              r="20"
              stroke={runColor}
              strokeWidth="3.5"
            />
            <text
              fill={runColor}
              fontSize="18"
              fontWeight="900"
              textAnchor="middle"
              x={PINS.willowBranch.x - 35}
              y={PINS.willowBranch.y + 43}
            >
              3×
            </text>
          </g>
          {/* Run-zone label — clearly the run area, not a route. */}
          <g>
            <rect
              fill="#ffffff"
              height="26"
              rx="6"
              stroke={runColor}
              strokeWidth="2.5"
              width="230"
              x="115"
              y="248"
            />
            <text
              fill={runColor}
              fontSize="14"
              fontWeight="900"
              x="125"
              y="266"
            >
              RUN LOOPS THROUGH HERE (3×)
            </text>
          </g>

          {/* SWIM — arrow that stays INSIDE the river band, east → west,
              from Metropolitan Park toward Cummer/Memorial. */}
          <path
            d={`M ${PINS.metroPark.x - 6} ${PINS.metroPark.y + 18}
                C ${PINS.metroPark.x - 80} ${PINS.metroPark.y + 60},
                  ${PINS.cummer.x + 120} ${PINS.cummer.y - 30},
                  ${PINS.cummer.x + 18} ${PINS.cummer.y - 6}`}
            fill="none"
            markerEnd="url(#arrowSwim)"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeWidth="11"
            opacity="0.95"
          />
          <path
            d={`M ${PINS.metroPark.x - 6} ${PINS.metroPark.y + 18}
                C ${PINS.metroPark.x - 80} ${PINS.metroPark.y + 60},
                  ${PINS.cummer.x + 120} ${PINS.cummer.y - 30},
                  ${PINS.cummer.x + 18} ${PINS.cummer.y - 6}`}
            fill="none"
            markerEnd="url(#arrowSwim)"
            stroke={swimColor}
            strokeLinecap="round"
            strokeWidth="6"
          />
          <text
            fill={swimColor}
            fontSize="13"
            fontWeight="800"
            x="430"
            y="135"
          >
            SWIM (in the river)
          </text>

          {/* BIKE — subtle, de-emphasized. Small dashed arrow leaving SE. */}
          <line
            opacity="0.85"
            stroke={bikeColor}
            strokeDasharray="6 6"
            strokeLinecap="round"
            strokeWidth="3"
            x1={PINS.transition.x + 12}
            x2={VIEW_W - 60}
            y1={PINS.transition.y + 30}
            y2={VIEW_H - 30}
            markerEnd="url(#arrowBike)"
          />
          <text
            fill={bikeColor}
            fontSize="11"
            fontWeight="700"
            x={VIEW_W - 220}
            y={VIEW_H - 30}
          >
            Bike → Ponte Vedra (off map, ×2)
          </text>

          {/* Pins. Willow Branch is intentionally bigger and labeled bold. */}
          {KEY_LOCATIONS.map((loc) => {
            const pinKey = PIN_BY_ID[loc.id];
            if (!pinKey) return null;
            const { x, y } = PINS[pinKey];
            const color = disciplineColors[loc.discipline];
            const isHQ = loc.id === "willow-branch";
            const r = isHQ ? 18 : 11;
            return (
              <g key={loc.id}>
                {isHQ ? (
                  <circle
                    cx={x}
                    cy={y}
                    fill="none"
                    r={r + 7}
                    stroke={color}
                    strokeOpacity="0.45"
                    strokeWidth="3"
                  />
                ) : null}
                <circle
                  cx={x}
                  cy={y}
                  fill={color}
                  r={r}
                  stroke="#ffffff"
                  strokeWidth={isHQ ? 4 : 3}
                />
                <text
                  fill="#ffffff"
                  fontSize={isHQ ? 16 : 12}
                  fontWeight="900"
                  textAnchor="middle"
                  x={x}
                  y={y + (isHQ ? 6 : 4)}
                >
                  {loc.badgeIcon}
                </text>
              </g>
            );
          })}

          {/* Pin labels (placed to avoid overlap with the river band). */}
          <PinLabel anchor="below" pin={PINS.willowBranch}>Willow Branch · RUN HQ</PinLabel>
          <PinLabel anchor="above" pin={PINS.metroPark}>Metropolitan Park · swim start</PinLabel>
          <PinLabel anchor="above" pin={PINS.cummer}>Cummer lot</PinLabel>
          <PinLabel anchor="below" pin={PINS.memorial}>Memorial Park</PinLabel>
          <PinLabel anchor="rightBelow" pin={PINS.transition}>Transition</PinLabel>
          <PinLabel anchor="above" pin={PINS.riverfront}>Riverfront Plaza · FINISH</PinLabel>
        </svg>
      </div>

      <ul className="corridor-map-legend">
        <li>
          <span
            aria-hidden="true"
            className="corridor-map-swatch"
            style={{ background: runColor }}
          />
          <span>
            <strong>Run zone (orange)</strong> — the run laps through this
            Riverside / Brooklyn neighborhood three times.{" "}
            <strong>Willow Branch Park is the spot to plant yourself.</strong>{" "}
            The shaded oval is the area, not a street-by-street route.
          </span>
        </li>
        <li>
          <span
            aria-hidden="true"
            className="corridor-map-swatch"
            style={{ background: swimColor }}
          />
          <span>
            <strong>Swim (blue)</strong> — in the St. Johns River, from
            Metropolitan Park down to the Cummer / Memorial Park area.
          </span>
        </li>
        <li>
          <span
            aria-hidden="true"
            className="corridor-map-swatch"
            style={{ background: bikeColor }}
          />
          <span>
            <strong>Bike (purple)</strong> — heads southeast toward Ponte Vedra
            Beach (off this map) and back, twice.{" "}
            <em>Not worth chasing — use the bike hours for lunch and rest.</em>
          </span>
        </li>
      </ul>
    </div>
  );
}

type PinLabelProps = {
  pin: PinXY;
  anchor: "above" | "below" | "rightBelow";
  children: ReactNode;
};

function PinLabel({ pin, anchor, children }: PinLabelProps) {
  const dy =
    anchor === "above" ? -20 : anchor === "rightBelow" ? 30 : 32;
  const textAnchor: "middle" | "start" =
    anchor === "rightBelow" ? "start" : "middle";
  const dx = anchor === "rightBelow" ? 18 : 0;
  return (
    <text
      fill="#1a1a1a"
      fontSize="12.5"
      fontWeight="800"
      textAnchor={textAnchor}
      x={pin.x + dx}
      y={pin.y + dy}
    >
      <tspan
        style={{ paintOrder: "stroke", stroke: "#ffffff", strokeWidth: 4 }}
      >
        {children}
      </tspan>
    </text>
  );
}

function ItineraryStops({ stops }: { stops: ItineraryStop[] }) {
  return (
    <ul className="itinerary-stops">
      {stops.map((stop, idx) => (
        <li key={idx} className="itinerary-stop">
          <p className="itinerary-stop-label">{stop.label}</p>
          {stop.address ? (
            <p className="itinerary-stop-address">{stop.address}</p>
          ) : null}
          {stop.detail ? (
            <p className="itinerary-stop-detail">{stop.detail}</p>
          ) : null}
          <a
            className="itinerary-stop-link"
            href={directionsLink(stop.directionsQuery)}
            rel="noreferrer"
            target="_blank"
          >
            Get directions
          </a>
        </li>
      ))}
    </ul>
  );
}

function ItineraryPathBlock({
  path,
  accentColor,
}: {
  path: ItineraryPath;
  accentColor: string;
}) {
  return (
    <div className="itinerary-path" style={{ borderColor: accentColor }}>
      <p className="itinerary-path-heading" style={{ color: accentColor }}>
        {path.heading}
      </p>
      {path.bestFor ? (
        <p className="itinerary-path-bestfor">{path.bestFor}</p>
      ) : null}
      <p className="itinerary-path-body">{path.body}</p>
      {path.stops ? <ItineraryStops stops={path.stops} /> : null}
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
          The day starts at the <strong>Cummer Art Museum</strong> around{" "}
          <strong>7:30 AM</strong> for the swim cheer. After that, these are the
          two best places to spend the rest of the day — tap one for driving
          directions.
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
          Follow this order: start at Cummer for the swim, take the breakfast
          break in Avondale, choose a bike-window plan, then regroup for Willow
          Branch and the finish. You&apos;ll see Ben several times without
          scrambling.
        </p>
        <ol className="itinerary-list">
          {ITINERARY.map((item, idx) => {
            const color = accentColor[item.accent];
            return (
              <li key={idx} className="itinerary-item" style={{ borderColor: color }}>
                <div className="itinerary-time" style={{ color }}>{item.time}</div>
                <h3 className="itinerary-title">{item.title}</h3>
                <p className="itinerary-body">{item.body}</p>
                {item.stops ? <ItineraryStops stops={item.stops} /> : null}
                {item.paths
                  ? item.paths.map((path, pIdx) => (
                      <ItineraryPathBlock key={pIdx} accentColor={color} path={path} />
                    ))
                  : null}
                {item.note ? (
                  <p className="itinerary-note">{item.note}</p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="planner-section" id="map">
        <h2>Spectator orientation map</h2>
        <p className="planner-section-lead">
          Orange = where the run loops 3×.{" "}
          <strong>Willow Branch Park</strong> is the spot to stand.
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
          <strong>About this map:</strong> it shows the right{" "}
          <em>neighborhoods</em> and the right pins, not the exact streets
          Ben runs on. For driving directions, tap any pin&apos;s &ldquo;Open
          in Google Maps&rdquo; link above.
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
