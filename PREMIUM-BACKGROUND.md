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
