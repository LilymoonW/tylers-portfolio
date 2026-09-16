# Tyler Yoon — Portfolio

Personal portfolio for Tyler Yoon: VFX, motion graphics, and design.
Built with Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4,
Framer Motion and Lenis. Deployed on Vercel.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm start          # serve the production build
npm run lint       # eslint
npm run compress:videos   # re-encode public/video (see below)
```

## Layout

```
src/app/        routes: / , /portfolio , /portfolio/[projectId] , /contact
src/components/ UI; work/ holds the portfolio + project-page pieces
src/config/     tuning constants (type scale, intro motion, marquee)
src/data/       projects, brands, tools — the content source of truth
src/assets/     bundled media (eye sprites, the Inter subset)
public/         video, posters, thumbnails, brand logos, textures
```

## Content

Projects live in `src/data/projects.ts`. Each entry needs an `id` (also the
URL segment), `title`, `thumbnail`, and either a `videoSrc` (local file) or an
`embedUrl` / `cardHref` (social post). `featured: true` puts it on the home
carousel.

## Media

Video is the bulk of the payload, so re-encode before committing anything new:

```bash
VIDEO_MAX_DIM=1080 VIDEO_CRF=27 npm run compress:videos
```

Then extract a poster to `public/video/posters/<name>.jpg` — the players derive
that path from the video filename. Images in `src/assets` and `public/textures`
are WebP; thumbnails go through `next/image`.

## Fonts

One variable Inter file, Latin subset, at `src/assets/fonts/`. It is loaded via
`next/font/local` in `src/lib/fonts.ts`; there is no font in `public/`.

## Motion

Animation respects `prefers-reduced-motion`, and the footer control between the
carousels toggles it site-wide via `<html data-motion>`.
