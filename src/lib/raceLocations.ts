export type RaceDiscipline = "swim" | "bike" | "run" | "transition" | "finish";

export type RaceLocation = {
  coordinates?: {
    lat: number;
    lng: number;
  };
  description: string;
  discipline: RaceDiscipline;
  name: string;
  pointId?: string;
};

export const CHEER_LOCATIONS: RaceLocation[] = [
  {
    name: "Swim Exit",
    description: "T1 area · Post St Dock",
    discipline: "swim",
    pointId: "post-st-dock-swim-exit",
    coordinates: { lat: 30.3137, lng: -81.6789 },
  },
  {
    name: "Five Points",
    description: "Run · mile 14",
    discipline: "run",
    pointId: "five-points",
    coordinates: { lat: 30.3144, lng: -81.6813 },
  },
  {
    name: "Kings Ave Bridge",
    description: "Run · mile 18",
    discipline: "run",
    coordinates: { lat: 30.3157, lng: -81.6528 },
  },
  {
    name: "Riverside Ave",
    description: "Run · mile 10",
    discipline: "run",
    pointId: "riverside-arts-market",
    coordinates: { lat: 30.3167, lng: -81.6764 },
  },
  {
    name: "Memorial Park",
    description: "Transition · meetup",
    discipline: "transition",
    pointId: "memorial-park-transition",
    coordinates: { lat: 30.3121, lng: -81.6819 },
  },
  {
    name: "Finish Line",
    description: "Riverfront Plaza",
    discipline: "finish",
    pointId: "riverfront-plaza-finish",
    coordinates: { lat: 30.3254, lng: -81.6591 },
  },
  {
    name: "Other",
    description: "Type location",
    discipline: "run",
  },
];

export function getRaceLocation(name: string) {
  return CHEER_LOCATIONS.find((location) => location.name === name) ?? null;
}
