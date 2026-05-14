import type { Metadata } from "next";
import { SupportPlanner } from "@/components/SupportPlanner";

export const metadata: Metadata = {
  title: "Ben Race HQ | IRONMAN Jacksonville",
  description:
    "Plain-English plan for family and friends supporting Ben at IRONMAN Jacksonville 2026.",
};

export default function Home() {
  return <SupportPlanner />;
}
