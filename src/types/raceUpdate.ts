export type RaceUpdateType = "ben" | "parking" | "food" | "meetup" | "help" | "general";

export type RaceUpdate = {
  id: string;
  author: string;
  message: string;
  location: string | null;
  type: RaceUpdateType;
  createdAt: string;
  optimistic?: boolean;
};

export type RaceUpdateInput = {
  author: string;
  message: string;
  location?: string;
  type: RaceUpdateType;
};
