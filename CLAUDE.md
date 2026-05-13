# IRONMAN Ben — v2 Redesign Instructions for Claude Code

## Context

This is a race-day coordination app for family and crew tracking Ben through IRONMAN Jacksonville. The current deployed version at `ironmanben.vercel.app` has serious UI problems: too dark for outdoor use, map-dominant when it should be comms-dominant, inconsistent design, and confusing interactions. You are rebuilding the **frontend only** — the backend (Supabase, data schema, realtime) is solid and stays unchanged.

Work on the `v2-redesign` branch. Do not touch `main`.

---

## What to Preserve — Do Not Rewrite These

- `supabase/migrations/` — DB schema is correct, leave it alone
- `src/data/mapPoints.ts` — All Jacksonville coordinates, cheer zones, parking data
- `src/types/map.ts` — Category type definitions
- `vercel.json` — Leave as-is
- `.env.example` — Leave as-is
- `next.config.ts` — Leave as-is unless a specific change is required
- `tailwind.config.ts` — You will extend this, not replace it

---

## What to Rebuild — All of src/app/ and src/components/

Delete and rewrite everything in `src/app/` and `src/components/`. The goal is a completely new UI built on the design system below.

---

## Tech Stack — No Changes Allowed

- Next.js App Router (keep)
- TypeScript (keep, strict)
- Tailwind CSS (keep, extend config as needed)
- Leaflet + OpenStreetMap (keep the map library, change the tile layer — see Map section)
- Supabase Realtime (keep all existing hooks and subscriptions)
- Vercel deployment (keep)

Do not introduce new major dependencies without asking first. Framer Motion is approved for animations. Everything else: ask first.

---

## Design System

### The Problem You Are Solving

The old design was dark, tactical, and map-forward. This app is used by family members — including older adults — standing outside in Florida sun, on their phones, under race-day stress. Every design decision must serve that reality.

### Core Principles

1. **Readability first.** Minimum 16px body text. Minimum 4.5:1 contrast ratio everywhere. No light gray text on dark backgrounds.
2. **Touch targets.** Minimum 48px tap targets on all interactive elements. Buttons should feel easy to tap on a moving phone.
3. **Info before map.** The status and comms panel is the primary UI. The map is a supporting reference. Never hide critical info behind a map interaction.
4. **One action at a time.** Don't show six things the user might want to do. Show the one most important thing clearly, with secondary actions clearly subordinate.
5. **Emotion-appropriate.** This is a celebration app. Ben is racing. Family is cheering. The UI should feel energetic and warm, not like a military ops center.

### Color Palette

```
Primary action:    #ADFF45   (lime green — keep from v1, it works)
Primary text:      #0D0D0D   (near black)
Background:        #F5F5F0   (warm off-white — replaces the dark)
Card background:   #FFFFFF
Accent warm:       #FF6B2B   (orange — for Ben's current stage badge)
Alert/danger:      #DC2626   (red — for "Need Help" only)
Success:           #16A34A   (green — for confirmed check-ins)
Muted text:        #6B7280   (gray — minimum size 14px when used)
Border:            #E5E5E0
```

Do not use any other accent colors. The old app had 6+ accent colors with no logic. This palette is fixed.

### Typography

Use the system font stack: `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

Scale:
- Hero/stage label: 28px bold
- Section header: 20px semibold  
- Body: 16px regular
- Caption/label: 14px regular — use sparingly
- Minimum on-screen size: 14px. Nothing smaller.

### Component Patterns

**Primary Button:** Full-width, 56px height, lime green (#ADFF45), black text, 12px border radius, bold 17px text.

**Secondary Button:** Full-width, 56px height, white background, black text, 1px solid border (#E5E5E0), 12px border radius.

**Danger Button:** Full-width, 56px height, #DC2626 background, white text. Use only for "Need Help/Water."

**Cards:** White background, 12px border radius, 16px padding, subtle shadow (`0 1px 3px rgba(0,0,0,0.08)`). No dark cards.

**Pill/Tag:** 8px vertical padding, 14px horizontal padding, 12px border radius, 14px text. Used for category selectors and layer toggles.

**Status Bar (Ben's current state):** Warm white card pinned to top of screen. Shows current stage + next checkpoint. This is always visible — never collapses or scrolls away.

---

## Screen Architecture

### Screen 1: Login

**Path:** `/` (unauthenticated)

Keep the existing login logic (Crew PIN). Redesign visually:
- Light background (#F5F5F0)
- "BEN RACE HQ" in lime green, 13px uppercase tracking-widest
- "Family Login" in 32px bold black
- Subtext: "Enter your crew code to join race day" — 16px, muted gray
- White input field, black border on focus, 56px height
- Primary button: "Enter Race HQ"
- "View as guest →" link below, muted, 15px

No dark background. No center-floating card with hard edges. Full screen, vertically centered content with generous padding.

---

### Screen 2: Main App Shell

**Path:** `/app` (authenticated or guest)

**Layout: Info-first, map-secondary**

The layout is a vertical stack, NOT a map with UI overlaid on top:

```
┌─────────────────────────────┐
│  BEN STATUS BAR (fixed top) │  ~100px, always visible
├─────────────────────────────┤
│                             │
│  MAP (collapsible)          │  ~35% of viewport height
│                             │
├─────────────────────────────┤
│                             │
│  MAIN PANEL (scrollable)    │  fills rest of screen
│  - What's Next              │
│  - Quick Sync               │
│  - Meetup Point             │
│                             │
├─────────────────────────────┤
│  ACTION BAR (fixed bottom)  │  ~80px, always visible
│  [Check In]  [Saw Ben]  [⊕] │
└─────────────────────────────┘
```

**Ben Status Bar (top, always visible):**
- White background, bottom border
- Left: stage emoji + stage name in 20px bold (e.g., "🏊 Swimming")
- Right: "ETA T1" label + time in 20px bold lime green
- Below: "NEXT: Memorial Park / Transition" in 13px muted gray
- Orange left-border accent (#FF6B2B) to make it feel alive

**Map section:**
- Use a LIGHT tile layer: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
- NOT the dark CARTO layer
- Ben's marker: custom SVG pin, orange circle with white star, 36px — clearly distinct
- Family markers: teal/blue dot, 20px, labeled with first name
- Parking markers: gray P badge
- No unlabeled colored blobs. Every marker type has a distinct icon.
- Tap the map to expand it to 60% viewport height. Tap again or tap a close handle to collapse.
- "⊕" button in action bar centers map on user's GPS location

**Main Panel (scrollable, below map):**

Sections in order:
1. **PIT WALL — What's Next** (task checklist for crew)
2. **Quick Sync** (one-tap status broadcasts)
3. **Meetup Point** (current rally point with Directions button)

Each section is a white card with 16px padding and the section title in 13px uppercase muted gray above bold content.

**Action Bar (bottom, always visible):**
- Fixed, white background, top border
- Left 45%: "Check In" — primary button (lime green)
- Right 45%: "Saw Ben" — secondary button (white/outlined)
- Right 10%: "⊕" — GPS crosshair icon button

---

### Sheet: Check In

Triggered by "Check In" button. Bottom sheet slides up.

Content:
- "Check In" header, 22px bold
- "Your name" text input (if not already saved)
- "What's your status?" — 2x3 grid of pill selectors:
  - "I'm Here 📍", "Heading Over 🚗", "At Parking 🅿️", "Getting Food 🍔", "Need Help 🆘", "All Good ✓"
- "Where are you?" — location pills from mapPoints.ts (Swim Exit, Five Points, etc.)
- "Add a note" — optional text input
- "Post Check-In" — primary button

---

### Sheet: Saw Ben

Triggered by "Saw Ben" button. Bottom sheet slides up.

Content:
- "Saw Ben! 🎉" header, 22px bold  
- "Tap where you spotted him" — location grid (same mapPoints locations)
- "Add a note (optional)" — text input
- "Post Sighting" — primary button (lime green)

This is simpler than v1. Remove the 6-category grid — "Saw Ben" is its own action, it doesn't need sub-categories.

---

### Panel Tab: Updates Feed

Accessible via "UPDATES" tab in the main panel (alongside LAYERS and CREW tabs).

Shows a reverse-chronological feed of:
- Check-ins from crew members
- Ben sightings
- Quick Sync broadcasts
- System updates (stage changes)

Each feed item:
- White card
- Left: colored dot by type (green = check-in, orange = sighting, blue = sync, gray = system)
- Name + action in bold 15px
- Location + time in 13px muted
- Note text if present in 15px regular below

---

### Panel Tab: Crew

Shows all crew members currently checked in. Each person:
- Name + their last known status
- Last seen location
- Time since last update

---

### Panel Tab: Layers

Toggle map layers on/off. Clean toggle switches, not pill buttons:
- Route (Ben's course)
- Family (crew location dots)
- Parking (parking markers)
- Mobility (accessible spots)

Each toggle: label left, iOS-style toggle right, muted description below label.

---

## Map Implementation Notes

**Switch the tile layer immediately** — this is the single highest-impact change:

Old (dark, unusable in sun):
```
https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```

New (light, readable):
```
https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
```

**Ben's marker:** Replace the red star-in-white-circle with a custom SVG:
```jsx
// Orange pin with white star center, drop shadow
// 36px diameter, always on top (zIndex 1000)
```

**Family markers:** Replace orange/red dots with teal (#0D9488) dots labeled with first name in a white pill above. 20px diameter.

**Remove:** The left-side floating layer pill buttons. Layer controls live only in the LAYERS tab now.

---

## Interaction Patterns

**Bottom sheet behavior:**
- Slides up from bottom with spring animation (Framer Motion `type: "spring", stiffness: 300, damping: 30`)
- Draggable handle at top (gray pill, 4px × 36px)
- Drag down to dismiss
- Background map dims to 40% opacity when sheet is open

**Map expand/collapse:**
- Tap map area to toggle between 35% and 60% viewport height
- Animate height change with `transition: height 0.3s ease`
- Show "▼ Collapse map" handle when expanded

**Quick Sync buttons:**
- Full width, one per row
- Lime green background for location-share actions
- Danger red background for "Need Help/Water" only
- Tap shows a 2-second confirmation toast: "✓ Sent to crew"

**Status updates:**
- Supabase realtime subscription updates Ben's status bar in place
- Pulse animation on the stage emoji when a new update arrives (1 second, then stops)

---

## Accessibility Requirements

These are non-negotiable. This app is used by people of all ages including seniors.

- All text: minimum 4.5:1 contrast ratio against background
- All interactive elements: minimum 48×48px tap target
- All buttons: visible focus ring (2px, lime green, 2px offset)
- No information conveyed by color alone — always pair color with text or icon
- Sheet overlays: respect `prefers-reduced-motion` — skip spring animation, use simple fade

---

## What NOT to Do

- Do not use the CARTO dark tile layer anywhere
- Do not put text on top of the map without a solid background behind it
- Do not use more than 4 accent colors total
- Do not make any font smaller than 14px
- Do not put interactive elements closer than 8px apart
- Do not use "PIT WALL" or other tactical jargon in UI labels visible to crew — keep it warm and human ("What's Next", "Your Crew", "Updates")
- Do not auto-open the map to full screen on load
- Do not replicate the 6-category Saw Ben form with the "Saw Ben" category highlighted in dark red

---

## File Structure Suggestion

```
src/
  app/
    page.tsx              # Login screen
    app/
      layout.tsx          # App shell with status bar + action bar
      page.tsx            # Main map + panel view
  components/
    ui/
      Button.tsx
      Sheet.tsx
      Card.tsx
      Toggle.tsx
      Toast.tsx
    map/
      RaceMap.tsx
      BenMarker.tsx
      FamilyMarker.tsx
      ParkingMarker.tsx
    panels/
      StatusBar.tsx
      MainPanel.tsx
      UpdatesFeed.tsx
      CrewPanel.tsx
      LayersPanel.tsx
    sheets/
      CheckInSheet.tsx
      SawBenSheet.tsx
  data/
    mapPoints.ts          # PRESERVED — do not rewrite
    visuals.ts            # PRESERVED — do not rewrite
  types/
    map.ts                # PRESERVED — do not rewrite
  lib/
    supabase.ts           # PRESERVED — do not rewrite
```

---

## Acceptance Criteria

Before considering any screen done, verify:

- [ ] All text passes 4.5:1 contrast on its background
- [ ] All buttons are at least 48px tall
- [ ] Screen is readable in bright light (test with screen brightness turned up, squint test)
- [ ] Map tile layer is LIGHT (not dark)
- [ ] No more than 4 accent colors visible at once
- [ ] Ben's status bar is visible without scrolling
- [ ] "Check In" and "Saw Ben" are always accessible from the action bar
- [ ] Bottom sheets are dismissible by dragging down
- [ ] Works on mobile viewport (375px width minimum)

---

## Start Here

1. Switch the map tile layer to `light_all` — immediate win, 5 minutes
2. Build the new `StatusBar` component
3. Build the new `ActionBar` component  
4. Scaffold the new layout shell (status bar top, map middle, panel below, action bar bottom)
5. Rebuild `CheckInSheet` and `SawBenSheet` with the new design system
6. Rebuild the `MainPanel` with What's Next, Quick Sync, Meetup Point
7. Rebuild the Updates, Crew, and Layers tabs
8. Polish: animations, toasts, accessibility pass

Do not start with the map marker icons or animation details. Get the layout and color system right first.
