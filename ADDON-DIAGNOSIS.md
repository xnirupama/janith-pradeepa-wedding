# Add-on diagnosis before implementation

Audit date: 2026-10-10. This report records the clean f797d5e baseline before changing implementation.

## Every video (ffprobe)

MP4 container below is ffprobe mov,mp4,m4a,3gp,3g2,mj2; WebM is matroska,webm. Both average and nominal frame rate are 24/1 throughout. Bitrate is total container bitrate. Level 40 means H.264 4.0.

| File | Bytes | Container | Codec/profile/level | Pixel format | Size | FPS | Bit/s | Seconds | Audio | Faststart |
|---|---:|---|---|---|---|---|---:|---:|---|---|
| media-sources/homecoming/videos/homecoming-closing-loop.mp4 | 4585683 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 3668546 | 10 | aac | false |
| media-sources/homecoming/videos/homecoming-countdown-butterfly-loop.mp4 | 10459661 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 8367728 | 10 | aac | false |
| media-sources/homecoming/videos/homecoming-floral-frame-loop.mp4 | 5948033 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 4758426 | 10 | aac | false |
| media-sources/homecoming/videos/homecoming-glow-loop.mp4 | 5617437 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 4493949 | 10 | aac | false |
| media-sources/homecoming/videos/homecoming-hero-loop.mp4 | 6050943 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 4840754 | 10 | aac | false |
| media-sources/homecoming/videos/homecoming-opening-couple 2.mp4 | 6401023 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 5120818 | 10 | aac | false |
| media-sources/homecoming/videos/homecoming-opening-couple.mp4 | 5349863 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 4279890 | 10 | aac | false |
| media-sources/homecoming/videos/homecoming-petals-loop.mp4 | 6671584 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 5337267 | 10 | aac | false |
| media-sources/wedding/videos/wedding-closing-loop.mp4 | 4159458 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 3327566 | 10 | aac | false |
| media-sources/wedding/videos/wedding-floral-frame-loop.mp4 | 4680198 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 3744158 | 10 | aac | false |
| media-sources/wedding/videos/wedding-floral-loop.mp4 | 3342762 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 2674209 | 10 | aac | false |
| media-sources/wedding/videos/wedding-hero-loop.mp4 | 4066580 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 3253264 | 10 | aac | false |
| media-sources/wedding/videos/wedding-opening-couple 2.mp4 | 5858911 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 4687128 | 10 | aac | false |
| media-sources/wedding/videos/wedding-opening-couple.mp4 | 7195820 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 5756656 | 10 | aac | false |
| media-sources/wedding/videos/wedding-petals-loop.mp4 | 3923001 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 3138400 | 10 | aac | false |
| media-sources/wedding/videos/wedding-soft-light-loop.mp4 | 3877572 | MP4 | h264/High/40 | yuv420p | 1080x1920 | 24/1 | 3102057 | 10 | aac | false |
| public/assets/homecoming/optimized/closing-mobile.mp4 | 676357 | MP4 | h264/High/31 | yuv420p | 540x960 | 24/1 | 541085 | 10 | none | true |
| public/assets/homecoming/optimized/closing-mobile.webm | 467861 | WebM | vp9/Profile 0/-99 | yuv420p | 540x960 | 24/1 | 374288 | 10 | none | n/a |
| public/assets/homecoming/optimized/opening-mobile.mp4 | 483336 | MP4 | h264/High/30 | yuv420p | 406x720 | 24/1 | 386668 | 10 | none | true |
| public/assets/homecoming/optimized/silk-mobile.mp4 | 944991 | MP4 | h264/High/31 | yuv420p | 540x960 | 24/1 | 755992 | 10 | none | true |
| public/assets/homecoming/optimized/silk-mobile.webm | 859578 | WebM | vp9/Profile 0/-99 | yuv420p | 540x960 | 24/1 | 687662 | 10 | none | n/a |
| public/assets/wedding/optimized/closing-mobile.mp4 | 601223 | MP4 | h264/High/31 | yuv420p | 540x960 | 24/1 | 480978 | 10 | none | true |
| public/assets/wedding/optimized/closing-mobile.webm | 438400 | WebM | vp9/Profile 0/-99 | yuv420p | 540x960 | 24/1 | 350720 | 10 | none | n/a |
| public/assets/wedding/optimized/cover-mobile.mp4 | 503917 | MP4 | h264/High/31 | yuv420p | 540x960 | 24/1 | 403133 | 10 | none | true |
| public/assets/wedding/optimized/cover-mobile.webm | 384302 | WebM | vp9/Profile 0/-99 | yuv420p | 540x960 | 24/1 | 307441 | 10 | none | n/a |
| public/assets/wedding/optimized/hero-mobile.mp4 | 573714 | MP4 | h264/High/31 | yuv420p | 540x960 | 24/1 | 458971 | 10 | none | true |
| public/assets/wedding/optimized/hero-mobile.webm | 389442 | WebM | vp9/Profile 0/-99 | yuv420p | 540x960 | 24/1 | 311553 | 10 | none | n/a |
| public/assets/wedding/optimized/opening-mobile.mp4 | 604851 | MP4 | h264/High/30 | yuv420p | 406x720 | 24/1 | 483880 | 10 | none | true |

## Serving checks

All 12 deployed videos are local /public assets referenced through same-origin /assets URLs. No GitHub raw or LFS URLs are used. GET Range bytes=0-1023 returned 206, Accept-Ranges: bytes, correct Content-Range and video/mp4 or video/webm for every file both on localhost:3101 and https://janith-pradeepa.vercel.app. Local cache: public, max-age=0. Production cache: public, max-age=0, must-revalidate. No immutable caching yet.

| URL | Status | Type | Range | Cache |
|---|---:|---|---|---|
| http://127.0.0.1:3101/assets/homecoming/optimized/closing-mobile.mp4 | 206 | video/mp4 | bytes 0-1023/676357 | public, max-age=0 |
| http://127.0.0.1:3101/assets/homecoming/optimized/closing-mobile.webm | 206 | video/webm | bytes 0-1023/467861 | public, max-age=0 |
| http://127.0.0.1:3101/assets/homecoming/optimized/opening-mobile.mp4 | 206 | video/mp4 | bytes 0-1023/483336 | public, max-age=0 |
| http://127.0.0.1:3101/assets/homecoming/optimized/silk-mobile.mp4 | 206 | video/mp4 | bytes 0-1023/944991 | public, max-age=0 |
| http://127.0.0.1:3101/assets/homecoming/optimized/silk-mobile.webm | 206 | video/webm | bytes 0-1023/859578 | public, max-age=0 |
| http://127.0.0.1:3101/assets/wedding/optimized/closing-mobile.mp4 | 206 | video/mp4 | bytes 0-1023/601223 | public, max-age=0 |
| http://127.0.0.1:3101/assets/wedding/optimized/closing-mobile.webm | 206 | video/webm | bytes 0-1023/438400 | public, max-age=0 |
| http://127.0.0.1:3101/assets/wedding/optimized/cover-mobile.mp4 | 206 | video/mp4 | bytes 0-1023/503917 | public, max-age=0 |
| http://127.0.0.1:3101/assets/wedding/optimized/cover-mobile.webm | 206 | video/webm | bytes 0-1023/384302 | public, max-age=0 |
| http://127.0.0.1:3101/assets/wedding/optimized/hero-mobile.mp4 | 206 | video/mp4 | bytes 0-1023/573714 | public, max-age=0 |
| http://127.0.0.1:3101/assets/wedding/optimized/hero-mobile.webm | 206 | video/webm | bytes 0-1023/389442 | public, max-age=0 |
| http://127.0.0.1:3101/assets/wedding/optimized/opening-mobile.mp4 | 206 | video/mp4 | bytes 0-1023/604851 | public, max-age=0 |
| https://janith-pradeepa.vercel.app/assets/homecoming/optimized/closing-mobile.mp4 | 206 | video/mp4 | bytes 0-1023/676357 | public, max-age=0, must-revalidate |
| https://janith-pradeepa.vercel.app/assets/homecoming/optimized/closing-mobile.webm | 206 | video/webm | bytes 0-1023/467861 | public, max-age=0, must-revalidate |
| https://janith-pradeepa.vercel.app/assets/homecoming/optimized/opening-mobile.mp4 | 206 | video/mp4 | bytes 0-1023/483336 | public, max-age=0, must-revalidate |
| https://janith-pradeepa.vercel.app/assets/homecoming/optimized/silk-mobile.mp4 | 206 | video/mp4 | bytes 0-1023/944991 | public, max-age=0, must-revalidate |
| https://janith-pradeepa.vercel.app/assets/homecoming/optimized/silk-mobile.webm | 206 | video/webm | bytes 0-1023/859578 | public, max-age=0, must-revalidate |
| https://janith-pradeepa.vercel.app/assets/wedding/optimized/closing-mobile.mp4 | 206 | video/mp4 | bytes 0-1023/601223 | public, max-age=0, must-revalidate |
| https://janith-pradeepa.vercel.app/assets/wedding/optimized/closing-mobile.webm | 206 | video/webm | bytes 0-1023/438400 | public, max-age=0, must-revalidate |
| https://janith-pradeepa.vercel.app/assets/wedding/optimized/cover-mobile.mp4 | 206 | video/mp4 | bytes 0-1023/503917 | public, max-age=0, must-revalidate |
| https://janith-pradeepa.vercel.app/assets/wedding/optimized/cover-mobile.webm | 206 | video/webm | bytes 0-1023/384302 | public, max-age=0, must-revalidate |
| https://janith-pradeepa.vercel.app/assets/wedding/optimized/hero-mobile.mp4 | 206 | video/mp4 | bytes 0-1023/573714 | public, max-age=0, must-revalidate |
| https://janith-pradeepa.vercel.app/assets/wedding/optimized/hero-mobile.webm | 206 | video/webm | bytes 0-1023/389442 | public, max-age=0, must-revalidate |
| https://janith-pradeepa.vercel.app/assets/wedding/optimized/opening-mobile.mp4 | 206 | video/mp4 | bytes 0-1023/604851 | public, max-age=0, must-revalidate |

## Exact skip and failure paths

OpeningFilm.jsx completes immediately through setTimeout(onComplete, 0) when backgroundVideo is false (reduced motion, Save Data, 2g/3g or downlink below 1.5Mbps). video.play().catch(onComplete), onError and onEnded all complete the opening. A 20-second timeout also completes it. Escape and the Skip button are intentional user exits. Visibility changes tear down and restart its effect. Thus a policy rejection, unsupported decoder, interrupted request or stalled download can skip the experience entirely. The particular physical phones have not been instrumented, so their individual cause remains unverified.

VideoBackdrop permanently fails after a rejected play promise or media error. It retries advertised-but-stalled VP9 at 2.5s, with another 8s timeout, but has no waiting/timeupdate stall watchdog, no gesture retry, no buffered progress and no source reset when far away or failed. The opening uses a separate player outside that lifecycle. Native muted property and remote-playback protection are missing. Cover/opening MP4s use High rather than Main/Baseline. GOP, maxrate and profile are implicit. Raw originals are 1080x1920 with AAC and moov at the end, but are already archived outside /public and deployment. Existing shipped clips are small, silent, yuv420p and faststart.

## Photo audit

Only three distinct photographic portraits exist: wedding-couple-feature.jpeg (outdoor seated portrait, strongest detail and warm natural setting), wedding-couple-feature 2.jpeg (studio seated portrait, clear faces and complementary pose), homecoming-couple-feature.jpeg (formal maroon portrait, strongest match for that theme). The two PNG couple-feature files are illustrations and remain hero artwork, not gallery photographs. Their faces sit in the upper third; use object-position 50% 30%. Keep the two wedding photographs on /wedding and the maroon portrait on /homecoming. Another 3-5 distinct photographs are needed to choose 6-8 overall; ideally more of each event theme, full-resolution originals, including candid and wider framing.

## Implementation plan

1. Re-encode every original with capped Main H.264, fixed 24fps/2s GOP, silent faststart, smaller optional VP9, hashed posters and blur; archive unused derivatives outside deployment and cache shipped assets.
2. Share a loading/ready/playing/fallback player with six-second start and four-second stall bounds, one gesture retry, decoder fallback, visibility/proximity/source cleanup, device limits and development diagnostics.
3. Build a video-independent 2.5s curtain reveal, remembered music/visitor preferences, and exactly the four requested micro-interactions.
4. Grade and export portrait AVIF/WebP pairs, safe crop positions, deferred lightbox neighbors; generate themed social/icon/manifest assets and route metadata.
5. Build, lint, run browser/media checks, record honest device coverage and asset tables, then commit/push the tested work.
