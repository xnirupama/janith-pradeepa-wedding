# Wedding invitation upgrade

Both /wedding and /homecoming now use the same mobile layout, ornaments, tokens and interaction components. The wedding uses warm ivory, antique gold and brown; the homecoming uses deep maroon, the same gold and ivory.

## Implementation

- Shared cover, personalized hero/date block, event arches, countdown, story, gallery, venue/contact, RSVP and gold closing footer.
- Original English invitation copy centralized with respectful Sinhala drafts in src/data/translations.js. Dates, ceremony times, phone numbers, map URLs, calendar payloads and /api/rsvp remain unchanged.
- Language selection persists in localStorage between routes and reloads. A preference cookie lets the server render the saved language immediately. The existing preloader remains, with localized copy. The opening button waits for hydration without changing its label or width.
- Guest personalization supports ?guest=Name and the existing ?to=Name alias, limits names to 40 characters, removes controls/markup brackets/bidi marks, and renders them as escaped React text.
- Original opening films and music are preserved. No media request occurs before the opening tap. Muted inline mobile films use first-frame posters, a native modal dialog with keyboard focus containment, a skip action and a failure timeout. Replay preserves scroll position.
- Five-tab bottom navigation observes scrolling; music and navigation clear the safe area. Inputs use at least 16px type, controls have at least 44px targets, and reduced motion disables ambient/reveal effects.
- Gallery lightbox and map code load on demand. The lightbox supports swipe, actual two-finger pinch, pan, zoom controls, keyboard navigation and focus/scroll restoration, with Sinhala fonts in the modal. The map reserves its height before loading.
- Original RSVP handler, health route, validation, Google Apps Script, setup document and env example were restored from HEAD. The UI preserves the original fields and submission payload.
- Seating lookup and guest uploads are hidden by default in src/data/features.js. Their UI is disabled until a real backend is connected; the future data contracts are documented beside the flags.
- Existing OpenGraph generators and per-route theme colors are preserved. The selector now shows the authoritative homecoming venue from the shared config.
- Previously modified README.md, ASSETS.md and DEPLOYMENT.md were left intact.

## Asset results

| Asset | Original | Optimized |
| --- | ---: | ---: |
| Nine supplied photos/artwork/backgrounds | 8,756,113 bytes | 506,476 bytes |
| Wedding opening film | 7,195,820 bytes | 604,851 bytes |
| Homecoming opening film | 5,349,863 bytes | 483,336 bytes |

The films retain their full 10-second duration and composition at 406 x 720, H.264/yuv420p, no embedded audio and fast-start delivery. Full decoding passed. The originals remain in place. Photos and posters have verified dimensions and real tiny blur placeholders.

Regeneration scripts: scripts/prepare-invitation-assets.mjs and scripts/prepare-opening-films.mjs. The first needs the original photo/artwork sources; the second accepts FFMPEG_PATH and FFPROBE_PATH. Downloaded tools are isolated in ignored .task-tools, with no system installation.

## Mobile checklist actually run

Production build tested locally on 10 October 2026.

| Check | Result |
| --- | --- |
| npm run lint | Passed |
| npm run build | Passed |
| npm run verify | 8 groups passed: content/links, translation coverage, localization invariants, personalization, calendar payloads, RSVP validation, mocked handler/health branches and text contrast |
| Chromium + WebKit; both routes; EN + SI; 320 x 568, 360 x 740, 390 x 844, 430 x 932 and 1280 x 800 | All 40 scenarios passed |
| Cover and content horizontal overflow | None at tested widths |
| Cover and navigation targets | At least 44 x 44px |
| RSVP text input/textarea sizes | At least 16px |
| Long Sinhala guest/copy layout | Wrapped without horizontal overflow; cover remains vertically scrollable on short screens |
| Five nav destinations and active state | Passed |
| Pre-opening map/media loading | No iframe or MP3/MP4 request before opening |
| Gallery, both routes, Chromium + WebKit, EN + SI | All 8 cases passed: pinch 1-4x, pan, swipe, single-photo guard, keyboard controls, focus loop, Escape and scroll/focus restoration |
| Lazy map shell and scroll-observed Location navigation | Passed; loading the iframe did not change the map card height |
| Actual optimized opening playback | Both files reached readyState 4, playing, muted, inline; duration 10 seconds |
| Music play/pause/resume | Passed from opening tap and music button |
| Calendar sheet, Escape/focus and actual ICS downloads | Passed on both routes; Google links and Colombo/all-day dates verified |
| Language reload persistence; ?to alias; absent guest; literal dollar sequences | Passed; saved Sinhala also appeared in the server-rendered response |
| Countdown after event date | Celebration state passed on both routes |
| Share action | Passed with a mocked native share API; personalized URL retained |
| RSVP UI submission | Passed with mocked responses; no real guest submission or notification sent |
| Text contrast | Main text, muted text, gold text and footer/button gold surfaces passed 4.5:1 |

The 40-case layout matrix passed, followed by focused final regressions for media, language persistence, calendar/share actions, map loading and the Sinhala lightbox. Screenshots and JSON evidence are in artifacts/qa/mobile, artifacts/qa/gallery, artifacts/qa/actions and artifacts/qa/performance (ignored by Git).

## Measured performance

Cold-cache Chromium, 390 x 844 viewport, 150ms network latency, 1.6Mbps download and 4x CPU slowdown:

| Route | Language | Cover LCP | CLS | Media requests before tap |
| --- | --- | ---: | ---: | ---: |
| /wedding | EN | 1.912 seconds | 0.0002 | 0 |
| /homecoming | EN | 2.164 seconds | 0.0003 | 0 |
| /wedding | SI | 1.844 seconds | 0.0021 | 0 |
| /homecoming | SI | 2.300 seconds | 0.0021 | 0 |

These local simulated results meet the 2.5-second LCP target. Small residual font-swap shifts remain; no section-height jump occurred. These are not field measurements of Vercel or physical phones. Encoded JavaScript resources measured 598,876 bytes in the local server profile; the map, lightbox and success confetti are deferred.

## Assets/information to supply

- More distinct couple portraits for a fuller bento gallery, especially homecoming. Currently wedding has two and homecoming has one. No stock or duplicated filler photos were added.
- Venue line-art images, if desired.
- The wedding venue's full street address and exact map embed URLs, if desired; currently the embedded maps search the supplied venue/address and the original directions buttons use the authoritative links.
- Parents' names, only if you want them added to the hero.
- No new couple illustration or optimized opening film is required; existing artwork/photos and optimized film derivatives are already included.

## Known limitations

- Sinhala wording remains a draft for your review.
- Physical iPhone Safari/Android Chrome testing and live Vercel 4G measurements remain to be done; WebKit/Chromium were emulated locally.
- Live RSVP delivery was not sent. There is no .env.local in this workspace. The deployed site must retain RSVP_GOOGLE_SCRIPT_URL pointing to the existing Apps Script web app; follow docs/GOOGLE-SHEETS-SETUP.md for configuration and live verification.
- Existing homecoming OpenGraph artwork still says "At the house in Pitigala." It was kept unchanged as requested; the actual invitation and selector use Senwin Mandeer, Thalgaswala.
- Embedded map previews perform a venue search because no exact embed/pin coordinates were supplied. The existing map/directions links are unchanged.
- No deployment or push was performed.

## Repeat verification

1. Run npm run lint, npm run verify and npm run build.
2. Start production preview: npm run start -- --hostname 127.0.0.1 --port 3101.
3. Use a Playwright installation with Chromium and WebKit browsers. If it is outside the project, set INVITATION_PLAYWRIGHT_MODULE to its index.mjs path.
4. Set INVITATION_TEST_URL when using another host/port, then run npm run verify:mobile, npm run verify:gallery, npm run verify:actions and npm run verify:performance.
