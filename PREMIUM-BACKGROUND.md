# Premium background system

Plan recorded before implementation, 11 October 2026. Both routes use the existing shared experience/components and theme configuration.

## Preserve

All narrative, links, contacts, event facts, language behavior, countdown logic, photo assets and hotel photos inside the bottom of the location cards. Preserve the full requested opening film and gate behavior, music, video files/placements and existing rotating-circle artwork/timings.

Actual video placement is Wedding Hero + Celebrate With Us, Homecoming Hero, plus the existing gate backdrops. Closing currently has no video and Homecoming celebration is CSS-only. Retain that current approved placement even though the new brief describes a closing video as already present.

## Implementation plan

1. One `PageBackground` supplies a page-length theme gradient, a tiny static grain tile, edge vignette, three slow radial-gradient glows and sixteen small CSS gold specks (24 on wider screens). Replace the previous floating petals with this quieter dust field; keep glows/dust behind content and near the edges.
2. One `SectionAtmosphere` supplies masked tone changes, static line-art lotus/corners/vines and the Hero's single 12–15-second light sweep. Use static calm surfaces for paragraphs, portraits, venue/contact; a vine for timeline and a soft radial spotlight for countdown. Reuse existing mandalas instead of duplicating them.
3. Extend theme tokens for ivory/champagne vs velvet/wine, glow colors, grain and motion timing. Wedding keeps its gold closing panel. Homecoming gets a deep burgundy panel with subdued amber edges and readable ivory/gold text.
4. Reuse the current motion environment: offscreen sections and hidden tabs pause; reduced motion, Save-Data, slow connection and low-end devices retain only gradients, grain, watermarks and vignette. Existing circle geometry/durations remain; their policy gate also honors the static fallback.
5. Optional music-reactive glow is implemented behind a shared flag, default false, with no audio analysis and no effect on music playback.
6. Verify every section at 390px in full/static mode, review screenshots, measure contrast, initial load, layout shift, effect counts and frame cadence. Recheck the requested opening video and original actions. Build/lint must pass; publish in small commits.

Only transform and opacity animate. No canvas, full-screen animated blur, parallax, background-attachment fixed, new libraries or additional video. Background assets must remain below 150KB. Actual results and limits will be appended after verification.

## Delivered

`PageBackground` supplies the shared gradient, static grain, vignette, three edge glows and gold dust. `SectionAtmosphere` adds faint corners/lotus/vines, a countdown spotlight and the Hero's single background sweep. Both closing panels now feather into the page; Wedding retains its gold finish and Homecoming uses burgundy with amber edges. Existing arched cards, hairline borders and circle geometry/durations are retained. The previous floating petals were replaced by smaller edge dust.

Small Wedding gold text is darker after measuring contrast. Gallery photo numbers have an opaque dark badge so bright photographs cannot wash them out. Optional `backgroundFeatures.musicReactiveGlow` is implemented as a seven-second music-playing pulse and remains **false**.

The existing opening film, copy, dates, links, phones, music, photos and actual ambient video placements are preserved. Hotel photos remain at the bottom inside each location card.

## Asset and animation budget

| Added texture | Size | Dimensions |
| --- | ---: | --- |
| Wedding paper/linen WebP | 6,186 bytes | 128 × 128 |
| Homecoming velvet WebP | 6,102 bytes | 128 × 128 |
| Total | **12,288 bytes (12.3 KB)** | 8.2% of the 150 KB allowance |

SVG line art and radial gradients need no separate image downloads. No JavaScript dependencies were added. Content-hashed textures receive immutable cache headers.

Phones show 16 dust specks (1–3px, 18–40 seconds); wider screens show 24. Three glows drift over 88/112 seconds, and the Hero sweep rests between passes every 12/15 seconds. This adds 19 persistent background animations, plus one visible Hero sweep. Music glow adds zero by default.

| Section at 390px | New background animations | Total running CSS animations in the browser samples |
| --- | ---: | ---: |
| Hero | 20 | 25 |
| Message | 19 | 21–23 |
| Timeline | 19 | 23 Homecoming / 27 Wedding |
| Countdown | 19 | 21 |
| Portrait | 19 | 22 |
| Gallery | 19 | 21–22 |
| Celebrate With Us | 19 | 23–25 |
| Location | 19 | 21 |
| Closing | 19 | 23 |

Totals include the preserved rings, music control, adjacent visible sections and occasional reveal transitions; these are animation counts, not GPU layer counts. Offscreen circles/sweep and hidden tabs pause. Reduced motion, Save-Data, slow connection and low-end policy disable decorative loops while retaining the static atmosphere. All tested fallback sections had zero background animations running.

## Mobile performance

Cold-cache Chromium at 390 × 844, 150ms latency, 1.6Mbps download and 4× CPU throttling:

| Route | LCP | CLS | Frame median / p95 under 4× CPU |
| --- | ---: | ---: | --- |
| Wedding | 2.636s | 0.0001 | 16.7ms / ≤16.8ms |
| Homecoming | 2.652s | 0.0002 | 16.7ms / ≤16.8ms |

Frame measurements sampled Hero, Timeline, Countdown and Closing for six seconds each. Of 2,822 sampled intervals, one exceeded 34ms. This is about 60fps in the emulated test; physical Android/iOS hardware and social-app webviews are untested. LCP slightly exceeds the 2.5s target, so a strict sub-2.5s guarantee would require further initial-load profiling. Tiny observed layout shifts came from font changes in cover labels, with no background element listed as a shift source. The local whole-page JavaScript resource total was 616,462 bytes before deployment CDN compression; this is the complete application/framework payload, not the size of this upgrade.

No invitation-content ambient video or music requested before tapping Open. The existing cover clip still follows its previous loading policy. No extra video, frame-driven React updates or animated blur was added.

## Verification and screenshots

- Production build, ESLint and all eight content/calendar/theme preservation checks passed.
- 20 browser/route/background-policy cases passed, plus eight checks of the final closing-panel seam. Normal, reduced motion, Save-Data, slow connection and low-end profiles were covered in Chromium and WebKit.
- 24 layout cases passed at 360, 390 and 430px, in English and Sinhala, across both browsers, with no horizontal overflow or JavaScript errors.
- All 12 full opening-film cases passed in Chromium/WebKit: normal, direct-gesture policy and reduced motion on both routes. Existing music, calendar download/focus, sharing mock and replay checks also passed.
- At 390px, all invitation text samples passed 4.5:1 against conservative black/white video bounds, solid ornament fills at their real opacity, peak glow fills and dark/light sweep phases. Lowest measured values: Wedding **4.60:1**, Homecoming **7.14:1**. Fixed controls also retain the tested theme/gold-surface colors. External map labels are outside the invitation's typography.
- Personally reviewed the 80 full-section PNGs via paired review sheets: both themes, both browsers, full effects and reduced motion. Each includes the gate and all nine content sections. Fixed floating controls are hidden in section review images to expose the complete text; long sections are stitched from real 390px phone viewports. Maps use a local fixture during automated checks; real map URLs are preserved.

Each sheet shows full effects on the left and reduced motion on the right. Groups 1–4 cover gate/hero/message, timeline/countdown/portrait, gallery/celebration/location, then closing.

| Browser / theme | Review sheets |
| --- | --- |
| Chromium Wedding | [1](docs/background-preview/chromium-wedding-1.jpg), [2](docs/background-preview/chromium-wedding-2.jpg), [3](docs/background-preview/chromium-wedding-3.jpg), [4](docs/background-preview/chromium-wedding-4.jpg) |
| Chromium Homecoming | [1](docs/background-preview/chromium-homecoming-1.jpg), [2](docs/background-preview/chromium-homecoming-2.jpg), [3](docs/background-preview/chromium-homecoming-3.jpg), [4](docs/background-preview/chromium-homecoming-4.jpg) |
| WebKit Wedding | [1](docs/background-preview/webkit-wedding-1.jpg), [2](docs/background-preview/webkit-wedding-2.jpg), [3](docs/background-preview/webkit-wedding-3.jpg), [4](docs/background-preview/webkit-wedding-4.jpg) |
| WebKit Homecoming | [1](docs/background-preview/webkit-homecoming-1.jpg), [2](docs/background-preview/webkit-homecoming-2.jpg), [3](docs/background-preview/webkit-homecoming-3.jpg), [4](docs/background-preview/webkit-homecoming-4.jpg) |

Sizes, contrast, animation counts and browser/performance evidence are recorded in [premium-background-verification.json](media-sources/premium-background-verification.json). Repeat checks with the existing verification commands and `scripts/verify-background-contrast.mjs` / `scripts/verify-background-frames.mjs`; `QA_SECTIONS` can narrow a screenshot recheck after a local style change. Textures are reproducible with `npm run prepare:backgrounds`.

## Needed from you

Nothing. The shared ornament artwork and generated static tiles cover this brief; no new photographs, video or paid assets are required.
