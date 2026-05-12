import type { MapCategory, MapCategoryMeta, MapPoint } from "@/types/map";

const mapsSearch = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const mapCategoryMeta = {
  raceAnchors: {
    label: "Race anchors",
    color: "#147C9C",
  },
  cheerZones: {
    label: "Cheer zones",
    color: "#E4572E",
  },
  parking: {
    label: "Parking",
    color: "#5B5F97",
  },
  restaurants: {
    label: "Restaurants",
    color: "#C88A16",
  },
  parks: {
    label: "Parks / rest areas",
    color: "#1F8A70",
  },
  mobility: {
    label: "Mobility-friendly",
    color: "#6B7C3B",
  },
  aidStations: {
    label: "Aid stations / approximate",
    color: "#7A4D9B",
  },
} satisfies Record<MapCategory, MapCategoryMeta>;

export const mapPoints: MapPoint[] = [
  {
    id: "memorial-park-transition",
    name: "Memorial Park / Transition",
    type: "Transition",
    category: "raceAnchors",
    description:
      "Confirmed transition area at Memorial Park. Ben reaches this area after the swim exit jog and before bike/run movements.",
    mobilityNotes:
      "Expect athlete-only fencing and crowding. Use nearby sidewalks and pick a single family regroup point outside restricted paths.",
    bestTime: "Pre-race, swim exit window, T2, and repeated run-loop sightings.",
    coordinates: {
      lat: 30.3121,
      lng: -81.6819,
    },
    googleMapsUrl: mapsSearch("Memorial Park 1620 Riverside Ave Jacksonville FL 32204"),
  },
  {
    id: "post-st-dock-swim-exit",
    name: "Post St Dock / Swim Exit",
    type: "Swim exit",
    category: "raceAnchors",
    description:
      "Confirmed swim exit area near Post St dock, followed by an approximately 0.27 mile jog to Memorial Park transition.",
    mobilityNotes:
      "Likely congested and fast-moving. Avoid crossing athlete flow and use this as a quick sighting point, not a long stay.",
    bestTime: "Swim exit window only.",
    coordinates: {
      lat: 30.3137,
      lng: -81.6789,
    },
    googleMapsUrl: mapsSearch("Post Street dock Jacksonville Riverside"),
  },
  {
    id: "riverfront-plaza-finish",
    name: "Riverfront Plaza / Finish",
    type: "IRONMAN Village / finish",
    category: "raceAnchors",
    description:
      "Confirmed IRONMAN Village and finish area at Riverfront Plaza, 2 Independent Dr.",
    mobilityNotes:
      "Best official finish anchor, but expect the heaviest crowds. Choose a nearby backup meetup point before the race starts.",
    bestTime: "Finish window and post-race meetup.",
    coordinates: {
      lat: 30.3254,
      lng: -81.6591,
    },
    googleMapsUrl: mapsSearch("Riverfront Plaza 2 Independent Dr Jacksonville FL 32202"),
  },
  {
    id: "metropolitan-park-swim-start",
    name: "Metropolitan Park / Swim Start",
    type: "Swim start",
    category: "raceAnchors",
    description:
      "Confirmed swim start area at Metropolitan Park, 64 Gator Bowl Blvd.",
    mobilityNotes:
      "Plan extra arrival time and assume nearby roads and lots may be controlled by race operations.",
    bestTime: "Early morning pre-race and swim start.",
    coordinates: {
      lat: 30.3234,
      lng: -81.6378,
    },
    googleMapsUrl: mapsSearch("Metropolitan Park 64 Gator Bowl Blvd Jacksonville FL 32202"),
  },
  {
    id: "riverside-arts-market",
    name: "Riverside Arts Market area",
    type: "Cheer zone",
    category: "cheerZones",
    description:
      "Useful Riverside landmark near the river and Fuller Warren Bridge area for regrouping and possible course access.",
    mobilityNotes:
      "Check race-day closures before committing. Wider paved areas may be easier than tighter Five Points sidewalks.",
    bestTime: "Run loops and family regrouping between sightings.",
    coordinates: {
      lat: 30.3167,
      lng: -81.6764,
    },
    googleMapsUrl: mapsSearch("Riverside Arts Market Jacksonville FL"),
  },
  {
    id: "five-points",
    name: "Five Points",
    type: "Cheer zone",
    category: "cheerZones",
    description:
      "High-energy Riverside / Five Points area near restaurants and sidewalks along the run loop.",
    mobilityNotes:
      "Can get crowded. Pick a corner with shade and avoid blocking storefronts or narrow sidewalks.",
    bestTime: "Run loops, especially when the family wants food or coffee nearby.",
    coordinates: {
      lat: 30.3144,
      lng: -81.6813,
    },
    googleMapsUrl: mapsSearch("Five Points Jacksonville FL"),
  },
  {
    id: "ponte-vedra-a1a-bike",
    name: "Ponte Vedra / A1A bike cheer placeholder",
    type: "Bike cheer placeholder",
    category: "cheerZones",
    description:
      "Planning placeholder for the 2-loop bike course near Ponte Vedra and A1A / beach highway.",
    mobilityNotes:
      "Do not rely on this until road closures, parking, and course-side access are confirmed.",
    bestTime: "Bike course only, after tracker estimates show Ben approaching the area.",
    coordinates: {
      lat: 30.1786,
      lng: -81.3719,
    },
    googleMapsUrl: mapsSearch("Ponte Vedra Beach A1A"),
  },
  {
    id: "water-street-garage",
    name: "Water Street Garage",
    type: "Parking",
    category: "parking",
    description:
      "Downtown parking option to evaluate for Riverfront Plaza and finish-area access.",
    mobilityNotes:
      "Garage exits may be slow after the finish. Confirm race-day vehicle access and walking route.",
    bestTime: "Before heading to downtown or finish-area viewing.",
    coordinates: {
      lat: 30.3279,
      lng: -81.6626,
    },
    googleMapsUrl: mapsSearch("Water Street Garage Jacksonville FL"),
  },
  {
    id: "yates-garage",
    name: "Yates Garage",
    type: "Parking",
    category: "parking",
    description:
      "Downtown garage option to check for finish-line and Riverfront Plaza access.",
    mobilityNotes:
      "Leave extra time for elevator waits, payment lines, and downtown road closures.",
    bestTime: "Before finish-line viewing or downtown regrouping.",
    coordinates: {
      lat: 30.3282,
      lng: -81.6562,
    },
    googleMapsUrl: mapsSearch("Yates Garage Jacksonville FL"),
  },
  {
    id: "river-and-post",
    name: "River & Post",
    type: "Restaurant",
    category: "restaurants",
    description:
      "Riverside food option already on the support plan for a sit-down reset.",
    mobilityNotes:
      "Call ahead or confirm race-day hours. Expect waits if spectators cluster in Riverside.",
    bestTime: "Between long bike tracking windows or after repeated run sightings.",
    coordinates: {
      lat: 30.3175,
      lng: -81.6805,
    },
    googleMapsUrl: mapsSearch("River & Post Jacksonville FL"),
  },
  {
    id: "first-watch-riverside",
    name: "First Watch Riverside",
    type: "Restaurant",
    category: "restaurants",
    description:
      "Breakfast and lunch option near Riverside / Brooklyn for spectators who need a simple meal stop.",
    mobilityNotes:
      "May be busy on race morning. Keep this as a backup, not a timing-critical stop.",
    bestTime: "Morning backup or early lunch while Ben is on the bike.",
    coordinates: {
      lat: 30.3189,
      lng: -81.6696,
    },
    googleMapsUrl: mapsSearch("First Watch Riverside Jacksonville FL"),
  },
  {
    id: "homespun-kitchen",
    name: "Homespun Kitchen",
    type: "Restaurant",
    category: "restaurants",
    description:
      "Fast-casual Five Points food option for a lighter spectator meal.",
    mobilityNotes:
      "Five Points sidewalks can be tight. Send one person for pickup if the group needs to hold a viewing spot.",
    bestTime: "Run-loop break or quick food pickup.",
    coordinates: {
      lat: 30.3148,
      lng: -81.6819,
    },
    googleMapsUrl: mapsSearch("Homespun Kitchen Jacksonville FL"),
  },
  {
    id: "riverside-park",
    name: "Riverside Park",
    type: "Park / rest area",
    category: "parks",
    description:
      "Run-loop area and calmer green-space option in Riverside.",
    mobilityNotes:
      "Useful for shade and rest, but confirm course-side access before moving the whole group.",
    bestTime: "Run loops and low-stress regrouping.",
    coordinates: {
      lat: 30.3118,
      lng: -81.6877,
    },
    googleMapsUrl: mapsSearch("Riverside Park Jacksonville FL"),
  },
  {
    id: "willow-branch-park",
    name: "Willow Branch Park",
    type: "Park / rest area",
    category: "parks",
    description:
      "Confirmed run-loop area through Riverside with potential shade and space away from the densest finish crowds.",
    mobilityNotes:
      "Good candidate for a calmer stop, but sidewalks and crossings should be checked on race day.",
    bestTime: "Run loops, especially if the group needs a quieter viewing area.",
    coordinates: {
      lat: 30.3099,
      lng: -81.6945,
    },
    googleMapsUrl: mapsSearch("Willow Branch Park Jacksonville FL"),
  },
  {
    id: "riverwalk-accessible-viewing",
    name: "Downtown Riverwalk accessible viewing",
    type: "Mobility-friendly spot",
    category: "mobility",
    description:
      "Planning marker for paved Riverwalk viewing near downtown and Riverfront Plaza.",
    mobilityNotes:
      "Prioritize curb cuts, benches, shade, and shorter walks. Confirm barriers and accessible routes once race fencing is installed.",
    bestTime: "Late run loops and finish-area waiting.",
    coordinates: {
      lat: 30.3247,
      lng: -81.6608,
    },
    googleMapsUrl: mapsSearch("Jacksonville Riverwalk Riverfront Plaza"),
  },
  {
    id: "aid-riverside-approx",
    name: "Approx run aid station / Riverside",
    type: "Aid station / approximate",
    category: "aidStations",
    description:
      "Approximate run aid marker. The athlete guide notes aid stations roughly every mile, but exact locations should come from official race materials.",
    mobilityNotes:
      "Do not crowd aid tables or volunteers. Stand beyond the aid zone so Ben can grab supplies cleanly.",
    bestTime: "Run loops only.",
    coordinates: {
      lat: 30.3134,
      lng: -81.6844,
    },
    googleMapsUrl: mapsSearch("Riverside Jacksonville FL"),
  },
  {
    id: "aid-riverwalk-approx",
    name: "Approx run aid station / Riverwalk",
    type: "Aid station / approximate",
    category: "aidStations",
    description:
      "Approximate aid marker near the downtown Riverwalk portion of the 3-loop run.",
    mobilityNotes:
      "Leave room for runners, volunteers, and medical staff. Use this as orientation only.",
    bestTime: "Run loops and final approach toward downtown.",
    coordinates: {
      lat: 30.3229,
      lng: -81.6667,
    },
    googleMapsUrl: mapsSearch("Jacksonville Riverwalk"),
  },
  {
    id: "aid-willow-branch-approx",
    name: "Approx run aid station / Willow Branch",
    type: "Aid station / approximate",
    category: "aidStations",
    description:
      "Approximate aid marker for the Willow Branch / Riverside side of the run loop.",
    mobilityNotes:
      "Expect the exact aid setup to shift. Keep sidewalks open and avoid standing at narrow turns.",
    bestTime: "Run loops only.",
    coordinates: {
      lat: 30.3107,
      lng: -81.6944,
    },
    googleMapsUrl: mapsSearch("Willow Branch Park Jacksonville FL"),
  },
];
