# Janith & Pradeepa — Digital Invitation

A premium, mobile-first Next.js invitation with independent Wedding and Homecoming experiences. Each route includes a cinematic opening gate, music controller, event details, countdown, automatic gallery, calendar download, RSVP form, media sections, and closing experience.

## Routes

- `/` — invitation chooser
- `/wedding` — Wedding invitation for 26 November 2026
- `/homecoming` — Homecoming Celebration for 30 November 2026
- `/api/rsvp` — server-only RSVP forwarding endpoint

## Develop and verify

Use a current Node.js release:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. For production checks:

```bash
npm run lint
npm run build
npm start
```

## Media

Add media at the exact paths in [ASSETS.md](./ASSETS.md). Missing photos receive an elegant fallback, missing videos use CSS/background imagery, missing music disables gracefully, and empty gallery sections are hidden.

Gallery files placed in the event's `gallery` directory are discovered and naturally sorted automatically. Supported formats are JPG, JPEG, PNG, WebP, and AVIF.

## RSVP configuration

Copy `.env.local.example` to `.env.local` and add the server-only Apps Script deployment URL:

```env
RSVP_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/.../exec
```

Then follow [docs/GOOGLE-SHEETS-SETUP.md](./docs/GOOGLE-SHEETS-SETUP.md). Without the variable, the form shows a clear configuration message rather than crashing.

## Venue configuration

Venue presentation is centralized in `src/data/invitations.js`. The Wedding is configured for Hemandra Grand Hotel with a directions link. The Homecoming is described only as taking place at the house in Pitigala and intentionally has no map link.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md). The intended Vercel project slug is `janith-pradeepa`.
