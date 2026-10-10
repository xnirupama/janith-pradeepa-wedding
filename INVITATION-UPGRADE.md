# Invitation motion upgrade

Historical report. The current add-on supersedes playback, asset paths and previews; see [ADDON-UPGRADE.md](./ADDON-UPGRADE.md).

Implemented on 10 October 2026 for /wedding and /homecoming. The shared portrait invitation is centred at a maximum 480px width on desktop, with each theme filling the canvas.

## Plan implemented

1. Inspect both routes, shared sections, actions and all 18 existing video files at 1, 5 and 9 seconds before assigning them.
2. Use the wedding floral frame for its cover, ivory silk for its hero and drifting ivory petals for its gold footer. Use maroon silk for the homecoming cover and hero, reusing one asset, and gold bokeh for its footer.
3. Compress the selected clips, strip audio, generate WebP posters and archive all originals outside public.
4. Remove the guest response form and backend completely, along with optional seating/upload scaffolds and unused dependencies. Move contact assistance and the original call links into the gold footer; the fifth navigation destination becomes Contact.
5. Add slow rotating SVG layers, visibility-aware playback and fallbacks; keep the event content and existing actions; test phones, languages, reduced motion and Slow 4G.

## Shared implementation

- Ivory/gold/brown wedding and maroon/gold/ivory homecoming use the same components and CSS variables for colours, gradients, spacing, radii, width and motion.
- next/font retains Cormorant Garamond, Great Vibes, Manrope and Noto Serif Sinhala with display: swap and selected subsets. English and respectful Sinhala drafts live in src/data/translations.js; language persists in localStorage and a server-rendering preference cookie.
- The cover retains the preloader, Sri Subha Mangalam greeting, escaped/sanitized guest line and user-gesture opening/music start. Only cover assets preload.
- Date artwork, event arches, countdown/arrival state, original narrative, real photos and gold closing copy remain. Existing dates, venues, phone numbers, map links, calendar payloads, route metadata and OpenGraph generators are unchanged.
- Rotating mandalas use independent 112s and 136s layers in opposite directions. Event halos take 48-56s; the venue halo takes 54s; countdown/footer dotted rings take 58s; the music ring takes 20s and exists only while playing.
- Only the ornament layers rotate. IntersectionObserver pauses off-screen layers; hidden tabs pause rotations, petals, videos and music. User-paused music stays paused after returning.
- Background videos appear only in the cover, hero and footer. They are muted, looping, inline, decorative, have metadata preload and disable picture-in-picture. Sources attach after the poster is decoded and painted and fonts are ready. Only an in-view eligible player starts; the manager enforces a maximum of two concurrent backgrounds, and opening/replay pauses all backgrounds before playback.
- Playback fades over its poster in 400ms. Save-Data, 2G/3G or low downlink, reduced motion and rejected autoplay retain the poster. A stalled VP9 decoder retries H.264 after 2.5s, over the same poster, and gives up safely if playback cannot start.
- The map and lightbox remain dynamically loaded. Gallery sizing matches the 480px column; swipe, pinch, pan, keyboard controls and focus/scroll restoration remain intact.
- The Contact footer contains the original assistance copy and tel links, Share Invitation, Replay Opening and Back to top. No form, guest-feature flag or old form anchor remains. The removed API and health endpoint both return HTTP 404.
- Safe-area padding, viewport-fit=cover, dvh/svh, 44px targets, frosted surfaces with solid fallbacks, focus outlines and generous Sinhala line height are retained. Text contrast was checked against even fully white or black video frames under the scrims.

## Every inspected source video

All 16 originals below are **10.000 seconds, 1080 x 1920, portrait, 24 fps, H.264, with a stereo AAC audio track**. File sizes are bytes. Source files remain unchanged in media-sources/{event}/videos/; they are excluded from Vercel uploads. Together they total 88,188,529 bytes.

| Original file | Observed scene | Bytes | Assignment |
| --- | --- | ---: | --- |
| wedding-soft-light-loop.mp4 | Ivory silk and soft shadows | 3,877,572 | Archived; unused |
| wedding-petals-loop.mp4 | White petals and gold bokeh | 3,923,001 | Archived; unused |
| wedding-opening-couple.mp4 | Couple in ivory outdoors | 7,195,820 | Opening and replay |
| wedding-opening-couple 2.mp4 | Alternative couple scene with white petals | 5,858,911 | Archived; unused |
| wedding-hero-loop.mp4 | Ivory silk and floral bokeh | 4,066,580 | Hero |
| wedding-floral-loop.mp4 | Soft leaf shadows on paper | 3,342,762 | Archived; unused |
| wedding-floral-frame-loop.mp4 | Ivory rose border, clear centre | 4,680,198 | Cover |
| wedding-closing-loop.mp4 | White petals between ivory drapes | 4,159,458 | Footer |
| homecoming-petals-loop.mp4 | Red roses, petals and bokeh | 6,671,584 | Archived; unused |
| homecoming-opening-couple.mp4 | Couple in maroon with Homecoming Day backdrop | 5,349,863 | Opening and replay |
| homecoming-opening-couple 2.mp4 | Alternative couple scene with red petals | 6,401,023 | Archived; unused |
| homecoming-hero-loop.mp4 | Maroon silk and gold particles | 6,050,943 | Cover and hero (one shared file) |
| homecoming-glow-loop.mp4 | Rose border around an ivory centre | 5,617,437 | Archived; unused |
| homecoming-floral-frame-loop.mp4 | Maroon rose border around ivory centre | 5,948,033 | Archived; unused |
| homecoming-countdown-butterfly-loop.mp4 | Rose frame with butterflies and petals | 10,459,661 | Archived; unused |
| homecoming-closing-loop.mp4 | Gold bokeh and rose petals on maroon | 4,585,683 | Footer |

The two existing opening-mobile.mp4 derivatives were also inspected at 1/5/9s. Both are 10s, 406 x 720, portrait, 24 fps, H.264 and silent. Their scenes match their respective original opening films; they remain the opening/replay files.

The full per-file ffprobe inventory is in media-sources/video-inventory.json. The three contact sheets and 54 extracted frames are in ignored artifacts/qa/video-inspection/. No external video repository or new generated footage was needed.

## Published video sizes and fallbacks

| Use | Original bytes | H.264 MP4 bytes | VP9 WebM bytes |
| --- | ---: | ---: | ---: |
| wedding: cover | 4,680,198 | 503,917 | 384,302 |
| wedding: hero | 4,066,580 | 573,714 | 389,442 |
| wedding: closing | 4,159,458 | 601,223 | 438,400 |
| homecoming: Cover + hero | 6,050,943 | 944,991 | 859,578 |
| homecoming: closing | 4,585,683 | 676,357 | 467,861 |
| wedding: opening/replay | 7,195,820 | 604,851 | H.264 only |
| homecoming: opening/replay | 5,349,863 | 483,336 | H.264 only |

All five new backgrounds are 540 x 960, portrait, 24 fps and 10s. All published videos are silent; MP4 files have faststart. Complete MP4 and WebM decoding passed. Selected originals total 36,088,545 bytes; the seven H.264 derivatives total 4,388,389 bytes, an 87.8% reduction. WebM is retained only when smaller.

Cover/hero/footer each have their own WebP poster; homecoming cover and hero share the silk file and poster. Reduced motion, Save-Data, slow connections or denied autoplay show the poster, with CSS ornaments when motion is permitted. Opening and replay use the existing optimized H.264 couple films only after a tap; reduced-motion/connection fallbacks skip the film transition while music still requires the opening gesture.

Scripts: scripts/prepare-background-videos.mjs and scripts/prepare-opening-films.mjs. Both accept FFMPEG_PATH and FFPROBE_PATH; portable tools remain isolated in ignored .task-tools.

## Checklist actually run

| Check | Result |
| --- | --- |
| npm run lint; npm run build | Passed; no response API routes in the build |
| npm run verify | 8 groups passed: facts/links, bilingual dictionary coverage/encoding, localization invariants, removed features, personalization, calendars, media provenance/size and contrast |
| Chromium + WebKit, both routes, EN + SI, 320x568 / 360x740 / 390x844 / 430x932 / 1280x800 | All 40 layout scenarios passed with reduced motion |
| Overflow, long Sinhala guest strings, 44px controls, Contact nav, footer calls and 480px desktop column | Passed |
| Normal, reduced motion, Save-Data, 3G and blocked autoplay; both routes and browsers | All 20 media/motion scenarios passed |
| Off-screen rotation/video pause; hidden-tab audio/video/rotation pause and resume | Passed; visibility events simulated in isolated browsers |
| Concurrent video limit | Never exceeded two; measured maximum was one in these scenarios |
| WebKit stalled VP9 recovery | H.264 playback succeeded over the retained poster |
| EN + SI lightbox, both routes and browsers | All 8 cases passed: real Chromium two-touch pinch, pan, swipe, 1-4x limits, keyboard/focus, Escape and scroll restoration |
| Opening/replay, music controls, actual ICS downloads, calendar focus and Google URL payloads | Passed on both routes |
| Native share; saved language, cookie and Sinhala server rendering; guest alias/fallback | Passed; native share mocked, no external messages sent |
| Countdown after event date | Celebration state passed |
| Venue map | Lazy iframe and stable reserved height passed; original directions targets preserved |
| Removed /api/rsvp and /api/rsvp/health | Both return HTTP 404 |
| Original video shipping | All 16 originals are outside public; none appears in the 11 production file traces |
| Text contrast including brightest/darkest possible video backing | At least 4.5:1 passed |

The final media regressions and lightbox/action checks followed the layout matrix. Layout tests used an isolated Google-map response to avoid external network delays; the live Google search pin was not verified. Evidence is in ignored artifacts/qa/mobile, gallery, actions, motion and performance.

## Slow 4G measurements

Cold-cache Chromium at 390 x 844, 150ms latency, 1.6Mbps download and 4x CPU slowdown. Metrics continued for seven seconds after fonts loaded, including cover video startup:

| Route | Language | Cover LCP | CLS | Video bytes before tap | Audio requests before tap |
| --- | --- | ---: | ---: | ---: | ---: |
| /wedding | EN | 1.824s | 0.0002 | 384,302 | 0 |
| /homecoming | EN | 2.356s | 0.0003 | 859,578 | 0 |
| /wedding | SI | 2.016s | 0.0021 | 384,302 | 0 |
| /homecoming | SI | 2.268s | 0.0022 | 859,578 | 0 |

All four local simulated LCP readings meet the 2.5s target. Only one cover video was requested before opening, well under the 5MB budget; the opening film and music were not requested. Encoded JavaScript resources measured 581,985 bytes locally; map and lightbox remain deferred. No video source swap changes section geometry.

## Assets/information still useful

- More distinct couple portraits, especially for homecoming: the current real-photo gallery has two wedding photos and one homecoming photo.
- Parents' names, only if they should appear in the hero.
- Full wedding venue street address and exact map embed URLs, if desired. Current map previews search by the supplied venue/address; original directions links are retained.
- Optional venue line art. No new couple artwork, opening film or background video is required.

## Known limitations

- Sinhala wording is a draft for the couple's proofreading.
- Small font-swap layout shifts remain (CLS 0.0002-0.0022); text and section heights remain stable. These are local simulated performance readings, not physical Android/iPhone or Vercel field measurements.
- Safari Low Power Mode and connection fallback were simulated; physical phone testing remains to be done.
- Exact Google pin placement remains unverified; the saved directions buttons are authoritative.
- Existing homecoming OpenGraph artwork still mentions the house in Pitigala, retained unchanged as requested. The invitation uses Senwin Mandeer, Thalgaswala.
- The upgrade is committed and synced to GitHub main. A live Vercel release or field performance result has not been verified.

## Repeat checks

Run npm run lint, npm run verify and npm run build, then npm run start -- --hostname 127.0.0.1 --port 3101. With Playwright and Chromium/WebKit installed, run verify:mobile, verify:gallery (EN and QA_LANGUAGE=si), verify:actions, verify:motion and verify:performance (EN and QA_LANGUAGE=si). INVITATION_PLAYWRIGHT_MODULE can point to an external Playwright installation; INVITATION_TEST_URL changes the preview host. QA_ENGINES, QA_ROUTES and QA_PROFILES can filter the motion matrix.
