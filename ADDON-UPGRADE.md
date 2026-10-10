# Add-on upgrade and verification

Implemented for both `/wedding` and `/homecoming` on 10 October 2026. The factual invitation content, routes, original telephone/map/calendar links, removed RSVP and existing rotating SVG circles are preserved. The pre-change findings were reported and committed first in [ADDON-DIAGNOSIS.md](./ADDON-DIAGNOSIS.md). Every source, derivative and image is listed in [ADDON-ASSETS.md](./ADDON-ASSETS.md).

## Shared video reliability

`BackgroundVideo` now handles cover, opening and ambient playback. It keeps an immediate WebP poster/blur under the video, writes the muted property as well as the attribute, and includes inline/WebKit inline, autoplay, PIP/remote-playback protection and decorative accessibility markup. Sources prefer a smaller VP9 WebM, with a Main H.264 MP4 fallback. Cover/opening use auto preload; ambient uses metadata.

Its loading/ready/playing/fallback states reveal video over 400ms only after a real playing event. Cover/opening reveal also waits for canplaythrough or a five-second buffer deadline. Start attempts end at six seconds; waiting or a frozen media clock falls back after four seconds. Failed sources are reset, and a rejected attempt gets one retry on the next touch, scroll or click. Advertised-but-stalled VP9 falls back to MP4 within the same deadline. Source cleanup, proximity/visibility observers and the shared manager keep at most two players active. Far-away players relinquish sources and decoder slots.

Save Data, 2g/3g, reduced motion and very low downlink use posters. A device reporting <=2GB memory or <=4 logical processors gets cover video only. Cover downloads yield to the poster and typography; the gold lotus/ring/progress loader uses actual buffer progress with a time fallback, expires at six seconds and never disables the Open button. Ambient poster shimmer exists only while visible; existing SVG rotations provide the fallback motion.

Only the cover poster and first video receive media hints. Chromium consumes a fetch preload explicitly; Safari receives a video hint and falls back to native auto preload when the hint is unsupported. No ambient or opening media is requested before the opening gesture. Network failure can produce expected browser network-error messages; no uncaught application errors were observed.

Every original has a compatible, fixed-24fps, silent, capped-rate Main 3.1/yuv420p/faststart MP4 with two-second keyframes and a matching poster. Thirteen smaller VP9 alternatives were retained; three larger encodes were discarded. Seven selected clips are published, all under 1MB. Originals and unused compatible alternatives remain outside deployment. All 29 retained derivatives were decoded and their 240 frames/keyframes checked; WebM uses millisecond timestamp quantization.

The new hashed video/poster paths return HTTP 206, correct media types and `public, max-age=31536000, immutable` locally. The prior production paths also passed Range/type checks before changes. `/public` is about 21.4MB including the unchanged music; its largest video is 973,458 bytes. This is comfortably below the documented CLI upload limits when archives/tools are excluded: [Vercel limits](https://vercel.com/docs/limits). No object storage is needed for the current clips.

## Opening, preferences and finishing touches

The gesture starts a 2.5-second paper/velvet curtain reveal, a brief ring fade and eighteen gold petals. Hero content mounts beneath it, with its existing rotating mandala. Completion is independent of video end/error/autoplay; the poster and CSS reveal always work. Reduced motion gets a 400ms cross-fade, remembered visitors get 900ms, and Replay uses the full 2.5 seconds unless reduced motion is requested. Part A's buffer wait applies to revealing video pixels; it cannot extend Part D's reveal clock beyond three seconds.

Audio starts only after the gesture, fades to volume .35 over two seconds and respects a saved mute choice. A saved unmuted choice never starts audio on arrival. Language, opening-seen and music preferences use protected localStorage access. Visibility pauses playback; a user mute remains respected on return.

The four new shared micro-interactions are press-scale/visible-only primary shimmer, one date glint after the hero is revealed, an accessible lotus bloom with four petals, and the sliding navigation indicator with an optional 8ms gesture vibration. Reduced motion suppresses each. Existing slow ornament rotations remain; ambient petals start after the opening so they do not compete with its burst.

Both routes have themed SVG/ICO, 180px Apple and PWA icons/manifests. The styled 404 links directly to both invitations. Global route loading uses the small SVG lotus loader. Safe-area scroll padding, overscroll containment, text sizing and tap highlighting are configured; selection remains available on text. All archives and tools are absent from the seven production server traces.

## Photo and social presentation

The three distinct supplied portraits were visually audited and retained. They have a subtle shared warmth/brightness/soft-contrast grade, faint vignette and face-safe object positions. AVIF/WebP pairs have 640 and 1080 ceilings without inventing detail through enlargement. Gallery tiles keep fixed aspect ratios. The lightbox mounts the larger image on open and actually loads neighboring images in both engines; pinch, pan, swipe, focus and scroll restoration remain.

The two hero PNG sources are illustrations and do not inflate the photograph count. More photographs are required for 6-8-photo galleries; details and selection reasons are in [ADDON-ASSETS.md](./ADDON-ASSETS.md).

New 1200x630 and 600x600 previews use the page themes, centred names/date, lotus and faint mandala. JPEG sizes are 20,935-36,051 bytes. Minimum palette contrast over the mandala is 4.69:1 for wedding and 9.44:1 for homecoming. The former homecoming preview's old location line was replaced as required by this add-on. Page metadata includes title/description, absolute production OG image/URL/dimensions/alt/type/locale, Twitter card, canonical, icons/manifest and viewport theme colour. Guest values never enter preview metadata.

Validate after deployment:

```bash
node scripts/verify-social.mjs https://janith-pradeepa.vercel.app
```

The validator requests bot-visible HTML, checks every required tag/canonical, rejects guest leakage and verifies the live JPEG size and dimensions. It also accepts `http://127.0.0.1:3101` for local checks. For a re-scrape, paste the clean production `/wedding` or `/homecoming` URL into [Meta Sharing Debugger](https://developers.facebook.com/tools/debug/) and use Scrape Again. Meta's page could not be accessed by the automated web tool, so its current UI/account requirements were not verified. Send the clean link in a new WhatsApp conversation to inspect its current preview; a Meta re-scrape does not guarantee WhatsApp cache eviction. No external shares/messages were sent during testing.

## Real test matrix

These are isolated browser/CLI results, not claims of testing physical phones.

| Requested environment or behavior | Actual method | Result |
|---|---|---|
| iPhone Safari normal | Desktop WebKit engine, mobile viewport/touch; real MP4 decode | Pass emulation; physical Safari untested |
| iPhone Low Power Mode | Rejected-play simulation in both engines | Poster fallback + one retry + full opening passed; actual Low Power Mode untested |
| WhatsApp / Instagram / Facebook iOS browsers | No physical app sessions available | Untested |
| Android Chrome | Chromium with mobile viewport/touch and real video decode | Pass emulation; physical Android Chrome untested |
| Samsung Internet | No physical browser available | Untested |
| Older low-end Android | deviceMemory=2 and hardwareConcurrency=2 simulation | Only cover loads; opening/poster reveal passed; actual old hardware untested |
| Slow 4G / Fast 3G | Chromium CDP adjusted preset: 180,000 B/s down, 84,375 B/s up, 562.5ms latency | Both routes played; opening completed |
| Additional severe network stress | 0.4Mbps/150ms custom profile, policy held at 4g to exercise watchdog | Both routes used poster fallback and retained the reveal |
| Offline/airplane toggling during load | Chromium setOffline true/false | Poster fallback and reveal passed on both routes; physical airplane mode untested |
| Data Saver | navigator.connection.saveData simulation in both engines | No video before tap; poster reveal passed |
| Reduced motion | Both engine media emulation | No video downloads, no micro-motion, 400ms opening passed |
| Delayed media and frozen clock | Delayed requests and frozen currentTime / waiting event | Chromium start timeout and both-engine stall fallback passed; WebKit recovered delayed WebM through MP4 |
| Returning visitor / saved mute / blocked storage | localStorage fixtures, reloads, replay and denied Storage methods | Pass in both engines |
| Diagnostics | Development webpack preview with ?debug=1, production same query | Values rendered in development; zero overlays in production |

Chrome renamed its former Fast 3G preset to Slow 4G; both requested names now refer to that preset. The adjusted parameters above follow [Chrome DevTools' preset source](https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/core/sdk/NetworkManager.ts). WebKit's native MP4 loader bypasses Playwright request interception here; a delayed-WebM test therefore proves MP4 recovery, not a fully blocked WebKit network.

Additional checks: 40 layout scenarios across 320/360/390/430/1280 widths, two routes, EN/SI and both engines; 24 policy scenarios plus 12 scheduling regression cases; 16 core resilience cases plus network cases; eight gallery cases; gesture/audio/calendar/share/language/countdown actions; sixteen brand assets/bot metadata/styled 404; twenty-one Range/cache checks and eight factual/locale/media/contrast verification groups. Build and lint pass with no application build warnings. Normal policy tests assert zero page errors and zero console errors/warnings. No gallery, hero or footer forms were reintroduced; both original call links and maps remain unchanged.

## Known limits and assets needed

Physical phone/LPM/in-app behavior still requires the real-device checks above. Automated coverage cannot prove every phone model. The development Turbopack HMR process panicked once on this Windows drive; `npm run dev:webpack` was used successfully for diagnostics. Production Turbopack builds pass.

Cold Windows Chromium performance at 390x844, 150ms latency, 1.6Mbps and 4x CPU throttling measured LCP about 2.7-3.4s, CLS 0 and about 601KB encoded JS. This remains above the earlier 2.5s LCP target. One completed wedding cover resource pair totalled 957,478 encoded bytes; partial/cancelled homecoming requests are not fully represented by Resource Timing. A conservative duplicate-cover plus MP4-recovery bound is under 3MB, within the requested 5MB pre-interaction video budget. No audio was requested before tap. These local timings are not a claim of a production Lighthouse score.

Provide another 3-5 distinct photos to choose 6-8 overall, or 4-6 wedding and 5-7 homecoming photos for separate 6-8-image themed galleries. Full-resolution originals and a few candid/wider compositions would complement the current three formal portraits. The supplied illustrations remain hero artwork.
