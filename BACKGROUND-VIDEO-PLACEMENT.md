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
