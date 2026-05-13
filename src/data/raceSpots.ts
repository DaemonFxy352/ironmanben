// Curated recommended cheer spots and approximate race-course geometry
// for the family-and-friends planning view. These are an MVP overview
// based on the athlete guide and existing point data — not athlete GPS.

export type Discipline = "swim" | "bike" | "run";

export const disciplineColors: Record<Discipline, string> = {
  swim: "#1e88e5", // blue
  bike: "#7b1fa2", // purple
  run: "#e65100", // orange
};

export const disciplineLabels: Record<Discipline, string> = {
  swim: "Swim (2.4 mi)",
  bike: "Bike (112 mi, 2 laps)",
  run: "Run (26.2 mi, 3 laps)",
};

export type RecommendedSpot = {
  id: string;
  name: string;
  // The primary discipline this spot supports
  discipline: Discipline;
  // Why this spot matters — plain English, two sentences max
  why: string;
  expectedSightings: number;
  // 1 = easy, 2 = moderate, 3 = harder
  hassle: 1 | 2 | 3;
  hassleNote: string;
  parkingNote: string;
  // 1 = top, 2 = strong, 3 = situational, 4 = optional, 5 = skippable
  priority: 1 | 2 | 3 | 4 | 5;
  priorityLabel: string;
  coordinates: { lat: number; lng: number };
  directionsUrl: string;
};

const directionsLink = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const recommendedSpots: RecommendedSpot[] = [
  {
    id: "willow-branch-riverside-park",
    name: "Willow Branch / Riverside Park",
    discipline: "run",
    why: "The best place to cheer Ben on the run. He needs the most encouragement here, and the run goes through this area 3 times, so you should see him 3 times.",
    expectedSightings: 3,
    hassle: 2,
    hassleNote: "Some walking between shade spots, but quieter sidewalks than downtown.",
    parkingNote:
      "Try street parking around Willow Branch Park or Riverside Park. Confirm race-day closures before parking on a course street.",
    priority: 1,
    priorityLabel: "Top pick · run cheer",
    coordinates: { lat: 30.3099, lng: -81.6945 },
    directionsUrl: directionsLink("Willow Branch Park Jacksonville FL"),
  },
  {
    id: "memorial-park-riverside-arts",
    name: "Memorial Park / Riverside Arts Market",
    discipline: "run",
    why: "Strong base for an active crew. You can see Ben at the transition area after the swim, then catch him again on the run loops. The Riverside Arts Market is a comfortable spot to wait between sightings.",
    expectedSightings: 3,
    hassle: 2,
    hassleNote: "Some crowding near transition fencing. Pick one regroup point and stick to it.",
    parkingNote:
      "Limited street parking near Memorial Park. Riverside Arts Market lot (under Fuller Warren Bridge) may have race-day access — check before driving in.",
    priority: 2,
    priorityLabel: "Strong base · run + transition",
    coordinates: { lat: 30.3121, lng: -81.6819 },
    directionsUrl: directionsLink("Memorial Park 1620 Riverside Ave Jacksonville FL"),
  },
  {
    id: "riverfront-plaza-finish",
    name: "Riverfront Plaza / Finish Line",
    discipline: "run",
    why: "The best spot for anyone who would rather sit and wait than walk a lot. The run passes through downtown each lap, and the finish line is right here. Crowded and loud, but easy to find.",
    expectedSightings: 4,
    hassle: 1,
    hassleNote:
      "Easiest senior-friendly base. Benches, paved Riverwalk, public restrooms nearby. Expect heavy crowds at the finish.",
    parkingNote:
      "Closest garages: Water Street Garage, Yates Garage. Duval Street Garage is a backup but only open 7am-7pm.",
    priority: 1,
    priorityLabel: "Top pick · easiest base + finish",
    coordinates: { lat: 30.3254, lng: -81.6591 },
    directionsUrl: directionsLink("Riverfront Plaza 2 Independent Dr Jacksonville FL"),
  },
  {
    id: "ponte-vedra-bike",
    name: "Ponte Vedra / A1A (bike adventure)",
    discipline: "bike",
    why: "Optional. Ben passes once on the bike at high speed, so you may only catch a 5-second wave. Worth it only if a small adventurous group wants a beach drive.",
    expectedSightings: 1,
    hassle: 3,
    hassleNote: "Longest drive (~45 min each way), roads may be restricted, hard to predict timing.",
    parkingNote:
      "Beach access lots along A1A. Arrive early. Do not block residential driveways or course shoulders.",
    priority: 4,
    priorityLabel: "Optional · bike adventure",
    coordinates: { lat: 30.1786, lng: -81.3719 },
    directionsUrl: directionsLink("Ponte Vedra Beach A1A"),
  },
  {
    id: "metropolitan-park-swim",
    name: "Metropolitan Park (swim start)",
    discipline: "swim",
    why: "Pretty atmosphere at the 7:30am swim start. Ben swims fast, so you will likely only see him once and from a distance. Don't over-invest the morning here.",
    expectedSightings: 1,
    hassle: 2,
    hassleNote: "Very early morning. Athlete-only zones limit how close you can get.",
    parkingNote:
      "Stadium-area lots may be controlled by race operations. Plan extra arrival time.",
    priority: 5,
    priorityLabel: "Atmosphere only · low support value",
    coordinates: { lat: 30.3234, lng: -81.6378 },
    directionsUrl: directionsLink("Metropolitan Park 64 Gator Bowl Blvd Jacksonville FL"),
  },
];

export type ParkingSpot = {
  id: string;
  name: string;
  // Which cheer spot this parking serves best
  serves: string;
  note: string;
  coordinates: { lat: number; lng: number };
  directionsUrl: string;
};

export const parkingSpots: ParkingSpot[] = [
  {
    id: "water-street-garage",
    name: "Water Street Garage",
    serves: "Riverfront Plaza / Finish",
    note: "Closest garage to the finish. Expect slow exit after the race.",
    coordinates: { lat: 30.3279, lng: -81.6626 },
    directionsUrl: directionsLink("Water Street Garage Jacksonville FL"),
  },
  {
    id: "yates-garage",
    name: "Yates Garage",
    serves: "Riverfront Plaza / Finish",
    note: "Walk to the finish line. Confirm garage hours race morning.",
    coordinates: { lat: 30.3282, lng: -81.6562 },
    directionsUrl: directionsLink("Yates Garage Jacksonville FL"),
  },
  {
    id: "jax-center-garage",
    name: "Jax Center Garage",
    serves: "Riverfront Plaza / Finish",
    note: "Downtown garage option near the IRONMAN Village.",
    coordinates: { lat: 30.3258, lng: -81.6603 },
    directionsUrl: directionsLink("Jax Center Garage 110 E Bay St Jacksonville FL"),
  },
  {
    id: "duval-street-garage",
    name: "Duval Street Garage",
    serves: "Riverfront Plaza / Finish (backup)",
    note: "Backup only. Open 7am-7pm — may close before Ben finishes.",
    coordinates: { lat: 30.3296, lng: -81.6598 },
    directionsUrl: directionsLink("Duval Street Garage Jacksonville FL"),
  },
  {
    id: "riverside-arts-market-lot",
    name: "Riverside Arts Market lot",
    serves: "Memorial Park / Riverside Arts Market",
    note: "Under Fuller Warren Bridge. Check race-day access before driving in.",
    coordinates: { lat: 30.3167, lng: -81.6764 },
    directionsUrl: directionsLink("Riverside Arts Market Jacksonville FL"),
  },
  {
    id: "willow-branch-street-parking",
    name: "Willow Branch street parking",
    serves: "Willow Branch / Riverside Park",
    note: "Side streets around Willow Branch Park. Avoid course-side streets if posted no parking.",
    coordinates: { lat: 30.3099, lng: -81.6945 },
    directionsUrl: directionsLink("Willow Branch Park Jacksonville FL"),
  },
];

// Approximate course overview polylines. These are NOT athlete GPS — they
// trace key anchor points so family can see roughly where each discipline goes.

// Swim: Metropolitan Park -> near Cummer Museum (point-to-point, 2.4 mi in St. Johns River).
// Transition area is just past the Cummer, at or near Memorial Park.
export const swimCoursePath: Array<[number, number]> = [
  [30.3234, -81.6378], // Metropolitan Park start
  [30.3232, -81.65],
  [30.321, -81.658],
  [30.317, -81.665],
  [30.318, -81.675],
  [30.3221, -81.6831], // Cummer Museum swim end
];

// Bike: Memorial Park -> south/east toward Ponte Vedra A1A and back (2 laps)
// Single overview line that traces a loop out to A1A and back.
export const bikeCoursePath: Array<[number, number]> = [
  [30.3121, -81.6819], // Memorial Park / T1
  [30.3, -81.66],
  [30.28, -81.6],
  [30.25, -81.5],
  [30.22, -81.45],
  [30.2, -81.4],
  [30.1786, -81.3719], // Ponte Vedra A1A turnaround approx
  [30.2, -81.4],
  [30.22, -81.45],
  [30.25, -81.5],
  [30.28, -81.6],
  [30.3, -81.66],
  [30.3121, -81.6819], // back to T2 at Memorial Park
];

// Run: 3 loops through downtown Riverwalk / Memorial Park / Riverside / Five Points / Willow Branch
// We draw the loop once (one polyline) since 3 overlapping loops would just clutter.
export const runCoursePath: Array<[number, number]> = [
  [30.3121, -81.6819], // Memorial Park / T2
  [30.3148, -81.6819], // Five Points
  [30.3118, -81.6877], // Riverside Park
  [30.3099, -81.6945], // Willow Branch Park
  [30.3107, -81.6944],
  [30.3134, -81.6844], // Riverside aid approx
  [30.3175, -81.6805], // River & Post / Riverside
  [30.3167, -81.6764], // Riverside Arts Market
  [30.3189, -81.6696], // Brooklyn
  [30.3229, -81.6667], // Downtown Riverwalk
  [30.3247, -81.6608], // Riverwalk near Riverfront Plaza
  [30.3254, -81.6591], // Riverfront Plaza finish
];
