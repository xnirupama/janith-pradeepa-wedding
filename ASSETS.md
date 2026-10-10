# Media asset guide

Couple photos, artwork, music and social preview paths remain in `public/assets/wedding/` and `public/assets/homecoming/`. Existing images are served through their optimized WebP derivatives and Next Image.

- Add distinct JPG, JPEG, PNG, WebP or AVIF photos to `public/assets/{event}/gallery/`; they are naturally sorted and discovered automatically.
- Keep the supplied couple portraits in `public/assets/{event}/photos/`. Run `node scripts/prepare-invitation-assets.mjs` after replacing a source photo or artwork.
- Existing music stays at `public/assets/{event}/music/{event}-theme.mp3`.
- Keep the existing OpenGraph generators and social assets for WhatsApp previews.

## Video sources and published derivatives

The 16 supplied original videos are archived in `media-sources/{event}/videos/`. They remain in Git and are excluded from Vercel uploads by `.vercelignore`. Do not put full original clips back into `public`.

The measured inventory is in `media-sources/video-inventory.json`. See [INVITATION-UPGRADE.md](./INVITATION-UPGRADE.md) for every clip, the frames inspected, assignment and exact before/after sizes.

Only these silent mobile files are published:

| Event | Purpose | Published files |
| --- | --- | --- |
| Wedding | Cover, hero and footer | `public/assets/wedding/optimized/{cover,hero,closing}-mobile.{mp4,webm}` |
| Homecoming | Shared cover and hero | `public/assets/homecoming/optimized/silk-mobile.{mp4,webm}` |
| Homecoming | Footer | `public/assets/homecoming/optimized/closing-mobile.{mp4,webm}` |
| Both | Opening and replay | `public/assets/{event}/optimized/opening-mobile.mp4` |
| Both | Background posters | `public/assets/{event}/optimized/{cover,hero,silk,closing}-poster.webp` as applicable |
| Both | Opening poster | `public/assets/{event}/optimized/opening-poster.webp` |

Regenerate backgrounds with `npm run prepare:videos`, and opening films with `node scripts/prepare-opening-films.mjs`. Both accept `FFMPEG_PATH` and `FFPROBE_PATH`; their portable Windows defaults live in ignored `.task-tools/ffmpeg/bin/`. No system installation is required.

Background choices are centralized in `src/data/background-videos.json`; opening film metadata lives in `src/data/video-assets.json`. Background posters persist for reduced motion, Save-Data, slow connections or denied autoplay. Stalled VP9 playback retries H.264 over the same poster.

Lotus, mandala, dotted-ring and sunburst ornaments are SVG components in `src/components/InvitationOrnaments.jsx`, so no additional ornament images are required.
