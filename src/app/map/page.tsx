import type { Metadata } from "next";
import { SupportPlanner } from "@/components/SupportPlanner";

export const metadata: Metadata = {
  title: "Map | Ben Race HQ",
  description:
    "Race course map for IRONMAN Jacksonville 2026 with recommended cheer spots and parking.",
};

export default function MapPage() {
  return <SupportPlanner />;
}
