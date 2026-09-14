# Google Sheets RSVP setup

The site sends both events through the server-side `/api/rsvp` route, so the Apps Script deployment URL never appears in browser code.

1. Create one Google Sheet.
2. Copy its spreadsheet ID from the text between `/d/` and `/edit` in the URL.
3. Open **Extensions → Apps Script**.
4. Paste the repository's `docs/google-apps-script/Code.gs` into the editor.
5. Replace `PASTE_SPREADSHEET_ID_HERE` with the spreadsheet ID.
6. In Apps Script project settings, set the timezone to **Asia/Colombo**.
7. Choose **Deploy → New deployment → Web app**.
8. Select **Execute as: Me** and access appropriate for public form submissions (typically **Anyone**).
9. Deploy, authorize the script, and copy the Web App URL ending in `/exec`.
10. Create `.env.local` locally and set `RSVP_GOOGLE_SCRIPT_URL=YOUR_DEPLOYMENT_URL`.
11. Add the same environment variable in Vercel, then redeploy.
12. Test both `/wedding` and `/homecoming`. Confirm their Event cells read `Wedding` and `Homecoming` independently.

The `RSVP` sheet is created if missing. Its columns are Timestamp, Event, Full Name, Phone Number, Attending, Number of Guests, and Message.

Responses use `Event + normalized phone number` as their identity. Sri Lankan `07XXXXXXXX`, `+947XXXXXXXX`, spaced and hyphenated formats normalize consistently. A later response for the same event and phone number updates the existing row—including its timestamp, name, attendance, guest count and message—instead of appending a duplicate. Deploy a new Apps Script version after replacing `Code.gs` so this update behavior is active.

The Next.js API also rejects oversized or non-JSON requests and silently discards the hidden honeypot field. The browser applies a short post-success cooldown. Durable distributed rate limiting on Vercel would require an external store such as Vercel KV/Upstash and is intentionally not represented here as an in-memory guarantee.
