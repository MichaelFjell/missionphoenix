# Handoff: Warm Recovery redesign — Mission Phoenix

## Overview

This is a full visual redesign of **missionphoenix.life** (the "Mission Phoenix" pornography addiction recovery site). The redesign moves the site from the current darker / harsher aesthetic to a warmer, more hopeful "Warm Recovery" direction — cream background, charcoal ink, copper accents — while keeping every page's copy, structure, and functionality intact.

The new design was explicitly chosen from four explored directions (Disciplined Modern, Field Manual, Warm Recovery, Editorial). **Warm Recovery** won. This handoff implements that direction across every page on the live site.

Target repo: the existing Mission Phoenix codebase (React + Vite + Supabase) that you (Claude Code) built previously. The live site is at https://www.missionphoenix.life.

---

## About the design files

The `warm-recovery/` folder in this bundle is a set of **static HTML/CSS/JS design references** — they are *not* production code to copy directly.

Your job is to **recreate these designs in the existing React codebase**, preserving:
- React Router routes
- Supabase auth (username-based), database (habits, streaks, public notes, profiles)
- All existing API calls and state management
- The existing assessment quiz logic (which I verified against the repo — the copy and scoring in `assessment.html` matches the real `src/pages/Assessment.jsx` exactly)
- The existing tracker logic (daily quote overlay, note prompt with public toggle, 28-day calendar, streak setter, settings panel — the `tracker.html` mock mirrors `src/pages/Tracker.jsx` behavior but uses localStorage for the demo)
- The existing community page (Members tab + Public Notes tab, both reading from Supabase — the current production state is both empty, which the mock's "Empty state (real)" toggle renders correctly)

**Do not ship the HTML files as-is.** They have no backend, no auth, no real data, and would break every existing user account.

---

## Fidelity

**High-fidelity.** Every color, font size, spacing value, border radius, and copy string in the HTML is final. Treat the CSS values in `warm-recovery/site.css` and the per-page `<style>` blocks as the source of truth for the redesign.

If you need to decide between "match the mock exactly" vs. "follow an existing pattern in the React codebase," match the mock.

---

## Design tokens

Drop these into your theme (e.g. a CSS variables block in `src/index.css` or a Tailwind config). They are the complete palette — do not invent new ones.

```css
:root {
  /* Surfaces */
  --bg:        #f4ecdd;  /* page background (warm cream) */
  --bg-2:      #ebe1cd;  /* footer, subtle sections */
  --card:      #fbf5e8;  /* cards, inputs when focused */

  /* Ink */
  --ink:       #1d1915;  /* primary text */
  --ink-2:     #5c4f42;  /* secondary text / body copy */
  --ink-3:     #8a7c6b;  /* muted text / meta */

  /* Lines */
  --line:      #d8cdb6;  /* default border */
  --line-2:    #c4b79c;  /* stronger border (inputs, pills) */

  /* Accent — copper */
  --copper:      #a34620;
  --copper-2:    #8a3a1b;  /* hover */
  --copper-soft: rgba(163, 70, 32, 0.08);  /* tinted backgrounds */
}
```

### Typography

- **Family:** `'Manrope', -apple-system, system-ui, sans-serif` — load weights 400, 500, 600, 700, 800 from Google Fonts
- **Display (page titles):** `clamp(36px, 4.5vw, 56px)`, weight 800, line-height 1.05, letter-spacing -0.025em
- **Section titles:** 14px, weight 700, letter-spacing 1.5px, UPPERCASE, copper, with a 20×2px copper bar prefix
- **Eyebrow pills:** 13px, weight 600, copper, copper-soft background, 999px radius, 6×14 padding, small 6px copper dot prefix
- **Body:** 15–16px, weight 400, `var(--ink-2)`, line-height 1.6–1.85
- **Meta:** 11–13px, `var(--ink-3)`, often uppercase with 2–3px letter-spacing

### Spacing / radii

- Card padding: 32px (default), 48px (`pad-lg`)
- Card radius: 20px; smaller cards 12–14px
- Button radius: 10px default, 999px for pill buttons (donate, CTA)
- Input radius: 12px, padding 16×18

### Buttons

- `.btn.primary` — copper background, cream text, translateY(-1px) on hover
- `.btn.ghost` — transparent, `--line-2` border, copper border + text on hover
- Size modifier `.btn.sm` — 10×16 padding, 13px

### Brand mark

The phoenix icon is the existing `phoenix.png` from the live site (https://www.missionphoenix.life/phoenix.png). In the mocks it is referenced at `../assets/phoenix-ember.svg` with a CSS filter that recolors it to copper:

```css
filter: brightness(0) saturate(100%) invert(29%) sepia(50%) saturate(2180%) hue-rotate(357deg) brightness(90%) contrast(95%);
```

In the real app, use `phoenix.png` from `/public`, same filter. The copper mark appears in the nav brand (28×28) and hero displays (64×64).

---

## Pages (1:1 map to the existing app)

Every file in `warm-recovery/` maps to an existing React page. Preserve the real data/logic; replace the markup and styles.

| Mock file | React page | Notes |
|---|---|---|
| `index.html` | `src/pages/Home.jsx` | Hero + three pillars + assessment CTA + founder quote + archive teaser + footer. All copy verified against current live site. |
| `about.html` | `src/pages/About.jsx` | Mission, Michael's story, pullquotes, recommended books. Keep photo placeholder (column flex, center-aligned label) until real portrait is supplied. |
| `assessment.html` | `src/pages/Assessment.jsx` | 5-question quiz — **scoring logic, questions, severity thresholds, and all research facts are copied verbatim from the real page.** Rebuild as React state machine following the current component structure; only the visual shell changes. |
| `tracker.html` | `src/pages/Tracker.jsx` | Login gate → dashboard. Contains: physical-tracker PDF callout, settings toggle, "Already on a streak?" import (only shown when user has zero days), 28-day mini calendar with click-to-toggle, daily quote overlay after logging, public/private note prompt, recent notes list. **All of this exists in the current React Tracker page — just restyle.** Do not use the mock's localStorage; keep Supabase. |
| `community.html` | `src/pages/Community.jsx` | Two tabs: Members + Public Notes. The mock defaults to the REAL empty state (matching the current production state) and has a secondary "Sample data (preview)" toggle which you should **remove** when implementing — ship only the empty state + real Supabase-backed lists. |
| `archive.html` | `src/pages/Archive.jsx` | Content archive / article index. Keep existing data source. |
| `article.html` | `src/pages/Article.jsx` | Single article template. |
| `donate.html` | `src/pages/Donate.jsx` | Donation page with existing Stripe/whatever integration. |
| `contact.html` | `src/pages/Contact.jsx` | Contact form — preserve existing form handler. |
| `login.html` | `src/pages/Login.jsx` | Username/password login + signup toggle. Preserve Supabase auth. |
| `demo.html` | `src/pages/Demo.jsx` | Existing demo / welcome page. |
| `404.html` | `src/pages/NotFound.jsx` | 404 page. |

### Shared chrome

`warm-recovery/chrome.js` injects the top nav and footer into every page (keyed off `<body data-active="...">`). In React, build these as `<SiteNav />` and `<SiteFooter />` components in `src/components/` and render them in a shared layout route. Active link state uses the current route (`useLocation().pathname`).

**Nav links (in order):** Home · Archive · Assessment · Tracker · Community · About · Contact · **Donate** (pill button, copper background)

Nav is sticky with `rgba(244,236,221,0.92)` background + `backdrop-filter: blur(8px)` + 1px bottom border in `--line`.

**Footer** has three columns (brand+tagline, Resources links, Connect links) plus a bottom bar with copyright + disclaimer + "Recovery is possible." tagline in copper.

---

## Interactions & behavior

Most behaviors already exist in your app. Preserve them, restyle them. Key ones:

- **Assessment:** Progress bar updates per question; multi-select question requires a continue button; results render with an animated score bar (`transition: width 1.5s ease` on `.score-fill`).
- **Tracker → check-in:** On successful check-in, show a full-viewport quote overlay (backdrop-filter blurred). Dismiss → show the public/private note prompt inline below the streak counter. Skipping the note is a valid path.
- **Tracker → calendar:** Each cell toggles the corresponding date in Supabase. Future dates are non-interactive. Today's cell has a 2px copper ring.
- **Tracker → streak import:** The "Already on a streak?" card is only rendered when the user has zero logged days. After import, it's replaced by the normal dashboard. The same import control lives in the Settings panel permanently.
- **Community tabs:** Members / Public Notes. Preserve the current Supabase queries. Both tabs should render the empty-state message already used in the real page when no rows exist.
- **Quote overlay:** Pick one quote per (date, username) deterministically (seeded hash → index into a quote pool). The current Tracker already does this; keep its implementation, just restyle the overlay to match `.quote-overlay` / `.quote-box` in `tracker.html`.

### Transitions

- Nav link hover: color → copper (150ms)
- Buttons: `translateY(-1px)` on primary hover (200ms)
- Card hover (grid cells, member cards): border-color → copper (150–200ms)
- Score bar fill: 1500ms ease
- Progress bar fill: 500ms ease

---

## Responsive

Designed mobile-first but comfortable to 1200px+. Breakpoint hints already in each file:

- Nav wraps naturally at narrow widths
- Tracker calendar grid collapses from `repeat(14, 1fr)` → `repeat(7, 1fr)` under 640px
- Tracker two-stat row collapses to single column under 640px
- Page titles use `clamp()` for fluid sizing

No JS-based responsive logic is needed.

---

## Assets

- **`phoenix.png`** — already in `/public` on the live site. Used as the brand mark, recolored to copper via CSS filter (see Brand mark section above). No other icons are needed.
- **Manrope** font — Google Fonts: `https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap`
- No photo assets required for launch. The About page has a placeholder card where Michael's portrait will eventually go.

---

## Deployment plan (suggested)

1. **Tag the current live site** before starting:
   ```bash
   git tag pre-redesign-$(date +%Y-%m-%d)
   git push origin pre-redesign-$(date +%Y-%m-%d)
   ```
2. **Work on a branch** (`warm-recovery-redesign`), page by page, verifying each against its mock.
3. **Keep the dev preview open** at localhost and compare visually to the corresponding HTML file in `warm-recovery/`.
4. **Do not touch Supabase schema** — this is purely a frontend refactor.
5. **Before merging to main:** test the tracker end-to-end (login → check-in → quote overlay → note → calendar toggle), test the assessment end-to-end (intro → 5 questions → results), and verify the nav active state on every page.
6. **Deploy via the existing Vercel/Netlify/Cloudflare Pages pipeline.** If anything looks wrong in production, the hosting dashboard's "Rollback to previous deployment" button is the fastest revert — the git tag is the backup of last resort.

---

## Files in this bundle

- `warm-recovery/index.html` — homepage
- `warm-recovery/about.html` — about / Michael's story
- `warm-recovery/assessment.html` — 5-question self-assessment quiz
- `warm-recovery/tracker.html` — daily tracker (login + dashboard)
- `warm-recovery/community.html` — members + public notes
- `warm-recovery/archive.html` — content archive
- `warm-recovery/article.html` — single article template
- `warm-recovery/donate.html` — donation page
- `warm-recovery/contact.html` — contact form
- `warm-recovery/login.html` — auth
- `warm-recovery/demo.html` — demo page
- `warm-recovery/404.html` — not-found page
- `warm-recovery/site.css` — shared stylesheet (tokens + global components)
- `warm-recovery/chrome.js` — nav + footer injector (reference only; rebuild as React components)

Open any file in a browser to see the final look. Hover states, tab switches, quiz flow, tracker login + check-in + calendar toggles are all live in the static prototype.
