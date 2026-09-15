# Google Sheets RSVP setup

This project uses a free server-side RSVP flow:

`Guest browser -> POST /api/rsvp -> Google Apps Script -> Google Sheets -> MailApp notification`

The browser never receives or posts directly to the Apps Script URL. Wedding and Homecoming responses are stored in separate tabs inside one spreadsheet.

Each server submission also carries a random, non-personal request ID. Apps Script stores a short-lived confirmation receipt after the Sheet write. If Google's final redirected POST response fails, the Next.js server checks the plain health endpoint for its matching receipt before deciding whether to show success, so a saved RSVP is not incorrectly reported as failed. The health response contains no guest details, configuration values, spreadsheet IDs, or email addresses.

## One-time setup

1. **Create the spreadsheet.** Open Google Sheets, create a blank spreadsheet, and name it **Janith & Pradeepa — RSVP Responses**.

2. **Copy the Spreadsheet ID.** In a URL such as `https://docs.google.com/spreadsheets/d/ABC123XYZ987/edit`, the Spreadsheet ID is `ABC123XYZ987`.

3. **Open Apps Script.** From the spreadsheet, choose **Extensions -> Apps Script**.

4. **Install the RSVP script.** Delete the default editor code. Copy the complete contents of `docs/google-apps-script/Code.gs` from this repository and paste it into `Code.gs`. Save the project.

5. **Set the timezone.** In Apps Script, open **Project Settings** and set the timezone to **Asia/Colombo**.

6. **Add the Spreadsheet ID property.** In **Project Settings -> Script Properties**, add:

   - Property: `RSVP_SPREADSHEET_ID`
   - Value: your actual Spreadsheet ID from step 2

7. **Add the notification email property.** In the same Script Properties section, add:

   - Property: `RSVP_NOTIFICATION_EMAIL`
   - Value: `nirupama.minipa@gmail.com`

   Keep the email in Script Properties. Do not add it to browser JavaScript.

8. **Create a deployment.** Choose **Deploy -> New deployment**, click the deployment type selector, and select **Web app**.

9. **Configure access.** Set **Execute as** to **Me** and **Who has access** to **Anyone**, then click **Deploy**.

10. **Authorize the script.** Sign in and approve the requested Google permissions. The script needs permission to write RSVP rows to Google Sheets and send notification emails through MailApp.

11. **Copy the Web App URL.** Copy the deployed URL resembling `https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec`. Use the URL ending in `/exec`, not an editor, library, or `/dev` URL.

12. **Configure local development.** In the project root, open the already-created `.env.local` file and set:

    ```dotenv
    RSVP_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
    ```

    Replace the example with the real `/exec` URL. `.env.local` is ignored by Git and must never be committed.

13. **Restart Next.js.** Stop the current development server and run:

    ```bash
    npm run dev
    ```

14. **Test Wedding.** Open `http://localhost:3000/wedding`, submit a Wedding RSVP, and verify that **Wedding RSVPs** receives the row and `nirupama.minipa@gmail.com` receives a notification.

15. **Test Homecoming.** Open `http://localhost:3000/homecoming`, submit a Homecoming RSVP, and verify that **Homecoming RSVPs** receives the row and `nirupama.minipa@gmail.com` receives a notification.

16. **Test a Wedding update.** Submit Wedding again with the same phone number. The existing Wedding row should update, its original **Timestamp** should remain, **Last Updated** should change, and the email subject should say **Updated Wedding RSVP**.

17. **Test the same guest on both days.** Submit Homecoming using the same phone number. The Wedding row must remain in **Wedding RSVPs**, while an independent response is created in **Homecoming RSVPs**.

18. **Configure Vercel.** Open **Vercel Dashboard -> janith-pradeepa project -> Settings -> Environment Variables**. Add:

    - Name: `RSVP_GOOGLE_SCRIPT_URL`
    - Value: the real Apps Script URL ending in `/exec`
    - Environments: **Production**, **Preview**, and **Development**

19. **Redeploy Vercel.** Save the variable and redeploy the relevant deployment. Existing deployments do not automatically gain a newly added environment variable.

20. **Redeploy after future script changes.** Saving `Code.gs` does not necessarily update the active Web App. Choose **Deploy -> Manage deployments -> Edit -> New version -> Deploy**, then retest both forms.

    After deployment, opening the `/exec` URL in a browser returns a minimal JSON health check with `success: true`. Its temporary `receipts` list contains only random request IDs and save-status booleans used for response reconciliation; it never exposes guest details, the Spreadsheet ID, the notification address, or Script Property values.

    The Next.js site also exposes `/api/rsvp/health`. It returns only `configured` and `upstreamReachable` booleans, making it safe to use for deployment checks without exposing the Apps Script URL or any RSVP data.

## Automatically created Google Sheet tabs

The first valid RSVP automatically creates these tabs if they do not exist:

- **Wedding RSVPs**
- **Homecoming RSVPs**
- **Summary**

Each response tab has these columns:

1. Timestamp
2. Last Updated
3. Full Name
4. Phone Number
5. Attending
6. Number of Guests
7. Message

The **Summary** tab is refreshed after every saved RSVP and displays, separately for Wedding and Homecoming:

- Total Responses
- Attending Yes
- Attending No
- Expected Guest Count
- Last Updated in the `Asia/Colombo` timezone

## Duplicate and phone rules

Responses are identified by **event + normalized phone number**. Because each event has its own tab, the same phone can have one Wedding response and one Homecoming response without mixing the events.

For a repeat submission to the same event, the script updates the existing row rather than appending a duplicate. The original **Timestamp** is retained and **Last Updated** records the new time.

These Sri Lankan formats normalize to the same value, `+94771234567`:

- `0771234567`
- `077 123 4567`
- `077-123-4567`
- `+94 77 123 4567`
- `+94771234567`
- `94771234567`

Valid international phone numbers are also accepted when they contain 7–15 digits.

## Email behavior

New and updated Wedding/Homecoming responses produce distinct email subjects. Each notification includes a plain-text body and a mobile-friendly HTML body. Guest-provided values are HTML-escaped, and values written to Sheets retain formula-injection protection.

If the email property is missing, MailApp reaches its quota, or sending otherwise fails, the RSVP remains saved. The script logs the notification problem and returns `notificationSent: false`; guests are not asked to resubmit a response that was already stored.

Google applies daily MailApp recipient quotas, and the quota varies by account type. Email delivery is therefore not unlimited.

## Complete test checklist

Run these after deployment:

1. Wedding, attending Yes, 1 guest — creates a Wedding row.
2. Wedding, attending Yes, 4 guests — stores 4 expected guests.
3. Wedding, attending No — stores 0 guests.
4. Homecoming, attending Yes, 2 guests — creates a Homecoming row.
5. Homecoming, attending No — stores 0 guests.
6. Wedding duplicate with the same phone — updates the Wedding row.
7. Homecoming duplicate with the same phone — updates the Homecoming row.
8. Same phone for Wedding and Homecoming — creates two independent responses.
9. Invalid phone — shows a validation error and stores nothing.
10. Missing name — shows a validation error and stores nothing.
11. Invalid guest count — shows a validation error and stores nothing.
12. Populated hidden `website` field — is silently discarded by the Next.js server.
13. MailApp failure — RSVP remains saved and the response reports `notificationSent: false`.
14. Missing `RSVP_GOOGLE_SCRIPT_URL` — returns the safe configuration message and does not expose environment details.

## Clear test responses before launch

The `clearRsvpTestData` Apps Script function clears all response rows from **Wedding RSVPs** and **Homecoming RSVPs**, removes temporary receipts, and resets **Summary** while preserving the tabs, headers, and formatting.

1. Confirm that every current response row is test data.
2. In **Apps Script -> Project Settings -> Script Properties**, add `RSVP_CLEAR_CONFIRMATION` with the exact value `CLEAR TEST RSVP DATA`.
3. In the Apps Script editor, select `clearRsvpTestData` from the function dropdown.
4. Click **Run** and confirm the execution completes successfully.
5. Refresh the spreadsheet and verify both RSVP tabs contain headers only.

The script automatically deletes `RSVP_CLEAR_CONFIRMATION` after a successful cleanup, preventing an accidental second run. Google Sheets version history can be used if test rows need to be recovered later.

## Troubleshooting the configuration message

If the form says **“RSVP submissions are not configured yet. Please contact the couple directly.”**, Next.js cannot find a valid `RSVP_GOOGLE_SCRIPT_URL` ending in `/exec`.

Check that:

- `.env.local` exists at the project root and contains the real URL.
- The URL begins with `https://script.google.com/` and ends in `/exec`.
- The local Next.js server was restarted after editing `.env.local`.
- Vercel contains the variable for the deployment environment being tested.
- Vercel was redeployed after the variable was added or changed.
- Opening the `/exec` URL reports `success: true`, and `/api/rsvp/health` reports both booleans as `true`.

The script accepts either the raw Spreadsheet ID or a full Google Sheets URL in `RSVP_SPREADSHEET_ID`, although the raw ID is recommended. If the script was created through **Extensions -> Apps Script**, it can also fall back to its bound spreadsheet when that property is missing.
