# Immersive background V2

Plan recorded before implementation, 11 October 2026.

## Reference and clip study

Opened https://invitation.lk/samples/ariya-sinhala in a 390px browser, opened its gate and inspected the page while scrolling. Its fixed illustrated backdrop uses a 35% ivory wash. Floating gold particles, substantial floral/mandala edge art, fine dividers and translucent bordered cards give depth; reading areas remain calm. Its live sample uses a static backdrop after the opening, rather than a persistent background video. Use this visual rhythm with the supplied V2 video requirement, preserving the current invitation content.

Probed every background video in the repository with ffprobe and captured its start, middle and end with ffmpeg, including original clips and MP4/WebM derivatives. Original background sources are:

- Wedding: soft-light, petals, hero, floral, floral-frame and closing loops.
- Homecoming: hero, closing, petals, glow, floral-frame and countdown-butterfly loops.

Choose `wedding-soft-light-loop.mp4`: luminous ivory/champagne satin, gentle light and a calm reading centre. Choose `homecoming-hero-loop.mp4`: deep burgundy satin with warm gold bokeh, stronger evening character than the pale-centred floral alternatives. Both have suitable material; no new video is required. Keep original opening films and gate clips unchanged.

## Final shared stack

1. Page-length theme gradient.
2. One fixed, muted, inline H.264 video/poster per invitation; new seamless 540px/24fps derivatives with faststart, no audio, under 2MB each. Slight desaturation and gold grading. Remove the individual content-section video instances so only one ambient video plays.
3. Feathered section washes: roughly 45–50% for Hero/Celebration/Closing, 85% for Message/Timeline/Location/Contact and 65% for Countdown/Portrait/Gallery. Protect the actual text area further if the brightest/darkest sampled frame requires it for 4.5:1 contrast.
4. Two large, edge-bleeding mandalas at 10–16%, using the existing artwork and 112/136-second counter rotation, with a small scroll-driven offset.
5. Reused floral/lotus/vine SVGs at 8–12%, displaced gently by one passive, requestAnimationFrame scroll coordinator. Cache geometry outside the frame callback; update transforms only.
6. A restrained gold dust field and three slow radial-gradient glows, plus vignette and one Hero sweep.
7. Frosted arched cards with solid fallbacks, hairline dividers, one entering heading glint, staggered Hero entrance and once-only card rises/scales. Simulate drawing dividers with transform/opacity to avoid per-frame stroke repainting.

Maintain sibling layouts and shared components; theme tokens, blend/wash colors and the selected clip distinguish daytime ivory/gold from evening burgundy/gold. Wedding keeps a gold closing; Homecoming keeps its burgundy-to-gold glow and existing actions.

## Reliability and proof

Extend `BackgroundVideo` with a dedicated page priority so the opening/gate behavior remains intact. Use metadata preload, poster-first paint and playing-event fade; pause when hidden, bound stall/start waits to six seconds and retry blocked playback once on the first touch. Pause offscreen section motion with IntersectionObserver. Reduced motion remains static; Save-Data/slow connections use the poster with the light CSS atmosphere. Keep additional non-video assets under 200KB and add no libraries.

Capture every section at 390px before and after, personally compare the visual difference, inspect the selected loop's brightest frames, and measure contrast/effect counts/frame cadence. Recheck factual content, RSVP absence, native opening playback, mobile layouts and existing actions. Build, commit/push `main`, then verify GitHub's successful Production deployment and public files/rendered UI.

## Delivered media and rendering

| Page | Selected source | Silent mobile MP4 | WebP poster | Reason |
| --- | --- | ---: | ---: | --- |
| Wedding | `media-sources/wedding/videos/wedding-soft-light-loop.mp4` | 554,172 bytes | 11,326 bytes | The warmest light satin, ivory/champagne folds, quiet central space |
| Homecoming | `media-sources/homecoming/videos/homecoming-hero-loop.mp4` | 1,027,187 bytes | 24,430 bytes | Burgundy satin, warm candle-like gold bokeh, evening depth |

Both derivatives: 540 × 960, 24fps, H.264 Main/level 3.1, yuv420p, faststart, no audio, 9.083333 seconds. A one-second tail/head dissolve creates the seamless loop. FFmpeg fully decodes each output; first/last-frame mean absolute differences are 2.41 and 4.14 on the 0–255 scale. All 218 frames per output were analysed to select actual whole-frame brightest and darkest images. New non-video assets total **35,756 bytes**, below 200KB. Existing paper/velvet textures and inline ornaments are reused. No new dependencies or replacement assets are needed.

The page gradient is followed by one fixed video/poster, feathered section washes and a central reading shield, grain, two large edge mandalas, local floral tracks, dust and two bokeh glows, vignette/hero sweep, then the content. The central shield protects copy without obscuring the video at the edges. Wedding uses normal video blending; Homecoming uses screen. Closing uses a 55% gold gradient for Wedding and a burgundy/gold glow for Homecoming. Contact panels have an 88% reading surface.

| Section on either page | Wash | Continuous background CSS animations | Extra scroll transforms |
| --- | ---: | ---: | ---: |
| Hero | 45% | 21 | 4 |
| Message | 85% | 19 | 4 |
| Timeline | 85% | 19 | 4 |
| Countdown | 65% | 19 | 4 |
| Portrait | 65% | 19 | 4 |
| Gallery | 65% | 19 | 4 |
| Celebrate | 45% | 19 | 4 |
| Closing | about 50–55% | 19 | 4 |
| Contact inside closing | 88% panel | shares Closing | shares Closing |

The 19 continuous CSS layers are 15 specks, two mandala rotations and two bokeh glows. Hero adds one video zoom and one sweep. There is also one native video; the four scroll transforms are two mandala outer frames and two floral tracks. Heading glints, divider reveals and card entrances run once. Existing small rings/music controls retain their existing behavior. Reduced motion and constrained-device mode have **zero running background animations**; Save-Data/slow connections retain the CSS atmosphere over the poster. Offscreen hero effects and section glints pause.

Performance profiling led to direct element transform writes instead of inherited CSS variable writes, removal of the third bokeh layer, a fixed viewport grain and reduction of card blur from 4px to 2px. Frosted cards retain both backdrop-filter prefixes and solid fallbacks. Frame callbacks perform no geometry reads; setup/resize cache the section positions. Hidden tabs pause playback and decoration. Start/stall timeouts are six seconds; blocked playback receives one gesture retry.

## Validation and review artifacts

- `next build` and ESLint pass; eight preservation checks pass.
- Twenty background policy scenarios pass: two routes × Chromium/WebKit × normal/reduced-motion/Save-Data/slow/constrained-device profiles.
- Twenty ambient playback cases pass, including autoplay blocked once/always, a real media network failure, six-second stalls, one gesture retry and hidden-tab pause/resume. WebKit uses a real missing media URL because its native video requests can bypass Playwright routing.
- Twenty-four opening-film cases pass in Chromium/WebKit. Gate, opening-film modules, opening assets, music/countdown logic, event facts and translation/copy files have no changes.
- Forty responsive scenarios pass: English/Sinhala, both browsers, both pages, 320/360/390/430/1280px. Existing calendar/map/phone/share/music actions pass. No horizontal overflow or browser errors in layout checks. RSVP remains absent from `src`; its former API returns 404.
- Every section has a 390px before/after capture in normal and reduced-motion modes. Eighteen side-by-side normal-mode comparisons were visually reviewed. Venue photographs remain below the directions/map inside each Location frame.
- Contrast uses the actual brightest/darkest output frames, with conservative full-area bounds for rotating ornaments and drifting bokeh. Text glyphs are hidden while their background pixels are sampled; actual foreground colors are retained for ratio calculation. The first countdown feather was corrected to protect its heading without a hard transition.

Local review artifacts (ignored by Git and deployment):

- `artifacts/qa/immersive-v2-study/inventory.json`: all 42 probed original/derivative videos and their three-frame sheets.
- `artifacts/qa/immersive-v2-reference/`: reference gate/scroll captures and computed layer structure.
- `artifacts/qa/immersive-v2-before/`: original production sections at 390px.
- `artifacts/qa/immersive-v2-after/`: final sections at 390px and browser policy results.
- `artifacts/qa/immersive-v2-comparisons/`: `<wedding|homecoming>-<section>.png`, covering all nine sections per page.
- `artifacts/qa/immersive-v2-frames/`: actual brightest/darkest PNGs of both loops.
- `artifacts/qa/immersive-v2-contrast/`: measured text contrast and background sampling images.
- `artifacts/qa/immersive-v2-playback/results.json`, `immersive-v2-opening/results.json` and `mobile/results.json`: playback, opening and responsive results.
- `artifacts/qa/immersive-v2-performance/`: frame cadence/CLS and profiling variants. These are desktop browser measurements, not a physical Android certification.
- `artifacts/qa/immersive-v2-production/`: successful deployment metadata, SHA-verified public assets and fresh live-browser checks, generated after push.

Final conservative contrast ratios against the actual brightest/darkest frames:

| Section | Wedding minimum | Homecoming minimum |
| --- | ---: | ---: |
| Hero | 4.73 | 5.12 |
| Message | 9.36 | 10.12 |
| Timeline | 5.36 | 6.18 |
| Countdown | 4.87 | 5.86 |
| Portrait | 4.98 | 5.86 |
| Gallery | 5.03 | 5.95 |
| Celebrate | 4.52 | 4.99 |
| Location | 5.36 | 6.18 |
| Closing including Contact/actions | 4.57 | 5.35 |

Reproduce with the locally installed Playwright module configured in `INVITATION_PLAYWRIGHT_MODULE`, a running production build on port 3102, `npm run verify:backgrounds`, `npm run verify:immersive:playback` and `npm run verify:immersive:contrast`. Run `npm run prepare:immersive` to regenerate the media and analysis frames; `npm run prepare:videos` also includes that step.

Publication target: GitHub `xnirupama/janith-pradeepa-wedding`, branch `main`, Vercel project `nirupamaminipa-4356s-projects/janith-pradeepa`, production URLs https://janith-pradeepa.vercel.app/wedding and https://janith-pradeepa.vercel.app/homecoming. Publication is verified through the Vercel GitHub check, a successful deployment whose environment is `Production` and whose SHA matches the pushed commit, and fresh live pages/files. The private Vercel REST `readyState` enum is not available without account credentials; public completion/serving evidence is recorded instead of inventing an API result.

## Exact changed files

- `IMMERSIVE-BACKGROUND-V2.md`
- `package.json`
- `scripts/prepare-universal-media.mjs`
- `scripts/prepare-immersive-videos.mjs`
- `scripts/verify-backgrounds.mjs`
- `scripts/verify-invitations.mjs`
- `scripts/verify-immersive-contrast.mjs`
- `scripts/verify-immersive-playback.mjs`
- `src/app/backgrounds.css`
- `src/components/BackgroundVideo.jsx`
- `src/components/ClosingSection.jsx`
- `src/components/EventExperience.jsx`
- `src/components/EventSchedule.jsx`
- `src/components/HeroSection.jsx`
- `src/components/InvitationMotion.jsx`
- `src/components/PageBackground.jsx`
- `src/components/SectionAtmosphere.jsx`
- `src/components/useBackgroundChoreography.js`
- `src/data/background-videos.json`
- `src/data/themes.js`
- `src/lib/motion-environment.js`
- `public/assets/wedding/media/wedding-soft-light-loop-immersive.6b8b0705c89b.mp4`
- `public/assets/wedding/media/wedding-soft-light-loop-immersive-poster.aa3bf8e0e83c.webp`
- `public/assets/homecoming/media/homecoming-hero-loop-immersive.23462fde330c.mp4`
- `public/assets/homecoming/media/homecoming-hero-loop-immersive-poster.8d0944fa7510.webp`
