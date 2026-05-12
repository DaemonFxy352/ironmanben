export type MapCategory =
  | "raceAnchors"
  | "cheerZones"
  | "parking"
  | "restaurants"
  | "parks"
  | "mobility"
  | "aidStations";

export type MapCategoryMeta = {
  label: string;
  color: string;
};

export type MapPoint = {
  id: string;
  name: string;
  type: string;
  category: MapCategory;
  description: string;
  mobilityNotes: string;
  bestTime: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl?: string;
};
