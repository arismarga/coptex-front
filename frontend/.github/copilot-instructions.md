# Copilot / AI assistant instructions for Coptex Frontend

## Short summary
- This repo is a **Next.js (App Router) + TypeScript** frontend for a headless WordPress/WooCommerce site (Coptex). Pages live in `app/` and are server components by default; interactive UI is implemented as client components (`"use client"`).

## Quick dev commands ✅
- Install: `npm install`
- Dev server: `npm run dev` (runs `next dev`)
- Build: `npm run build` (runs `next build`) and `npm start` for production
- Lint: `npm run lint` (ESLint)

## Required environment
- Create `.env.local` with:
  ```env
  NEXT_PUBLIC_WP_BASE_URL=http://coptex.local
  ```
- The frontend expects images and API to be served from the WP host above (see `next.config.ts` remotePatterns).

## Architecture & important files 🔧
- `app/` — Next App Router pages and layouts (server components by default).
  - `app/page.tsx` fetches slides with `getSlides()` and passes them to the client `HeroSlider` component.
  - `app/layout.tsx` imports global CSS and font setup.
- `components/sections/HeroSlider.tsx` — client component using `swiper` and `next/image` (`unoptimized` used in places). Note: it uses `"use client"` and expects a `slides: Slide[]` prop.
- `lib/wp/` — WordPress helpers
  - `lib/wp/slides.ts` — canonical `getSlides()` implementation, fetches `/wp-json/wp/v2/slide` with `_embed=1` and returns the normalized `Slide` objects.
  - `lib/wp/types.ts` — `Slide` and `WpSlideResponse` types (refer to these types when editing slide code).

## Project-specific patterns & conventions 💡
- Data fetching happens server-side in `app/` pages (await `getSlides()`), then data is passed into client components as props.
- Client components must use `"use client"` at the top of the file. Examples: `HeroSlider.tsx`.
- The hero slide title splitting: `splitTitle` splits on `|` to create multiple title lines; the second line is highlighted. Preserve this behavior when editing title display.
- Excerpts are HTML from WP and are rendered with `dangerouslySetInnerHTML` (field is `excerptHtml`). Keep this in mind when changing slide markup.
- Image URL normalization: `lib/wp/slides.ts` normalizes malformed prefixes (`http:/` → `http://`), keep or reuse this logic when handling remote media.
- `next.config.ts` contains remote image patterns for `coptex.local`. If you change image hosts, update this file.
- Styling: global CSS imported from `app/layout.tsx` (`app/assets/css/hero-slider.css`). The project uses Tailwind + PostCSS but the slider uses hand-written CSS.

## Integration points and external dependencies 🔗
- WordPress REST API: slides endpoint: `/wp-json/wp/v2/slide?per_page=20&orderby=menu_order&order=asc&_embed=1`
- Swiper (`swiper`) is used for sliders and requires its CSS imports inside the component.
- Next Image in places uses `unoptimized` (no Next image optimization), but `next.config.ts` still lists allowed remote patterns.

## Common edits and examples (do this way) ✍️
- Fetching: Use `lib/wp/slides.ts` as the single source of truth for slides. Example:
  ```ts
  // server component
  const slides = await getSlides();
  return <HeroSlider slides={slides} />;
  ```
- Display: Keep `dangerouslySetInnerHTML` for `excerptHtml` and preserve `splitTitle` behavior for titles.
- Safe image handling: ensure you keep the URL normalization and keep `unoptimized` where the component relies on Next image fill behaviour.

## Things to watch / gotchas ⚠️
- There are two similar files (`lib/wp.ts` and `lib/wp/slides.ts`). Use `lib/wp/slides.ts` + `lib/wp/types.ts` as the authoritative implementation.
- `NEXT_PUBLIC_WP_BASE_URL` is required; the app throws on missing value in `lib/wp/slides.ts`.
- No unit tests or CI configs are present. Add tests or CI only after discussing scope with maintainers.

## When to open a PR
- Small UI/bugfix: include visual screenshots or a short video and a link to the slide used in WP (if applicable).
- Data changes: reference the WP endpoint used and include sample JSON if you change parsing logic.

---
If any section is unclear or you'd like me to add examples for editing other parts (fonts, Tailwind, or adding pages), tell me which area and I'll expand the instructions or update the file.