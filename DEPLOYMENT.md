# Deploy to Vercel

1. Run `npm run lint` and `npm run build`.
2. Create a Git repository in this project root and push it to GitHub. Never commit `.env.local`.
3. In Vercel, import the GitHub repository.
4. Set the project name to **janith-pradeepa**; Vercel will detect Next.js.
5. Add `RSVP_GOOGLE_SCRIPT_URL` in **Settings → Environment Variables**.
6. Deploy or redeploy after adding the variable.
7. Verify `/`, `/wedding`, and `/homecoming` through their direct production URLs.
8. On a phone, open each invitation and test music, calendar download, directions, gallery, and one RSVP per event.

Optimize large media before committing so the invitation stays fast on mobile data.
