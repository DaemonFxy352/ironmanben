export const raceOverview = [
  {
    title: "Swim",
    label: "Start smart",
    meta: "2.4 mi",
    tone: "river",
    copy:
      "Expect crowded transitions and limited sight lines near the water. Pick one clear meeting point before the start.",
  },
  {
    title: "Bike",
    label: "Long stretch",
    meta: "112 mi",
    tone: "surge",
    copy:
      "Use bike viewing stops only where parking is realistic. Ponte Vedra is a placeholder option for a quieter check-in.",
  },
  {
    title: "Run",
    label: "High energy",
    meta: "26.2 mi",
    tone: "split",
    copy:
      "Stay flexible and keep phones charged. The run is the best time for repeat sightings and quick encouragement.",
  },
] as const;

export const timeline = [
  {
    time: "Morning",
    title: "Pre-race staging",
    detail: "Arrive early, confirm the family text thread, and set expectations for limited movement near the start.",
  },
  {
    time: "Swim exit",
    title: "First athlete check",
    detail: "Watch tracker updates and avoid crossing restricted athlete paths around transition.",
  },
  {
    time: "Bike course",
    title: "Long tracking window",
    detail: "Use official tracker estimates before moving between viewing areas.",
  },
  {
    time: "Run course",
    title: "Best support window",
    detail: "Choose visible cheer zones, keep signs simple, and plan short walks between repeat sightings.",
  },
  {
    time: "Finish",
    title: "Meetup after the line",
    detail: "Let Ben clear athlete services first, then regroup at the agreed finish line meetup spot.",
  },
] as const;

export const cheerZones = [
  {
    title: "Memorial Park",
    label: "Primary",
    meta: "Riverside",
    tone: "river",
    copy:
      "Good placeholder home base for spectators who want shade, open space, and a recognizable location in Riverside.",
  },
  {
    title: "Riverside",
    label: "Walkable",
    meta: "Flexible",
    tone: "split",
    copy:
      "Useful for regrouping, food breaks, and low-stress movement between support points if the course layout allows.",
  },
  {
    title: "Ponte Vedra bike viewing",
    label: "Bike",
    meta: "Drive plan",
    tone: "surge",
    copy:
      "Placeholder bike-course viewing option. Confirm race-day access, road closures, and parking before committing.",
  },
] as const;

export const mobilityTips = [
  "Assume road closures will change the fastest route throughout the day.",
  "Keep one shared car location pinned in the family text thread.",
  "Use comfortable shoes, sunscreen, water, and a small battery pack.",
  "Avoid tight transfer plans between bike and run viewing spots.",
] as const;

export const foodRecommendations = [
  {
    title: "River & Post",
    label: "Food",
    meta: "Riverside",
    tone: "mile",
    copy:
      "Placeholder recommendation for a sit-down reset near Riverside. Confirm hours and race-day crowds before relying on it.",
  },
  {
    title: "Quick snacks",
    label: "Backup",
    meta: "Pack ahead",
    tone: "split",
    copy:
      "Bring water, salty snacks, and simple breakfast items so support plans do not depend entirely on restaurant timing.",
  },
] as const;
