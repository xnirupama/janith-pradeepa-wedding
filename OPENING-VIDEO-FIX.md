# Opening video playback fix

The latest request makes the actual opening film mandatory. It supersedes the earlier 2.5-second total-opening constraint and poster-only policy for the requested film. The film now plays for its full ten seconds before the short curtain reveal; returning visitors still see the film, followed by the shorter reveal.

## Confirmed causes

The previous OpeningFilm removed itself after 2.5 seconds (900ms for returning visitors), while BackgroundVideo could wait five seconds for canplaythrough. Its curtains obscured the media, and opening-memory faded out before loading completed. The opening also inherited decorative policies that disabled video for reduced motion, Save Data, 3g and low-end devices. Its delayed play calls could lose the trusted Open tap required by some mobile browsers.

## Change

The shared BackgroundVideo has a requested-film controller. Its DOM player is mounted before the tap with no source or video download. Open and Replay show the dialog, set the muted/inline properties, attach the compatible faststart Main H.264 MP4 and call play synchronously inside the click handler. There is no opening WebM decoder gamble, five-second buffer gate, visibility observer delay or decorative-device-policy veto.

Actual playing events reveal the film. Its screen stays opaque and visible, without curtains or premature fade, until the native ended event. Then the existing curtain animation runs: 2.5 seconds, 900ms for a returning visitor, or 400ms with reduced motion. Reduced motion suppresses decoration while allowing the explicitly requested film. Background-video policies remain unchanged, and the background players pause while the film is active.

A blocked play or network failure stays in the opening with a translated Play button and suitable native controls. It never automatically jumps to the invitation. Retry is another direct gesture and can be used repeatedly. Metadata arriving after a rejected play cannot hide the Play button. Page visibility pauses/resumes the requested player. Replay resets the clip and restores the original page scroll after completion or an intentional Skip. Music preference/gesture behavior and all factual copy, phone/map links remain intact.

## Verification

- Production build, lint and all eight factual/translation/media/contrast verification groups pass.
- 36 opening cases across Chromium and WebKit and both routes pass: normal, direct-gesture-required, blocked-once retry, reduced motion, Save Data, 3g, low-end device, returning visitor/replay and delayed loading. Four normal cases let the real ten-second film end naturally; other cases verify real advancing frames and seek to the end to test the native completion transition. The delayed-MP4 interception case applies to Chromium; WebKit's native media loader can bypass the test interceptor.
- Screenshots at more than three seconds show the actual couple video, with no curtains covering it. Tests check currentTime advancement, MP4 source, inline/muted properties, no loop, visible video and absence of the previous premature completion.
- 24 background-policy/visibility/two-player-limit cases pass, along with 16 small-phone EN/SI layout/navigation/replay cases. Existing audio, language persistence, calendar, share and countdown action checks pass. Eight final retry/visibility regression cases also pass in both engines.
- No opening video is requested before the Open tap. Browser-level playback restrictions and absent/offline media cannot be overridden by JavaScript; the direct Play action remains available instead of silently skipping. Physical phone and in-app tests remain unperformed.

Run `npm run verify:opening` with a Playwright installation configured through `INVITATION_PLAYWRIGHT_MODULE`. Reports and screenshots are local QA artifacts under `artifacts/qa/opening-fix*` and are not deployed.
