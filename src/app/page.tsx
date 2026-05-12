import { Section } from "@/components/Section";
import { SiteHeader } from "@/components/SiteHeader";
import { SupportCard } from "@/components/SupportCard";
import {
  cheerZones,
  foodRecommendations,
  mobilityTips,
  raceOverview,
  timeline,
} from "@/data/race";

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-paper">
      <SiteHeader />

      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="mb-4 inline-flex w-fit rounded-full border border-surge/25 bg-surge/10 px-3 py-1 text-sm font-bold uppercase text-surge">
              Race Day Support
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-tight text-ink sm:text-5xl lg:text-6xl">
              IRONMAN Jacksonville Support HQ
            </h1>
            <p className="mt-5 max-w-2xl text-xl font-semibold leading-8 text-ink/70">
              Tracking Ben through race day
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="focus-ring rounded-md bg-ink px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-river"
                href="/map"
              >
                Open spectator map
              </a>
              <a
                className="focus-ring rounded-md border border-ink/15 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:border-river hover:text-river"
                href="#updates"
              >
                Check live updates
              </a>
              <a
                className="focus-ring rounded-md border border-ink/15 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:border-river hover:text-river"
                href="#cheer-zones"
              >
                Find cheer zones
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-ink/10 bg-paper p-4 shadow-soft">
            <div className="rounded-md bg-white p-5">
              <p className="text-sm font-bold uppercase text-river">Race day snapshot</p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ["Swim", "2.4"],
                  ["Bike", "112"],
                  ["Run", "26.2"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-ink/10 p-3 text-center">
                    <p className="text-2xl font-black text-ink">{value}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-ink/60">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                <div className="h-2 rounded-full bg-river" />
                <div className="h-2 rounded-full bg-surge" />
                <div className="h-2 rounded-full bg-split" />
              </div>
              <p className="mt-5 text-sm leading-6 text-ink/70">
                Keep this page focused: where to be, when to move, what to bring, and
                where to meet after Ben finishes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Section
        id="overview"
        eyebrow="Course overview"
        title="Three parts, one support plan"
        description="Simple reference cards for the parts of the day that matter most to spectators."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {raceOverview.map((item) => (
            <SupportCard
              key={item.title}
              title={item.title}
              label={item.label}
              meta={item.meta}
              tone={item.tone}
            >
              <p>{item.copy}</p>
            </SupportCard>
          ))}
        </div>
      </Section>

      <Section
        id="timeline"
        eyebrow="Timeline"
        title="Race day rhythm"
        description="Use this as a quick scan before moving locations. Exact times should come from official race tracking."
      >
        <div className="rounded-lg border border-ink/10 bg-white shadow-soft">
          {timeline.map((item, index) => (
            <div
              key={item.title}
              className="grid gap-3 border-b border-ink/10 p-5 last:border-b-0 sm:grid-cols-[8rem_1fr]"
            >
              <p className="text-sm font-black uppercase text-river">{item.time}</p>
              <div>
                <h3 className="font-bold text-ink">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-ink/70">{item.detail}</p>
                {index < timeline.length - 1 ? (
                  <div className="mt-4 h-1 w-16 rounded-full bg-surge/70" />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="cheer-zones"
        eyebrow="Cheer zones"
        title="Places to regroup and support"
        description="These are placeholder locations to validate against the final race guide and road closure map."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {cheerZones.map((zone) => (
            <SupportCard
              key={zone.title}
              title={zone.title}
              label={zone.label}
              meta={zone.meta}
              tone={zone.tone}
            >
              <p>{zone.copy}</p>
            </SupportCard>
          ))}
        </div>
      </Section>

      <Section
        id="logistics"
        eyebrow="Logistics"
        title="Parking and mobility tips"
        description="The best plan is the one that still works when traffic, closures, and fatigue stack up."
      >
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <h3 className="text-lg font-bold text-ink">Move less, cheer better</h3>
            <ul className="mt-4 space-y-3">
              {mobilityTips.map((tip) => (
                <li key={tip} className="flex gap-3 text-sm leading-6 text-ink/70">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-surge" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div id="food" className="grid gap-4 sm:grid-cols-2">
            {foodRecommendations.map((place) => (
              <SupportCard
                key={place.title}
                title={place.title}
                label={place.label}
                meta={place.meta}
                tone={place.tone}
              >
                <p>{place.copy}</p>
              </SupportCard>
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="updates"
        eyebrow="Live updates"
        title="Race-day notes will go here"
        description="Keep this section manually updated with short, timestamped notes from the family text thread or official tracker."
      >
        <div className="rounded-lg border border-dashed border-river/40 bg-white p-5 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
            <p className="text-sm font-black uppercase text-river">Placeholder</p>
            <div>
              <h3 className="font-bold text-ink">No live updates yet</h3>
              <p className="mt-1 text-sm leading-6 text-ink/70">
                Add Ben's swim start, transition updates, bike checkpoints, run sightings,
                and finish status here on race day.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="finish"
        eyebrow="Finish line"
        title="Meetup after Ben finishes"
        description="Finish areas are crowded. Pick a simple nearby landmark and wait until Ben clears athlete services."
      >
        <div className="rounded-lg border border-ink/10 bg-ink p-5 text-white shadow-soft sm:p-6">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h3 className="text-xl font-black">Finish line meetup</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                Final location to be confirmed after the official athlete guide is published.
                Share the pinned meetup spot in the family thread before the race starts.
              </p>
            </div>
            <a
              className="focus-ring rounded-md bg-white px-5 py-3 text-center text-sm font-bold text-ink transition hover:bg-paper"
              href="#top"
            >
              Back to top
            </a>
          </div>
        </div>
      </Section>

      <footer className="border-t border-ink/10 bg-white px-4 py-8 text-center text-sm font-semibold text-ink/60 sm:px-6 lg:px-8">
        Built for race day support
      </footer>
    </main>
  );
}
