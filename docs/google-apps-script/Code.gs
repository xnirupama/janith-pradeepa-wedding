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

function normalizePhoneNumber(value) {
  const raw = String(value == null ? "" : value).trim();
  let digits = raw.replace(/\D/g, "");
  if (digits.indexOf("00") === 0) digits = digits.slice(2);
  if (digits.length === 10 && digits.charAt(0) === "0") return "+94" + digits.slice(1);
  if (digits.length === 9 && digits.charAt(0) === "7") return "+94" + digits;
  if (digits.length === 11 && digits.indexOf("94") === 0) return "+" + digits;
  if (raw.charAt(0) === "+" && digits) return "+" + digits;
  return digits;
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

    const normalizedPhone = normalizePhoneNumber(data.phoneNumber);
    if (normalizedPhone.replace(/\D/g, "").length < 7) throw new Error("Invalid phone number.");
    const eventName = data.event === "wedding" ? "Wedding" : "Homecoming";
    const rowValues = [
      Utilities.formatDate(new Date(), "Asia/Colombo", "yyyy-MM-dd HH:mm:ss"),
      eventName,
      safeCell(data.fullName).slice(0, 120),
      safeCell(normalizedPhone).slice(0, 40),
      data.attending === "yes" ? "Yes" : "No",
      guests,
      safeCell(data.message).slice(0, 800),
    ];

    const lock = LockService.getScriptLock();
    lock.waitLock(5000);
    let updated = false;
    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      let sheet = spreadsheet.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

      const rows = sheet.getLastRow() > 1
        ? sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues()
        : [];
      const existingIndex = rows.findIndex(function (row) {
        return String(row[1]).trim().toLowerCase() === eventName.toLowerCase()
          && normalizePhoneNumber(row[3]) === normalizedPhone;
      });

      if (existingIndex >= 0) {
        sheet.getRange(existingIndex + 2, 1, 1, HEADERS.length).setValues([rowValues]);
        updated = true;
      } else {
        sheet.appendRow(rowValues);
      }
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ success: true, updated: updated });
  } catch (error) {
    console.error(error);
    return jsonResponse({ success: false, error: "Unable to save RSVP." });
  }
}
