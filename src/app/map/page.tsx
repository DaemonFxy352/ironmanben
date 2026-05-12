import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SpectatorMapLoader } from "@/components/SpectatorMapLoader";

export const metadata: Metadata = {
  title: "Spectator Map | IRONMAN Jacksonville Support HQ",
  description:
    "Interactive spectator marker map for Ben's IRONMAN Jacksonville family support crew.",
};

const notes = [
  "Course and parking access may change on race day.",
  "Use the IRONMAN Tracker app for official timing.",
  "This map is a family planning aid, not an official race map.",
  "Marker locations are approximate and should be checked against the final athlete guide.",
];

export default function MapPage() {
  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />

      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="mb-4 inline-flex w-fit rounded-full border border-river/25 bg-river/10 px-3 py-1 text-sm font-bold uppercase text-river">
            Spectator map
          </p>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-black leading-tight text-ink sm:text-5xl">
                Find the next useful spot fast
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/70">
                Marker-first planning for cheer spots, parking, restaurants, parks,
                transition areas, mobility-friendly viewing, and approximate aid stations.
              </p>
            </div>
            <a
              className="focus-ring rounded-md border border-ink/15 bg-white px-5 py-3 text-center text-sm font-bold text-ink transition hover:border-river hover:text-river"
              href="/#updates"
            >
              Back to race HQ
            </a>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
          <SpectatorMapLoader />

          <aside className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase text-surge">Map notes</p>
            <h2 className="mt-2 text-2xl font-black text-ink">Before you move</h2>
            <ul className="mt-4 space-y-3">
              {notes.map((note) => (
                <li key={note} className="flex gap-3 text-sm leading-6 text-ink/70">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-surge" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-md bg-paper p-4">
              <h3 className="text-sm font-black uppercase text-river">
                Route lines are not included yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink/70">
                This first pass ships the marker map only. Course lines can be added after
                the site skeleton and location data are stable.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <footer className="border-t border-ink/10 bg-white px-4 py-8 text-center text-sm font-semibold text-ink/60 sm:px-6 lg:px-8">
        Built for race day support
      </footer>
    </main>
  );
}
