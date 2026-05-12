export type CheckInSource = "gps" | "manual";

export type CheckIn = {
  id: string;
  name: string;
  note: string | null;
  lat: number;
  lng: number;
  createdAt: string;
  source: CheckInSource;
  optimistic?: boolean;
};

export type CheckInInput = {
  name: string;
  note?: string;
  lat: number;
  lng: number;
  source: CheckInSource;
};
