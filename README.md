# IRONMAN Jacksonville Support HQ

A lightweight, static-friendly race support website for family and friends tracking Ben through IRONMAN Jacksonville.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Static export friendly
- Ready for Vercel

## Local Setup

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Production Build

```bash
npm run build
```

The project is configured with `output: "export"` in `next.config.ts`, so a production build creates a static `out/` directory.

## Deploying to Vercel

1. Push this repository to GitHub.
2. Go to Vercel and create a new project from the GitHub repository.
3. Keep the default framework preset as Next.js.
4. Use the default build command: `npm run build`.
5. Deploy.

## Reusing as a Template

Most race-specific content lives in `src/data/race.ts`. Update the athlete name, race title, overview cards, timeline, locations, and recommendations for future races.

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
