# Media asset guide

Current asset sizes, formats, selections and missing photographs are listed in [ADDON-ASSETS.md](./ADDON-ASSETS.md). The initial video diagnosis is in [ADDON-DIAGNOSIS.md](./ADDON-DIAGNOSIS.md).

Original videos and photographs live in `media-sources/{event}/`. They remain in Git, and `.vercelignore` excludes them from deployment. Unused compatible video alternatives, backgrounds, decorative images and old photo derivatives are also archived there.

Published videos, posters and graded portraits use content-hashed files in `public/assets/{event}/media/`. Share images, lotus icons and manifests use `public/assets/{event}/share/`. Next.js serves these paths with a one-year immutable cache. The two existing hero illustrations remain in `optimized/`; music remains at its original MP3 URL and is requested only after a gesture.

Regenerate with:

```bash
npm run prepare:videos
npm run prepare:portraits
npm run prepare:brand
```

Video preparation uses the portable executables in `.task-tools/ffmpeg/bin/`. Set up those tools before regenerating; no system installation is needed. `prepare-universal-media.mjs` handles all original clips, opening and background alike. Earlier preparation scripts are historical and should not be used for current assets.

Runtime manifests are `src/data/background-videos.json`, `video-assets.json`, `photo-assets.json` and `brand-assets.json`. Keep only files referenced by these manifests in the generated public directories when regenerating changed sources; archive obsolete hashes outside public.

The supplied portraits remain in the original theme galleries. Replace their source files in `media-sources/{event}/photos/`, then run `prepare:portraits` for AVIF/WebP pairs. To add more distinct photographs, extend the gallery entries in `photo-assets.json` with their source path before running preparation. An extra file placed directly in `public/assets/{event}/gallery/` is discovered automatically, but production photos should go through the grading/variant pipeline first.

Ornaments are native SVG components in `src/components/InvitationOrnaments.jsx`. No new photographic or decorative bitmap assets are required for the reveal or loader.
