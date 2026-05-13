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

// A static, server-renderable SVG schematic of the race. No Leaflet, no
// hydration dependency — works on any deploy target including pure
// static hosts. Conveys the three discipline-colored course overlays,
// star cheer markers, and P parking markers required by the planner.

const VIEW = { width: 720, height: 520 };
const PADDING = 40;

// Tight bounding box on downtown Jacksonville + Riverside. The
// schematic is meant to be readable on a phone; the Ponte Vedra
// bike turnaround is shown as an off-frame arrow instead so the
// downtown cluster doesn't collapse into a corner.
const BBOX = {
  minLng: -81.71,
  maxLng: -81.625,
  minLat: 30.305,
  maxLat: 30.335,
};

function projectRaw(coords: { lat: number; lng: number }): [number, number] {
  const x =
    PADDING +
    ((coords.lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) *
      (VIEW.width - PADDING * 2);
  const y =
    PADDING +
    ((BBOX.maxLat - coords.lat) / (BBOX.maxLat - BBOX.minLat)) *
      (VIEW.height - PADDING * 2);
  return [x, y];
}

function inBox(coords: { lat: number; lng: number }) {
  return (
    coords.lng >= BBOX.minLng &&
    coords.lng <= BBOX.maxLng &&
    coords.lat >= BBOX.minLat &&
    coords.lat <= BBOX.maxLat
  );
}

function project(coords: { lat: number; lng: number }): [number, number] {
  const [x, y] = projectRaw(coords);
  // Clamp anything outside (e.g., Ponte Vedra) to the box edge so the
  // bike line still hints at a direction without dragging the camera.
  return [
    Math.max(PADDING, Math.min(VIEW.width - PADDING, x)),
    Math.max(PADDING, Math.min(VIEW.height - PADDING, y)),
  ];
}

function pathFromCoords(coords: Array<[number, number]>): string {
  return coords
    .map((c, i) => {
      const [x, y] = project({ lat: c[0], lng: c[1] });
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

const COURSE_PATHS: Record<Discipline, string> = {
  swim: pathFromCoords(swimCoursePath),
  bike: pathFromCoords(bikeCoursePath),
  run: pathFromCoords(runCoursePath),
};

// Anchor labels for orientation. We position labels with explicit
// dx/dy so they sit clear of the colored stars on the map.
const ANCHORS: Array<{
  name: string;
  coords: { lat: number; lng: number };
  dx: number;
  dy: number;
  anchor: "start" | "middle" | "end";
}> = [
  {
    name: "Downtown / Finish",
    coords: { lat: 30.3254, lng: -81.6591 },
    dx: 14,
    dy: -10,
    anchor: "start",
  },
  {
    name: "Memorial Park",
    coords: { lat: 30.3121, lng: -81.6819 },
    dx: 14,
    dy: 24,
    anchor: "start",
  },
  {
    name: "Willow Branch",
    coords: { lat: 30.3099, lng: -81.6945 },
    dx: -14,
    dy: 28,
    anchor: "end",
  },
];

export function SchematicMap() {
  return (
    <figure className="schematic-map" aria-label="Race course schematic map">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby="schematic-map-title schematic-map-desc"
        className="schematic-map-svg"
      >
        <title id="schematic-map-title">IRONMAN Jacksonville course overview</title>
        <desc id="schematic-map-desc">
          Schematic map showing the swim, bike, and run courses in three different
          colors, with stars marking recommended cheer spots and P markers for parking.
        </desc>

        {/* Background — soft land tone */}
        <rect width={VIEW.width} height={VIEW.height} fill="#f3efe4" />
        {/* River hint behind the swim line so the swim feels like it's
            actually in water */}
        <path
          d={COURSE_PATHS.swim}
          fill="none"
          stroke="#cfe1ec"
          strokeWidth={48}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.8}
        />

        {/* Bike line — drawn first so it sits below run/swim emphasis */}
        <path
          d={COURSE_PATHS.bike}
          fill="none"
          stroke={disciplineColors.bike}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="14 10"
          opacity="0.85"
        />

        {/* Run line */}
        <path
          d={COURSE_PATHS.run}
          fill="none"
          stroke={disciplineColors.run}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />

        {/* Swim line */}
        <path
          d={COURSE_PATHS.swim}
          fill="none"
          stroke={disciplineColors.swim}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />

        {/* Anchor labels for orientation */}
        {ANCHORS.map((a) => {
          const [x, y] = project(a.coords);
          return (
            <g key={a.name}>
              <text
                x={x + a.dx}
                y={y + a.dy}
                fontSize="14"
                fontWeight="700"
                fill="#2a2a2a"
                stroke="#f1ede2"
                strokeWidth={3}
                paintOrder="stroke"
                textAnchor={a.anchor}
              >
                {a.name}
              </text>
            </g>
          );
        })}

        {/* Off-frame bike turnaround pointer */}
        <g>
          <text
            x={VIEW.width - PADDING - 8}
            y={VIEW.height - PADDING - 8}
            fontSize="14"
            fontWeight="800"
            fill={disciplineColors.bike}
            stroke="#f1ede2"
            strokeWidth={3}
            paintOrder="stroke"
            textAnchor="end"
          >
            → toward Ponte Vedra (bike turnaround)
          </text>
        </g>

        {/* Parking markers (only those inside the downtown frame) */}
        {parkingSpots.filter((p) => inBox(p.coordinates)).map((p) => {
          const [x, y] = project(p.coordinates);
          return (
            <g key={p.id}>
              <rect
                x={x - 11}
                y={y - 11}
                width={22}
                height={22}
                rx={5}
                fill="#37474f"
                stroke="#ffffff"
                strokeWidth={2}
              />
              <text
                x={x}
                y={y + 5}
                fontSize="14"
                fontWeight="900"
                fill="#ffffff"
                textAnchor="middle"
              >
                P
              </text>
            </g>
          );
        })}

        {/* Recommended cheer stars (only those inside the downtown frame) */}
        {recommendedSpots.filter((s) => inBox(s.coordinates)).map((spot) => {
          const [x, y] = project(spot.coordinates);
          const color = disciplineColors[spot.discipline];
          return (
            <g key={spot.id}>
              <text
                x={x}
                y={y + 9}
                fontSize="32"
                fontWeight="900"
                fill={color}
                stroke="#ffffff"
                strokeWidth={1.5}
                paintOrder="stroke"
                textAnchor="middle"
              >
                ★
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption className="schematic-map-caption">
        Course overview — approximate route to help you plan, not athlete GPS.
      </figcaption>

      <div className="planner-legend" aria-label="Map legend">
        <p className="planner-legend-title">What the colors mean</p>
        <div className="planner-legend-rows">
          {(["swim", "bike", "run"] as Discipline[]).map((d) => (
            <div key={d} className="planner-legend-row planner-legend-row-static">
              <span
                aria-hidden="true"
                className="planner-legend-swatch"
                style={{
                  background: disciplineColors[d],
                  borderStyle: d === "bike" ? "dashed" : "solid",
                  borderColor: disciplineColors[d],
                }}
              />
              <span className="planner-legend-text">{disciplineLabels[d]}</span>
            </div>
          ))}
          <div className="planner-legend-row planner-legend-row-static">
            <span aria-hidden="true" className="planner-legend-parking">P</span>
            <span className="planner-legend-text">Parking near cheer spots</span>
          </div>
          <div className="planner-legend-row planner-legend-row-static">
            <span aria-hidden="true" className="planner-legend-star">★</span>
            <span className="planner-legend-text">
              Star = recommended cheer spot (star color matches its discipline)
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}
