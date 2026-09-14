/** Google Apps Script endpoint for Janith & Pradeepa RSVPs. */
const SPREADSHEET_ID = "PASTE_SPREADSHEET_ID_HERE"; // From the Google Sheet URL.
const SHEET_NAME = "RSVP";
const HEADERS = ["Timestamp", "Event", "Full Name", "Phone Number", "Attending", "Number of Guests", "Message"];

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function safeCell(value) {
  const text = String(value == null ? "" : value).trim();
  // Stop guest input beginning with formula characters from executing in Sheets.
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return jsonResponse({ success: false, error: "Missing request body." });

    const data = JSON.parse(e.postData.contents);
    if (!["wedding", "homecoming"].includes(data.event)) throw new Error("Invalid event.");
    if (!["yes", "no"].includes(data.attending)) throw new Error("Invalid attendance value.");
    if (!data.fullName || !data.phoneNumber) throw new Error("Name and phone number are required.");

    let guests = Number(data.numberOfGuests);
    if (data.attending === "no") guests = 0;
    if (data.attending === "yes" && (!Number.isInteger(guests) || guests < 1 || guests > 20)) throw new Error("Invalid guest count.");

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    sheet.appendRow([
      Utilities.formatDate(new Date(), "Asia/Colombo", "yyyy-MM-dd HH:mm:ss"),
      data.event === "wedding" ? "Wedding" : "Homecoming",
      safeCell(data.fullName).slice(0, 120),
      safeCell(data.phoneNumber).slice(0, 40),
      data.attending === "yes" ? "Yes" : "No",
      guests,
      safeCell(data.message).slice(0, 800),
    ]);

    return jsonResponse({ success: true });
  } catch (error) {
    console.error(error);
    return jsonResponse({ success: false, error: "Unable to save RSVP." });
  }
}
