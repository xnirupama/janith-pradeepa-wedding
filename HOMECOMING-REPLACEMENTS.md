# Reviewed Homecoming replacements

The supplied filenames identify three replacements: `optimized/couple-artwork.jpg` for the hero, `media/portrait-1-1080.6804e8a9ebfb.jpeg` for the gallery, and the overwritten `media/homecoming-opening-couple.fb07dd087000.mp4` for the opening film. Both photos were visually reviewed. The original film was inspected with ffprobe and frames at 0, 5 and 9.95 seconds were reviewed.

| Placement | Preserved original | Deployed mobile asset |
|---|---|---|
| Homecoming hero | `media-sources/homecoming/photos/homecoming-hero-couple.jpg` (260,983 bytes) | `public/assets/homecoming/media/homecoming-hero-couple.3a5d517a5c6e.webp` (70,754 bytes, 656×900) |
| Homecoming gallery | `media-sources/homecoming/photos/homecoming-gallery-couple.jpeg` (61,025 bytes) | 640px WebP (31,574 bytes) and AVIF, with larger WebP/AVIF deferred until the photo viewer opens |
| Homecoming opening | `media-sources/homecoming/videos/homecoming-opening-couple-replacement.mp4` (6,285,526 bytes) | `public/assets/homecoming/media/homecoming-opening-couple-replacement.3323745045bd.mp4` (574,491 bytes), plus a matching WebP poster (19,946 bytes) |

The real hero portrait uses the page's existing arch with a fine gold border and its original proportions. The gallery remains one supplied portrait with the existing accessible viewer. Fresh content hashes prevent earlier cached versions from being served. Deleted old derivative references were replaced. Previous source photos/films remain archived; previous opening derivatives were moved outside public.

The new film retains its full ten seconds and is H.264 Main 3.1, yuv420p, 406×720, fixed 24fps, faststart, with audio removed so the existing invitation music remains the soundtrack. The MP4 was fully decoded after encoding. The direct Open-tap playback, retry button and end-triggered curtain reveal are retained.

Wedding asset references are unchanged. Both hotels retain their two photos at the bottom inside their location cards. All copy, dates, calendar actions, contacts, maps, themes and music configuration are retained.

Reproduce these assets with `node scripts/prepare-homecoming-replacements.mjs`. The script uses the archived supplied originals on subsequent runs. `npm run prepare:portraits` reads the new gallery original, and `npm run prepare:videos` selects the new opening source. Exact variants and metadata are in `media-sources/homecoming-replacement-inventory.json`.

Validation: production build and lint passed; all eight preservation checks passed; every referenced photo/video exists and all hashed filenames match their content. Twelve Chromium/WebKit opening cases passed, including natural full-film playback, trusted gesture requirements and reduced motion. Sixteen 320/390px EN/SI route/engine layout cases passed. Both engines loaded the new hero, gallery and large viewer without asset errors; the viewer's existing zoom/pan/focus/close tests passed. Full-size screenshots were reviewed under `artifacts/qa/homecoming-replacements` and `artifacts/qa/gallery`.
