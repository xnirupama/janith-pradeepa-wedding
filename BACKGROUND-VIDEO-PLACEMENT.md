# Background video review and placement

Review completed before application changes, 11 October 2026. Scope: both existing routes; preserve all copy, links, phone numbers, opening/gate, music, countdown, shared themes, and rotating ornament behavior.

## Actual shared section order

`src/app/wedding/page.js` and `src/app/homecoming/page.js` both render `EventExperience`:

1. Route preloader (`loading.js`, `LotusLoader`).
2. `InvitationGate`, then the full requested ten-second `OpeningFilm`; `MusicController` starts from Open.
3. `HeroSection` (`#top`), title, date, illustrated couple.
4. Invitation message inline section (`#invitation-message`).
5. `EventSchedule` (`#event-details`), three wedding events or one homecoming arrival, date/calendar actions.
6. `Countdown`.
7. `PhotoFeature` (Together, Always).
8. `Gallery`.
9. Inline Celebrate With Us section.
10. `LocationSection` (`#location`).
11. `ClosingSection` (`#contact`), names, closing copy, contact, Share/Replay/Back to top.

There is no RSVP section, string, style, API/server action, dependency, or navigation anchor in `src`/`package.json`. The fifth nav item is already Contact. Retain this actual order.

## Clip review

Fresh ffprobe results for every original and compatible derivative are in `media-sources/ambient-frame-audit.json`. All originals are H.264 High, 1080×1920, 24 fps, ten seconds, opaque (no alpha). They contain audio; compatible derivatives are silent Main 3.1/yuv420p/faststart, 540×960 (opening 406×720), 24 fps. Original sizes below are bytes.

Three frames per original were extracted with ffmpeg at 0, 5 and 9.95 seconds and visually reviewed in the two contact sheets under `artifacts/qa/ambient-review`. Loop descriptions compare these samples; the measured seam pixel difference is a diagnostic, not proof of seamless motion. Selected clips will receive an encoded one-second dissolve so the last frame joins the first.

| Clip | Original bytes | Visual review and decision |
|---|---:|---|
| wedding-closing-loop | 4,159,458 | Ivory roses, curtain and large falling petals; light cream/gold, moderately busy with a strong exposure/shape change at the seam. Skip; keep closing copy/contact clear. |
| wedding-floral-frame-loop | 4,680,198 | White roses around a pale ivory center with soft leaf shadows and small gold flecks; moderate motion, imperfect seam. Existing gate only, unchanged. |
| wedding-floral-loop | 3,342,762 | Quiet leaf silhouettes on warm ivory, a few soft gold lights; light, calm, nearly matching seam. Choose hero, multiply, with a baked dissolve. |
| wedding-hero-loop | 4,066,580 | Broad ivory fabric sweeps across bright gold bokeh; light, large moving edges through the title area, mismatching seam. Skip. |
| wedding-opening-couple 2 | 5,858,911 | Couple in white indoors, warm bright bokeh and moving framing; light, meaningful portrait with a large seam jump. Unused alternate opening; never ambient. |
| wedding-opening-couple | 7,195,820 | Couple in white outdoors, green foliage and flowers; light/green, portrait motion, non-looping narrative. Preserve current opening unchanged. |
| wedding-petals-loop | 3,923,001 | Ivory petals and softly glowing gold points in a pale floral frame; light, moderate edge motion, center stays open, close seam. Choose celebration with a baked dissolve and restrained opacity. |
| wedding-soft-light-loop | 3,877,572 | Large ivory/gold silk folds and flower shadows; light, calm speed but broad shape changes through text and mismatching seam. Skip. |
| homecoming-closing-loop | 4,585,683 | Dark maroon glow with small warm gold lights and an occasional isolated red petal; dark, calmest maroon clip, imperfect seam. Choose hero at low screen opacity with a baked dissolve. |
| homecoming-countdown-butterfly-loop | 10,459,661 | Dense red rose frame around a bright ivory center with butterflies/petals; light center, busy localized motion, mismatching seam. Skip: theme clash and countdown remains CSS only. |
| homecoming-floral-frame-loop | 5,948,033 | Maroon roses/green leaves surrounding a large pale center, drifting petals; light center, moderate motion, mismatching seam. Skip on maroon. |
| homecoming-glow-loop | 5,617,437 | Rectangular ivory panel with ornate gold lines and dark rose border; light, moderate petals, hard edges and changing brightness. Skip on maroon. |
| homecoming-hero-loop | 6,050,943 | Maroon satin with bright gold bokeh; dark, large moving folds and mismatching seam. Existing gate only, unchanged; avoid behind hero text. |
| homecoming-opening-couple 2 | 6,401,023 | Couple in formal maroon/black, dark backdrop with gold/red petals; dark, portrait/camera motion, obvious seam. Unused alternate opening; never ambient. |
| homecoming-opening-couple | 5,349,863 | Couple in formal maroon at their decorated indoor setting with visible Homecoming Day backdrop; light, narrative portrait, non-looping. Preserve existing opening; do not reuse behind text. |
| homecoming-petals-loop | 6,671,584 | Dark red rose edges, gold bokeh and drifting red petals; dark maroon/gold, busier than hero, mismatching seam. Choose only the sparse celebration band at 18%, with a baked dissolve. |

No selected ambient clip contains text, a watermark, flashing light, or transparent pixels. Bright-center homecoming alternatives would wash out the maroon palette; no new clip is needed with the selected dark assets.

## Placement decided before implementation

| Video | Page | Section | Layer opacity | Blend | Reason |
|---|---|---|---:|---|---|
| wedding-floral-loop | wedding | Hero | .22 | multiply | Quiet ivory shadows, open center, title remains crisp. |
| wedding-petals-loop | wedding | Celebrate With Us | .24 | multiply | Floral motion belongs in the sparse band; soft edge masks. |
| homecoming-closing-loop | homecoming | Hero | .22 | screen | Dark maroon with restrained warm light; avoids large satin folds. |
| homecoming-petals-loop | homecoming | Celebrate With Us | .18 | screen | Dark floral palette; low opacity and scrim suppress brighter petals. |

Two content ambient instances per page, plus the one existing gate backdrop that disappears on Open: never more than three ambient instances in a page lifecycle. Opening remains its single existing film and suspends decorative playback. Closing gets no video because it includes dense copy/contact controls; its gold gradient and CSS circles remain. Countdown, message, portraits, gallery, timeline, map and contact remain free of video.

Use one encoded seamless file per placement, rather than stacked playback instances. Only hero receives early media priority after content mounts. Celebration uses preload none and viewport observers. Retain the shared player’s real-playing fade, stall/decoder fallback, maximum-two scheduler, hidden-tab/offscreen pause and far-away source cleanup. All new placements are poster-only for reduced motion, Save-Data, slow connections and low-memory devices; the existing opening and gate policies remain unchanged.

Implementation and measured verification results will be appended after the review commit.

### Restraint adjustment during media verification

The proposed homecoming petal band failed the stricter encoded seam review (7.92 mean pixel difference, compared with 1.59–2.73 for the other selected loops). Its bright bokeh and larger petals also make it the busiest candidate. Drop it entirely rather than relaxing the check. Homecoming therefore has **one content ambient video**, in Hero; Celebrate With Us uses its existing maroon surface and faint CSS mandalas. Wedding keeps its two planned placements. This stays below the three-instance limit including the unchanged gate.

## Final implementation

| Page / placement | Source bytes | Final MP4 bytes | WebP poster bytes | Opacity / blend | Loop seam difference |
|---|---:|---:|---:|---|---:|
| Wedding Hero, floral shadows | 3,342,762 | 427,880 | 16,784 | .22 / multiply | 1.59 |
| Wedding Celebrate With Us, ivory petals | 3,923,001 | 601,234 | 14,450 | .24 / multiply | 2.73 |
| Homecoming Hero, maroon/gold glow | 4,585,683 | 657,224 | 13,400 | .22 / screen | 1.68 |

These three mobile MP4s are silent H.264 Main 3.1, yuv420p, faststart, 540×960, fixed 24 fps, 9.083 seconds including the baked one-second dissolve and boundary frames. Each file was fully decoded after encoding. No stacked video instances or runtime crossfade are needed. New layers are graded with saturate(.85), masked at both edges, and covered by theme-color scrims (minimum alpha .5). Darker small gold and muted text are scoped to the two wedding ambient sections; shared themes remain unchanged.

Hero has early poster/media priority once content mounts. The wedding celebration player has preload none and attaches its source only when visible; an observer watches one screen beyond the viewport for memory cleanup. Offscreen and hidden players pause; far-away players drop their sources. Real playing is required before video fades in. Policy vetoes, blocked autoplay, decode/network failure or a four-second stall show the equally graded poster with CSS ornaments, without ambient controls or a black box.

Unchanged: both gate clip URLs/bytes/presentation, both ten-second opening films and trusted-tap behavior, music/controller, all EN/SI copy and factual data, links, calendar, contacts, countdown, existing rotating-circle CSS, all portrait files and lightbox. The celebration band is now full width with soft edges and faint CSS mandalas. Closing loses its decorative video so its dense text/contact/actions remain on the original gold surface.

Unused old hero/closing derivatives and rejected alternatives are outside `public`, archived in `media-sources`, which `.vercelignore` excludes from deployment. `npm run prepare:videos` regenerates base media then the selected seamless assets. The three new MP4s total 1,686,338 bytes; their posters total 44,634 bytes. No new asset is required. If floral motion is wanted on Homecoming later, regenerate a **dark maroon loop with small, slow petals, restrained gold lights, and matching first/last framing**; avoid bright ivory center panels.

## Verification

- `npm run build`, `npm run lint` and all eight preservation/media/contrast checks passed.
- Chromium + WebKit at 390×844: 32 route/profile cases passed (normal, Save-Data, low memory, 3g, reduced motion, rejected autoplay, forced stall and hidden/visible tab). No page errors or console warnings/errors. No videos behind prohibited sections, no RSVP, fifth nav Contact, at most two simultaneous playing videos, and far-away sources released.
- Eight final screenshot cases capture both pages in both engines, with video and poster-only mode. Tall sections were scrolled through before capture so all reveal-on-scroll content is visible. Full 390px screenshots for the nine content sections, gate and opening are in `artifacts/qa/ambient-final-{chromium,webkit}`. Compact comparison sheets are committed in [docs/ambient-preview](./docs/ambient-preview): left video enabled, right Save-Data poster mode. All sheets were visually reviewed. Map embeds use an isolated test fixture; original links remain verified.
- Eight opening regression cases passed in Chromium/WebKit, including four natural full-film completions and four trusted-gesture requirements. The opening does not inherit ambient policy vetoes.
- Eight 390px EN/SI route/engine layout cases passed, with no JavaScript errors and working Contact navigation/footer. Four final live-page cases passed (both routes in both engines), including actual ambient playback, matching posters, all section screenshots, source cleanup and an empty console error/warning log.
- Every frame of every new clip was decoded for a brightness scan. A conservative bound using solid black/white frames, the weakest scrim and 10% ornament/texture influence gives minimum small-text contrast 4.92:1 (Wedding Hero), 4.81:1 (Wedding celebration), and 7.07:1 (Homecoming Hero). See `media-sources/ambient-contrast-verification.json`; this bound also covers the brightest decoded frame.
- Final local cold mobile performance: 150ms latency, 1.6Mbps download, 4× CPU throttle. Wedding LCP 3,008ms / CLS 0; Homecoming LCP 2,288ms / CLS .0003. The earlier run measured 2,408ms / 2,312ms; timings vary, so a universal sub-2.5-second LCP is not claimed. No new ambient or opening file, and no audio, loaded before Open.
- Final pre-interaction video bounds: Wedding 0 bytes when the connection policy chose its poster; Homecoming 1,781,746 bytes charging both observed cover requests the entire WebM file. The earlier Wedding run received 957,478 bytes. All are below the 5MB target. Native streaming can omit unfinished requests from Resource Timing; the report includes a conservative full-file-per-request bound rather than treating missing entries as zero downloads.
- Both live route HTML responses contain the new asset URLs. All three new MP4s and their posters returned 206 for a 0–1023 range, correct MIME/file size and `public, max-age=31536000, immutable`. Runtime deployment commit: `7471b90`.

Results, final live checks and mobile EN/SI checks are recorded in `media-sources/ambient-placement-verification.json`. These are isolated browser-engine/mobile-emulation checks; physical iPhone low-power mode, Samsung Internet and social-app webviews were not tested. Browser/connection restrictions can suppress decorative videos; the requested opening film retains its existing tap-to-play recovery.

## Final implementation

| Page / placement | Source bytes | Final MP4 bytes | WebP poster bytes | Opacity / blend | Loop seam difference |
|---|---:|---:|---:|---|---:|
| Wedding Hero, floral shadows | 3,342,762 | 427,880 | 16,784 | .22 / multiply | 1.59 |
| Wedding Celebrate With Us, ivory petals | 3,923,001 | 601,234 | 14,450 | .24 / multiply | 2.73 |
| Homecoming Hero, maroon/gold glow | 4,585,683 | 657,224 | 13,400 | .22 / screen | 1.68 |

These three mobile MP4s are silent H.264 Main 3.1, yuv420p, faststart, 540×960, fixed 24 fps, 9.083 seconds including the baked one-second dissolve and boundary frames. Each file was fully decoded after encoding. No stacked video instances or runtime crossfade are needed. New layers are graded with saturate(.85), masked at both edges, and covered by theme-color scrims (minimum alpha .5). Darker small gold and muted text are scoped to the two wedding ambient sections; shared themes remain unchanged.

Hero has early poster/media priority once content mounts. The wedding celebration player has preload none and attaches its source only when visible; an observer watches one screen beyond the viewport for memory cleanup. Offscreen and hidden players pause; far-away players drop their sources. Real playing is required before video fades in. Policy vetoes, blocked autoplay, decode/network failure or a four-second stall show the equally graded poster with CSS ornaments, without ambient controls or a black box.

Unchanged: both gate clip URLs/bytes/presentation, both ten-second opening films and trusted-tap behavior, music/controller, all EN/SI copy and factual data, links, calendar, contacts, countdown, existing rotating-circle CSS, all portrait files and lightbox. The celebration band is now full width with soft edges and faint CSS mandalas. Closing loses its decorative video so its dense text/contact/actions remain on the original gold surface.

Unused old hero/closing derivatives and rejected alternatives are outside `public`, archived in `media-sources`, which `.vercelignore` excludes from deployment. `npm run prepare:videos` regenerates base media then the selected seamless assets. The three new MP4s total 1,686,338 bytes; their posters total 44,634 bytes. No new asset is required. If floral motion is wanted on Homecoming later, regenerate a **dark maroon loop with small, slow petals, restrained gold lights, and matching first/last framing**; avoid bright ivory center panels.

## Verification

- `npm run build`, `npm run lint` and all eight preservation/media/contrast checks passed.
- Chromium + WebKit at 390×844: 32 route/profile cases passed (normal, Save-Data, low memory, 3g, reduced motion, rejected autoplay, forced stall and hidden/visible tab). No page errors or console warnings/errors. No videos behind prohibited sections, no RSVP, fifth nav Contact, at most two simultaneous playing videos, and far-away sources released.
- Eight final screenshot cases capture both pages in both engines, with video and poster-only mode. Tall sections were scrolled through before capture so all reveal-on-scroll content is visible. Full 390px screenshots for the nine content sections, gate and opening are in `artifacts/qa/ambient-final-{chromium,webkit}`. Compact comparison sheets are committed in [docs/ambient-preview](./docs/ambient-preview): left video enabled, right Save-Data poster mode. All sheets were visually reviewed. Map embeds use an isolated test fixture; original links remain verified.
- Eight opening regression cases passed in Chromium/WebKit, including four natural full-film completions and four trusted-gesture requirements. The opening does not inherit ambient policy vetoes.
- Every frame of every new clip was decoded for a brightness scan. A conservative bound using solid black/white frames, the weakest scrim and 10% ornament/texture influence gives minimum small-text contrast 4.92:1 (Wedding Hero), 4.81:1 (Wedding celebration), and 7.07:1 (Homecoming Hero). See `media-sources/ambient-contrast-verification.json`; this bound also covers the brightest decoded frame.
- Final local cold mobile performance: 150ms latency, 1.6Mbps download, 4× CPU throttle. Wedding LCP 3,008ms / CLS 0; Homecoming LCP 2,288ms / CLS .0003. The earlier run measured 2,408ms / 2,312ms; timings vary, so a universal sub-2.5-second LCP is not claimed. No new ambient or opening file, and no audio, loaded before Open.
- Final pre-interaction video bounds: Wedding 0 bytes when the connection policy chose its poster; Homecoming 1,781,746 bytes charging both observed cover requests the entire WebM file. The earlier Wedding run received 957,478 bytes. All are below the 5MB target. Native streaming can omit unfinished requests from Resource Timing; the report includes a conservative full-file-per-request bound rather than treating missing entries as zero downloads.
- Both live route HTML responses contain the new asset URLs. All three new MP4s and their posters returned 206 for a 0–1023 range, correct MIME/file size and `public, max-age=31536000, immutable`. Runtime deployment commit: `7471b90`.

Results, final live checks and mobile EN/SI checks are recorded in `media-sources/ambient-placement-verification.json`. These are isolated browser-engine/mobile-emulation checks; physical iPhone low-power mode, Samsung Internet and social-app webviews were not tested. Browser/connection restrictions can suppress decorative videos; the requested opening film retains its existing tap-to-play recovery.
