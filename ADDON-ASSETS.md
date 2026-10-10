# Add-on asset inventory

Sizes are exact bytes. Originals and unused alternatives live in media-sources/ and are excluded from deployment. Content hashes identify every new video, poster, portrait and brand asset.

## Every source video and compatible derivative

Before: all sixteen originals are MP4 / H.264 High 4.0 / yuv420p / 1080x1920 / 24fps / 10s / AAC, without faststart. After: every MP4 is H.264 Main 3.1 / yuv420p / fixed 24fps / 2s keyframes / 10s / silent / faststart. Opening alternatives are 406x720; background alternatives 540x960. Optional WebM is VP9 profile 0, yuv420p, fixed 24fps and silent; three larger WebM encodes were discarded. Every retained file was decoded through ffmpeg; 240-frame timestamps and keyframes were checked. WebM timestamps are rounded to its 1ms timebase.

| Source | Original bytes | MP4 bytes | WebM bytes | Poster WebP bytes | Use |
|---|---:|---:|---:|---:|---|
| media-sources/wedding/videos/wedding-closing-loop.mp4 | 4159458 | 627534 | 465264 | 12588 | Published: closing |
| media-sources/wedding/videos/wedding-floral-frame-loop.mp4 | 4680198 | 591676 | 478739 | 37710 | Published: cover |
| media-sources/wedding/videos/wedding-floral-loop.mp4 | 3342762 | 456923 | 301604 | 15542 | Archived: archived alternative; not deployed |
| media-sources/wedding/videos/wedding-hero-loop.mp4 | 4066580 | 596195 | 417424 | 16072 | Published: hero |
| media-sources/wedding/videos/wedding-opening-couple 2.mp4 | 5858911 | 698829 | 617587 | 25604 | Archived: archived alternative; not deployed |
| media-sources/wedding/videos/wedding-opening-couple.mp4 | 7195820 | 692153 | 627956 | 36332 | Published: opening |
| media-sources/wedding/videos/wedding-petals-loop.mp4 | 3923001 | 631251 | 528058 | 13188 | Archived: archived alternative; not deployed |
| media-sources/wedding/videos/wedding-soft-light-loop.mp4 | 3877572 | 530453 | 346684 | 13658 | Archived: archived alternative; not deployed |
| media-sources/homecoming/videos/homecoming-closing-loop.mp4 | 4585683 | 694729 | 492150 | 10146 | Published: closing |
| media-sources/homecoming/videos/homecoming-countdown-butterfly-loop.mp4 | 10459661 | 1161904 | discarded (larger) | 53702 | Archived: archived alternative; not deployed |
| media-sources/homecoming/videos/homecoming-floral-frame-loop.mp4 | 5948033 | 833624 | discarded (larger) | 44280 | Archived: archived alternative; not deployed |
| media-sources/homecoming/videos/homecoming-glow-loop.mp4 | 5617437 | 823903 | discarded (larger) | 50926 | Archived: archived alternative; not deployed |
| media-sources/homecoming/videos/homecoming-hero-loop.mp4 | 6050943 | 973458 | 890873 | 16000 | Published: cover + hero |
| media-sources/homecoming/videos/homecoming-opening-couple 2.mp4 | 6401023 | 711474 | 571132 | 18310 | Archived: archived alternative; not deployed |
| media-sources/homecoming/videos/homecoming-opening-couple.mp4 | 5349863 | 576688 | 490167 | 28106 | Published: opening |
| media-sources/homecoming/videos/homecoming-petals-loop.mp4 | 6671584 | 1092425 | 994401 | 18968 | Archived: archived alternative; not deployed |

Every poster matches its video dimensions/aspect ratio exactly, is taken at 1s and includes an embedded 8px WebP blur placeholder. Original size total: 88188529 bytes. Published MP4 total: 4752433 bytes. Before tap only the cover can load; even a duplicated cover request plus MP4 recovery stays below 3MB, below the 5MB target.

## Every photographic portrait

Grade: brightness +2.5%, saturation -1%, contrast slope .98, slight red/blue warmth, with a very faint CSS vignette. No full-resolution blur or upscaling. Faces use object-position 50% 30%. Source files with only 788px width stay at 788px in the 1080 ceiling variant; the 1071px source stays 1071px. The first wedding .jpeg is actually PNG by signature, which sharp handles correctly.

| Source / actual format | Original bytes | 640 WebP | 640 AVIF | 1080 ceiling WebP | 1080 ceiling AVIF | Use / selection reason |
|---|---:|---:|---:|---:|---:|---|
| media-sources/wedding/photos/wedding-couple-feature.jpeg (png, 1071x1469) | 2285731 | 74050 | 44293 | 150560 | 93036 | wedding gallery / best natural detail, seated outdoor pose |
| media-sources/wedding/photos/wedding-couple-feature 2.jpeg (jpeg, 788x1080) | 62662 | 32798 | 23433 | 46650 | 36292 | wedding gallery / complementary studio pose with safe face framing |
| media-sources/homecoming/photos/homecoming-couple-feature.jpeg (jpeg, 788x1080) | 52318 | 25480 | 18021 | 34704 | 26072 | homecoming gallery / formal maroon portrait matching the theme |

next/image preserves fixed tile aspect ratios and accurate sizes. picture selects AVIF with WebP fallback. Gallery uses only the 640 source. Larger images mount only inside the dynamically imported lightbox, which prefetches adjacent images after opening. Blur placeholders are embedded in the manifest.

## Illustrations retained as hero artwork

| Original PNG | Original bytes | WebP bytes / dimensions | Use |
|---|---:|---|---|
| /assets/wedding/photos/wedding-couple-feature.png | 1917118 | 87364 / 900x900 | wedding hero illustration; not counted as a photographic portrait |
| /assets/homecoming/photos/homecoming-couple-feature.png | 1838747 | 42484 / 656x900 | homecoming hero illustration; not counted as a photographic portrait |

## Every archived image

These remain available in the repository, but are no longer in /public or server deployment traces. Existing backgrounds/decor were superseded by the selected video posters and SVG ornament system; prior portrait derivatives were superseded by graded variants.

| Former public path | Bytes | Actual format / dimensions | Current use |
|---|---:|---|---|
| public/assets/homecoming/backgrounds/homecoming-hero-bg.jpeg | 565454 | jpeg / 768x1376 | archived source or superseded derivative |
| public/assets/homecoming/backgrounds/homecoming-section-bg.jpeg | 573079 | jpeg / 768x1376 | archived source or superseded derivative |
| public/assets/homecoming/optimized/couple-feature.webp | 30880 | webp / 788x1080 | archived source or superseded derivative |
| public/assets/homecoming/optimized/hero-background.webp | 32682 | webp / 768x1376 | archived source or superseded derivative |
| public/assets/homecoming/optimized/section-background.webp | 14596 | webp / 768x1376 | archived source or superseded derivative |
| public/assets/homecoming/photos/homecoming-couple-feature.jpeg | 52318 | jpeg / 788x1080 | archived source or superseded derivative |
| public/assets/homecoming/photos/homecoming-couple-feature.png | 1838747 | png / 1071x1469 | archived source or superseded derivative |
| public/assets/shared/placeholders/share-fallback.svg | 1447 | svg / 1200x630 | archived source or superseded derivative |
| public/assets/wedding/backgrounds/wedding-hero-bg.jpeg | 772483 | jpeg / 768x1376 | archived source or superseded derivative |
| public/assets/wedding/backgrounds/wedding-section-bg.jpeg | 688521 | jpeg / 768x1376 | archived source or superseded derivative |
| public/assets/wedding/decor/wedding-gate-lotus.webp | 85376 | webp / 560x840 | archived source or superseded derivative |
| public/assets/wedding/decor/wedding-gate-mandala.webp | 206714 | webp / 900x900 | archived source or superseded derivative |
| public/assets/wedding/decor/wedding-gate-procession.webp | 208442 | webp / 1500x500 | archived source or superseded derivative |
| public/assets/wedding/optimized/couple-feature-02.webp | 41732 | webp / 788x1080 | archived source or superseded derivative |
| public/assets/wedding/optimized/couple-feature.webp | 136494 | webp / 1071x1469 | archived source or superseded derivative |
| public/assets/wedding/optimized/hero-background.webp | 84298 | webp / 768x1376 | archived source or superseded derivative |
| public/assets/wedding/optimized/section-background.webp | 35946 | webp / 768x1376 | archived source or superseded derivative |
| public/assets/wedding/photos/wedding-couple-feature 2.jpeg | 62662 | jpeg / 788x1080 | archived source or superseded derivative |
| public/assets/wedding/photos/wedding-couple-feature.jpeg | 2285731 | png / 1071x1469 | archived source or superseded derivative |
| public/assets/wedding/photos/wedding-couple-feature.png | 1917118 | png / 1254x1254 | archived source or superseded derivative |

## Every generated social/icon image and manifest

Vector source generated from a shared lotus path and restrained 24-petal mandala. Text colours use the page theme tokens already checked at >=4.5:1. The background mandala is faint; large text sits inside the central crop.

| Route | File | Bytes | Format / size | Use |
|---|---|---:|---|---|
| wedding | /assets/wedding/share/preview-1200x630.5cbd87a6a101.jpg | 31495 | JPEG / 1200x630 | wide |
| wedding | /assets/wedding/share/preview-600x600.b42ad5090139.jpg | 20935 | JPEG / 600x600 | square |
| wedding | /assets/wedding/share/lotus.581bf49eaf56.svg | 424 | SVG / 180x180 | icon |
| wedding | /assets/wedding/share/lotus.905bf675846d.ico | 956 | ICO (PNG payload) / 32x32 | ico |
| wedding | /assets/wedding/share/apple-touch.1252adf238b5.png | 7102 | PNG / 180x180 | apple |
| wedding | /assets/wedding/share/lotus-192.69cac180c465.png | 7704 | PNG / 192x192 | pwa |
| wedding | /assets/wedding/share/lotus-512.5b5d108eca0a.png | 26583 | PNG / 512x512 | pwa512 |
| wedding | /assets/wedding/share/invitation.dbee206c3ceb.webmanifest | 399 | JSON / theme and route scope | manifest |
| homecoming | /assets/homecoming/share/preview-1200x630.bd0b52bcd022.jpg | 36051 | JPEG / 1200x630 | wide |
| homecoming | /assets/homecoming/share/preview-600x600.55adee7df86b.jpg | 24428 | JPEG / 600x600 | square |
| homecoming | /assets/homecoming/share/lotus.acb72c87b883.svg | 424 | SVG / 180x180 | icon |
| homecoming | /assets/homecoming/share/lotus.c08e5a3ca099.ico | 978 | ICO (PNG payload) / 32x32 | ico |
| homecoming | /assets/homecoming/share/apple-touch.e624abe55e90.png | 7067 | PNG / 180x180 | apple |
| homecoming | /assets/homecoming/share/lotus-192.b3e3553cd2b0.png | 7676 | PNG / 192x192 | pwa |
| homecoming | /assets/homecoming/share/lotus-512.bdc36fe92914.png | 26515 | PNG / 512x512 | pwa512 |
| homecoming | /assets/homecoming/share/invitation.d9cbcad6517f.webmanifest | 425 | JSON / theme and route scope | manifest |

## Assets still needed

Only three distinct photographs were supplied. To select 6-8 overall, provide another 3-5 distinct full-resolution portraits/candids. To fill each themed gallery with 6-8 without mixing outfits, provide 4-6 more wedding and 5-7 more homecoming photographs. The two PNG illustrations remain hero artwork. No photos have been invented or duplicated to inflate the count. Physical iPhone/Android and in-app browser access is also needed for the remaining real-device matrix.
