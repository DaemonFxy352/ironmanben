import type { Metadata } from "next";
import { RaceDayAppLoader } from "@/components/RaceDayAppLoader";

export const metadata: Metadata = {
  title: "Live Race Day | Ben Race HQ",
  description:
    "Live race-day coordination map for Ben's IRONMAN Jacksonville support crew.",
};

export default function RaceDayPage() {
  return <RaceDayAppLoader />;
}
