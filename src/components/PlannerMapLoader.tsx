"use client";

import dynamic from "next/dynamic";

const DynamicPlannerMap = dynamic(
  () => import("@/components/PlannerMap").then((module) => module.PlannerMap),
  {
    ssr: false,
    loading: () => (
      <div className="planner-map-loading">
        <p>Loading race map…</p>
      </div>
    ),
  },
);

export function PlannerMapLoader({ focusId }: { focusId?: string | null }) {
  return <DynamicPlannerMap focusId={focusId} />;
}
