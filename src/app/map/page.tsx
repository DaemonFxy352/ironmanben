import type { Metadata } from "next";
import { RaceDayAppLoader } from "@/components/RaceDayAppLoader";

export const metadata: Metadata = {
  title: "Map | Ben Race HQ",
  description:
    "Realtime family coordination map for Ben's IRONMAN Jacksonville race day support crew.",
};

export default function MapPage() {
  return <RaceDayAppLoader />;
}
