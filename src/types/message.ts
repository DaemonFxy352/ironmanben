export type QuickMessageKind = "finish" | "memorial_park" | "lunch" | "help_water";

export type QuickMessage = {
  id: string;
  author: string;
  message: string;
  location: string | null;
  kind: QuickMessageKind;
  createdAt: string;
  optimistic?: boolean;
};

export type QuickBroadcastTemplate = {
  kind: QuickMessageKind;
  label: string;
  message: string;
  location: string;
};
