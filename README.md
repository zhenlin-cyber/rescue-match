# Rescue Match 🐾

A cinematic, scroll-driven web experience that matches you with a Bay Area rescue pet based on your birthday.

**The concept:** Enter your birthday → choose your energy → follow your constellation → meet a real rescue animal from a Bay Area shelter who arrived on your exact birth date.

---

## What It Does

Most pet adoption sites are search engines. Rescue Match is a story. The user travels through an immersive 3D portal, makes three small choices, and arrives at a list of real rescue animals with a personal connection: the animal entered the shelter system on the same month and day as the user's birthday.

Every profile links directly to the shelter — one email away from starting the adoption process.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| 3D portal engine | Three.js r128 (custom `rm3d.js`) |
| Hero logo | Three.js `TextGeometry` + custom GLSL gradient shader |
| Nav gradient text | React Bits `GradientText` (CDN-compatible, `requestAnimationFrame`) |
| Cursor effect | Canvas API — shooting star with comet tail |
| Audio | Web Audio API ambient drone + chime (`rm-audio.js`) |
| Pet data | RescueGroups.org v5 API |
| Deployment | Vercel serverless (`api/rescues.js`) |

---

## Project Structure

```
rescue_matching/
├── index.html              # Main cinematic portal (single-page scroll experience)
├── public/
│   ├── pets.html           # Rescue pet results page
│   ├── GradientText.jsx    # Animated gradient text (CDN React, no bundler needed)
│   ├── GradientText.css    # Gradient text styles + nav/hero size overrides
│   ├── rm3d.js             # Three.js scroll-driven 3D portal engine
│   ├── rm-text-3d.js       # Three.js 3D hero logo with GLSL animated gradient shader
│   ├── rm-font-loader.js   # Three.js FontLoader (local copy, r135)
│   ├── rm-text-geometry.js # Three.js TextGeometry (local copy, r135)
│   ├── rm-audio.js         # Ambient Web Audio drone + chime
│   ├── tweaks-panel.jsx    # Dev tweaks panel (dust/glow/darken/hue sliders)
│   └── uploads/            # Video assets (beginning loop, portal journey, ending loop)
├── api/
│   ├── rescues.js          # Vercel serverless handler
│   └── _rescues-logic.js   # Core fetch + filter logic (shared by dev server and prod)
├── src/
│   ├── components/
│   │   └── GradientText/   # Framer Motion version (for Vite React pages)
│   └── services/
│       └── api.js          # Client-side fetch wrapper
└── vite.config.js          # Dev proxy: /api/rescues → _rescues-logic.js
```

---

## Key Features

### Cinematic Scroll Experience
Three videos crossfade as the user scrolls: beginning loop → portal journey → ending loop. The portal journey is scrubbed forward in real-time (never seeks backward — every frame plays). A Three.js particle dust field fills the tunnel. Non-linear scroll mapping keeps the intro tight, the portal middle stretched, and the end quick.

### Birthday Matching
1. User picks birth month + day
2. API fetches animals from ~20 Bay Area shelter orgs in parallel
3. Client filters by species (cat/dog) and matches `createdDate` to the birth month/day
4. Falls back to same-month matches if no exact-day results exist

### RescueGroups.org v5 API
- Endpoint: `GET /public/orgs/{orgId}/animals?limit=250&include=species,orgs`
- Species resolved from the `included` array (cat = 3, dog = 8)
- Org attributes supply shelter name, email, phone, and website
- Adoption CTA: pre-filled `mailto:` using the shelter's `rescueId` (internal animal ID)

### 3D Interactive Logo
**Hero (constellation screen):** Three.js `TextGeometry` — "RESCUE / MATCH" — with a custom GLSL fragment shader that replicates the CSS `background-size: 300%` gradient animation in object space. The gradient yoyos on a 4-second cycle across colors `#5227FF → #D97706 → #FFE880 → #FF9FFC → #40ffaa → #4079ff`. Mouse tracking drives group rotation with spring damping.

**Nav logo:** `GradientText` CSS animation (same palette) with `perspective()` CSS 3D tilt on hover — snaps back with a spring ease on mouse leave.

### Shooting Star Cursor (`pets.html`)
Fixed `<canvas>` overlay (`pointer-events: none`, `z-index: 9999`). Maintains a 380ms ring buffer of mouse positions. Draws a tapered comet tail with alpha and line-width proportional to recency and freshness. A slowly rotating 4-pointed sparkle star sits at the cursor head with a soft amber halo, plus a smaller counter-rotating sparkle at the tail midpoint.

### Navigation
- **Logo on main page:** Resets the full experience — instant scroll to top, video rewind, intro screen restored, scroll relocked.
- **Logo on rescue page:** Navigates back to `/`.
- **"How It Works" modal:** 4-step explainer with a backdrop-blur overlay. Closes on Escape, backdrop click, or the × button.

---

## Running Locally

```bash
npm install
npm run dev
# → http://localhost:5173
```

The Vite dev server proxies `/api/rescues` to `api/_rescues-logic.js` so pet data works without deploying.

**Required:** Place video files in `public/uploads/`:
- `beginning loop.mp4`
- `portal-journey.mp4`
- `ending_loop.mp4`

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `RESCUEGROUPS_API_KEY` | RescueGroups.org v5 API key — currently hardcoded in `_rescues-logic.js` for dev; move to env var for production |

---

## Deploying to Vercel

```bash
vercel deploy
```

`api/rescues.js` exports a standard Vercel serverless function. `vite build` output goes to `dist/` and is served as static files.

---

## Bay Area Shelter Coverage

~20 RescueGroups org IDs are hardcoded in `api/_rescues-logic.js` as `BAY_AREA_SAMPLE_ORGS`. To expand coverage, add org IDs from the RescueGroups public directory.

---

## Credits

- Pet data: [RescueGroups.org](https://rescuegroups.org) v5 API
- 3D engine: [Three.js](https://threejs.org) r128
- Gradient text animation: [React Bits](https://reactbits.dev) `GradientText` component (adapted for CDN use)
- Fonts: [Syne](https://fonts.google.com/specimen/Syne) · [Nunito Sans](https://fonts.google.com/specimen/Nunito+Sans) · [Varela Round](https://fonts.google.com/specimen/Varela+Round)
