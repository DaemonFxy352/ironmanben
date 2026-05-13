export const RACE_START_TIME = "2026-05-12T07:00:00-04:00";
export const RACE_START_LABEL = "May 12, 2026, 7:00 AM ET";

export type RaceSegmentId = "swim" | "bike" | "run";

export type RaceSegment = {
  id: RaceSegmentId;
  name: string;
  distance: string;
  pace: string;
  startOffsetMinutes: number;
  durationMinutes: number;
  familyWindow?: string;
};

export const RACE_SEGMENTS: RaceSegment[] = [
  {
    id: "swim",
    name: "Swim",
    distance: "3.8 km",
    pace: "2:06 / 100m",
    startOffsetMinutes: 0,
    durationMinutes: 80,
  },
  {
    id: "bike",
    name: "Bike",
    distance: "180 km",
    pace: "36.0 km/h",
    startOffsetMinutes: 90,
    durationMinutes: 300,
    familyWindow: "Long Segment: Good time for lunch or a break. Ben expected at T2 in ~5 hours.",
  },
  {
    id: "run",
    name: "Run",
    distance: "42.2 km",
    pace: "5:41 / km",
    startOffsetMinutes: 398,
    durationMinutes: 240,
  },
];

export function raceStartMs() {
  return new Date(RACE_START_TIME).getTime();
}

export function addRaceMinutes(minutes: number) {
  return new Date(raceStartMs() + minutes * 60 * 1000);
}
