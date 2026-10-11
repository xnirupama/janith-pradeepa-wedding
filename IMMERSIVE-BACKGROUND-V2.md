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

Actual sizes, screenshots, measurements and production evidence will be appended after verification.
