import type { Metadata } from "next";
import { RaceDayAppLoader } from "@/components/RaceDayAppLoader";

export const metadata: Metadata = {
  title: "Ben Race HQ | IRONMAN Jacksonville",
  description:
    "Realtime family coordination map for Ben's IRONMAN Jacksonville race day support crew.",
};

export default function Home() {
  return <RaceDayAppLoader />;
}
