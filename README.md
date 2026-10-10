# Janith & Pradeepa — Digital Invitation

A mobile-first Next.js invitation with a shared layout and separate ivory and maroon themes. Each route includes a personalized cover, cinematic opening, music, event arches, countdown, gallery, calendar download, lazy venue map and gold Contact footer. Decorative videos and rotating ornaments respect visibility, connection and motion preferences.

## Routes

- `/` — invitation chooser
- `/wedding` — Wedding invitation for 26 November 2026
- `/homecoming` — Homecoming Celebration for 30 November 2026

## Develop and verify

Use a current Node.js release:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. For production checks:

```bash
npm run lint
npm run verify
npm run build
npm start
```

## Media

See [ASSETS.md](./ASSETS.md). Source videos are archived in `media-sources/` and excluded from Vercel uploads. Only compatible silent derivatives and graded portraits are served from hashed files in `public/assets/*/media/`; the two existing hero illustrations remain in `optimized/`. Posters remain visible when video playback is unsuitable or blocked.

Gallery files placed in the event's `gallery` directory are discovered and naturally sorted automatically. Supported formats are JPG, JPEG, PNG, WebP, and AVIF.

## Venue configuration

Venue presentation is centralized in `src/data/invitations.js`: Hemandra Grand Hotel for the wedding; Senwin Mandeer, Thalgaswala for homecoming. The couple's original map links and telephone numbers are retained.

## Verification and media inventory

See [ADDON-DIAGNOSIS.md](./ADDON-DIAGNOSIS.md), [ADDON-ASSETS.md](./ADDON-ASSETS.md) and [ADDON-UPGRADE.md](./ADDON-UPGRADE.md) for the current diagnosis, exact asset tables, test matrix and limitations. [INVITATION-UPGRADE.md](./INVITATION-UPGRADE.md) records the previous upgrade. Browser scripts use Playwright with Chromium and WebKit; set `INVITATION_PLAYWRIGHT_MODULE` when using an installation outside this project.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md). The intended Vercel project slug is `janith-pradeepa`.
