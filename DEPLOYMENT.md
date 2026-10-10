# Deploy to Vercel

1. Run `npm run lint` and `npm run build`.
2. Create a Git repository in this project root and push it to GitHub.
3. In Vercel, import the GitHub repository.
4. Set the project name to **janith-pradeepa**; Vercel will detect Next.js.
5. Deploy the application.
6. Verify `/`, `/wedding`, and `/homecoming` through their direct production URLs.
7. On a phone, test opening/music, calendar download, directions, gallery, Contact navigation, Share and Replay. Check reduced motion and Save-Data poster fallbacks.

Optimize large media before committing so the invitation stays fast on mobile data.

Original videos live in `media-sources/`, outside the published assets. The published MP4/WebM files and posters live in `public/assets/*/optimized/`; preparation and verification commands are documented in [ASSETS.md](./ASSETS.md) and [INVITATION-UPGRADE.md](./INVITATION-UPGRADE.md).
