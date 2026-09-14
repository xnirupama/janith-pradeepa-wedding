# Media asset guide

All media is optional during development. Replace files without changing their paths.

| Event | Purpose | Exact path |
|---|---|---|
| Wedding | Hero couple photo | `public/assets/wedding/photos/wedding-hero.jpg` |
| Wedding | Featured couple portrait | `public/assets/wedding/photos/wedding-couple-feature.jpeg` |
| Wedding | Gallery | `public/assets/wedding/gallery/wedding-gallery-01.jpg` (continue numerically) |
| Wedding | Couple opening film | `public/assets/wedding/videos/wedding-opening-couple.mp4` |
| Wedding | Gate mandala ornament | `public/assets/wedding/decor/wedding-gate-mandala.webp` |
| Wedding | Gate white lotus ornament | `public/assets/wedding/decor/wedding-gate-lotus.webp` |
| Wedding | Gate ceremonial procession | `public/assets/wedding/decor/wedding-gate-procession.webp` |
| Wedding | Hero video | `public/assets/wedding/videos/wedding-hero-loop.mp4` |
| Wedding | Floral/media video | `public/assets/wedding/videos/wedding-floral-loop.mp4` |
| Wedding | Floral frame section video | `public/assets/wedding/videos/wedding-floral-frame-loop.mp4` |
| Wedding | Falling petals section video | `public/assets/wedding/videos/wedding-petals-loop.mp4` |
| Wedding | Soft light section video | `public/assets/wedding/videos/wedding-soft-light-loop.mp4` |
| Wedding | Closing video | `public/assets/wedding/videos/wedding-closing-loop.mp4` |
| Wedding | Optional invitation-section video | `public/assets/wedding/videos/wedding-invitation-loop.mp4` |
| Wedding | Optional photo-section video | `public/assets/wedding/videos/wedding-photo-loop.mp4` |
| Wedding | Optional schedule-section video | `public/assets/wedding/videos/wedding-schedule-loop.mp4` |
| Wedding | Optional countdown-section video | `public/assets/wedding/videos/wedding-countdown-loop.mp4` |
| Wedding | Optional gallery-section video | `public/assets/wedding/videos/wedding-gallery-loop.mp4` |
| Wedding | Optional location-section video | `public/assets/wedding/videos/wedding-location-loop.mp4` |
| Wedding | Optional RSVP-section video | `public/assets/wedding/videos/wedding-rsvp-loop.mp4` |
| Wedding | Hero background | `public/assets/wedding/backgrounds/wedding-hero-bg.jpeg` |
| Wedding | Section background | `public/assets/wedding/backgrounds/wedding-section-bg.jpeg` |
| Wedding | Background music | `public/assets/wedding/music/wedding-theme.mp3` |
| Wedding | Social preview | `public/assets/wedding/share/wedding-og.jpg` |
| Homecoming | Hero couple photo | `public/assets/homecoming/photos/homecoming-hero.jpg` |
| Homecoming | Featured couple portrait | `public/assets/homecoming/photos/homecoming-couple-feature.jpeg` |
| Homecoming | Gallery | `public/assets/homecoming/gallery/homecoming-gallery-01.jpg` (continue numerically) |
| Homecoming | Couple opening film | `public/assets/homecoming/videos/homecoming-opening-couple.mp4` |
| Homecoming | Hero video | `public/assets/homecoming/videos/homecoming-hero-loop.mp4` |
| Homecoming | Glow/media video | `public/assets/homecoming/videos/homecoming-glow-loop.mp4` |
| Homecoming | Floral frame section video | `public/assets/homecoming/videos/homecoming-floral-frame-loop.mp4` |
| Homecoming | Falling petals section video | `public/assets/homecoming/videos/homecoming-petals-loop.mp4` |
| Homecoming | Butterfly countdown video | `public/assets/homecoming/videos/homecoming-countdown-butterfly-loop.mp4` |
| Homecoming | Closing video | `public/assets/homecoming/videos/homecoming-closing-loop.mp4` |
| Homecoming | Optional invitation-section video | `public/assets/homecoming/videos/homecoming-invitation-loop.mp4` |
| Homecoming | Optional photo-section video | `public/assets/homecoming/videos/homecoming-photo-loop.mp4` |
| Homecoming | Optional arrival-section video | `public/assets/homecoming/videos/homecoming-arrival-loop.mp4` |
| Homecoming | Optional countdown-section video | `public/assets/homecoming/videos/homecoming-countdown-loop.mp4` |
| Homecoming | Optional gallery-section video | `public/assets/homecoming/videos/homecoming-gallery-loop.mp4` |
| Homecoming | Optional location-section video | `public/assets/homecoming/videos/homecoming-location-loop.mp4` |
| Homecoming | Optional RSVP-section video | `public/assets/homecoming/videos/homecoming-rsvp-loop.mp4` |
| Homecoming | Hero background | `public/assets/homecoming/backgrounds/homecoming-hero-bg.jpeg` |
| Homecoming | Section background | `public/assets/homecoming/backgrounds/homecoming-section-bg.jpeg` |
| Homecoming | Background music | `public/assets/homecoming/music/homecoming-theme.mp3` |
| Homecoming | Social preview | `public/assets/homecoming/share/homecoming-og.jpg` |
| Shared | Optional placeholders | `public/assets/shared/placeholders/` |
| Shared | Optional icons | `public/assets/shared/icons/` |

For previews, 1200×630 is recommended. Keep videos compressed (ideally below roughly 8 MB each) and use sensible image dimensions.

The uploaded section-specific videos are mapped centrally in `src/data/invitations.js`. Each section falls back to the event's existing feature loop if its dedicated video cannot load, and then to the static section poster if video playback is unavailable.
