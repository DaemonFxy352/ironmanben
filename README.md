# IRONMAN Jacksonville Support HQ

A realtime race-day coordination map for family and friends tracking Ben through IRONMAN Jacksonville.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Leaflet + OpenStreetMap
- Supabase Realtime
- Ready for Vercel

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000`.

The app renders without Supabase variables, but live check-ins and updates require:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Production Build

```bash
npm run build
```

Vercel should use the standard Next.js build output. Do not set a custom Output Directory in Vercel project settings.

## Supabase Setup

Run the SQL files in `supabase/migrations/` in order in the Supabase SQL editor, then add the environment variables from `.env.example`. Enable Supabase phone OTP auth with an SMS provider for family login. Full setup and reset notes are in `docs/supabase-setup.md`.

## Updating the Hero Image

The homepage uses one visual background at `public/assets/bens-crew-sunset.png`. Replace that file to update the current Ben's Crew sunset image.

The component reads the path from `src/data/visuals.ts`, which keeps the app ready for later phase-based imagery without adding a carousel now.

## Deploying to Vercel

1. Push this repository to GitHub.
2. Go to Vercel and create a new project from the GitHub repository.
3. Keep the default framework preset as Next.js.
4. Use the default build command: `npm run build`.
5. Leave Output Directory blank.
6. Deploy.

## Reusing as a Template

Most location-specific content lives in `src/data/mapPoints.ts`. The hero image path lives in `src/data/visuals.ts`.

## Updating Map Markers

Spectator map markers live in `src/data/mapPoints.ts`. Each marker has a name, type, category, description, mobility notes, best time, coordinates, and optional Google Maps link.

To add a marker, copy an existing object in `mapPoints`, give it a unique `id`, choose one category from `src/types/map.ts`, and update the latitude/longitude:

```ts
{
  id: "example-cheer-spot",
  name: "Example Cheer Spot",
  type: "Cheer zone",
  category: "cheerZones",
  description: "Short spectator-facing note.",
  mobilityNotes: "Parking, shade, crossings, or crowd notes.",
  bestTime: "Run loops or bike window.",
  coordinates: {
    lat: 30.32,
    lng: -81.66,
  },
  googleMapsUrl: mapsSearch("Example Cheer Spot Jacksonville FL"),
}
```

The current map intentionally uses markers only. Route lines should be added later after the course details are stable.
