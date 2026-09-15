/** Google Apps Script endpoint for Janith & Pradeepa RSVPs. */
const TIMEZONE = "Asia/Colombo";
const RESPONSE_HEADERS = [
  "Timestamp",
  "Last Updated",
  "Full Name",
  "Phone Number",
  "Attending",
  "Number of Guests",
  "Message",
];
const RESPONSE_SHEETS = {
  wedding: "Wedding RSVPs",
  homecoming: "Homecoming RSVPs",
};
const SUMMARY_SHEET = "Summary";

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function safeCell(value) {
  const text = String(value == null ? "" : value).trim();
  // Prevent guest input beginning with formula characters from executing in Sheets.
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function escapeHtml(value) {
  const characters = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
    return characters[character];
  });
}

function normalizePhoneNumber(value) {
  const raw = String(value == null ? "" : value).trim().replace(/^'/, "");
  let digits = raw.replace(/\D/g, "");
  const hasInternationalPrefix = raw.charAt(0) === "+" || digits.indexOf("00") === 0;
  if (digits.indexOf("00") === 0) digits = digits.slice(2);
  if (digits.length === 10 && digits.charAt(0) === "0") return "+94" + digits.slice(1);
  if (digits.length === 9 && digits.charAt(0) === "7") return "+94" + digits;
  if (digits.length === 11 && digits.indexOf("94") === 0) return "+" + digits;
  if (hasInternationalPrefix && digits) return "+" + digits;
  return digits;
}

function normalizeSpreadsheetId(value) {
  const raw = cleanText(value).replace(/^['"]|['"]$/g, "");
  const urlMatch = raw.match(/\/spreadsheets\/d\/([^/?#]+)/);
  return urlMatch ? urlMatch[1] : raw;
}

function getRsvpSpreadsheet(properties) {
  const configuredId = normalizeSpreadsheetId(properties.getProperty("RSVP_SPREADSHEET_ID"));
  if (configuredId) return SpreadsheetApp.openById(configuredId);

  // A container-bound Apps Script can still use its parent Sheet if the
  // Script Property was accidentally omitted. Script Properties remain the
  // preferred production configuration.
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (activeSpreadsheet) {
    console.error("RSVP_SPREADSHEET_ID is missing; using the bound spreadsheet.");
    return activeSpreadsheet;
  }

  throw new Error("Missing RSVP_SPREADSHEET_ID Script Property.");
}

function receiptCacheKey(requestId) {
  return "rsvp-receipt:" + requestId;
}

function storeRsvpReceipt(requestId, receipt) {
  if (!requestId) return;
  try {
    CacheService.getScriptCache().put(receiptCacheKey(requestId), JSON.stringify(receipt), 600);
  } catch (error) {
    console.error("RSVP was saved, but its temporary receipt could not be stored.", error);
  }
}

function doGet(e) {
  const action = e && e.parameter ? cleanText(e.parameter.action).toLowerCase() : "";
  if (action === "receipt") {
    const requestId = cleanText(e.parameter.requestId);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
      return jsonResponse({ success: false, saved: false });
    }

    const cached = CacheService.getScriptCache().get(receiptCacheKey(requestId));
    if (!cached) return jsonResponse({ success: true, saved: false });
    try {
      const receipt = JSON.parse(cached);
      return jsonResponse({
        success: true,
        saved: receipt.saved === true,
        updated: receipt.updated === true,
        notificationSent: receipt.notificationSent === true,
      });
    } catch (error) {
      console.error("An RSVP receipt could not be parsed.", error);
      return jsonResponse({ success: false, saved: false });
    }
  }

  const properties = PropertiesService.getScriptProperties();
  const spreadsheetPropertyConfigured = Boolean(cleanText(properties.getProperty("RSVP_SPREADSHEET_ID")));
  const notificationEmailConfigured = Boolean(cleanText(properties.getProperty("RSVP_NOTIFICATION_EMAIL")));
  let spreadsheetAccessible = false;

  try {
    const spreadsheet = getRsvpSpreadsheet(properties);
    spreadsheetAccessible = Boolean(spreadsheet && spreadsheet.getId());
  } catch (error) {
    console.error("RSVP health check could not access the spreadsheet.", error);
  }

  return jsonResponse({
    success: spreadsheetAccessible,
    service: "Janith & Pradeepa RSVP",
    spreadsheetPropertyConfigured: spreadsheetPropertyConfigured,
    spreadsheetAccessible: spreadsheetAccessible,
    notificationEmailConfigured: notificationEmailConfigured,
  });
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid request payload.");
  }

  const event = cleanText(payload.event).toLowerCase();
  const fullName = cleanText(payload.fullName);
  const rawPhone = cleanText(payload.phoneNumber);
  const phoneNumber = normalizePhoneNumber(rawPhone);
  const attending = cleanText(payload.attending).toLowerCase();
  const message = cleanText(payload.message);
  const requestId = cleanText(payload.requestId);
  let numberOfGuests = Number(payload.numberOfGuests);

  if (!Object.prototype.hasOwnProperty.call(RESPONSE_SHEETS, event)) throw new Error("Invalid event.");
  if (fullName.length < 2 || fullName.length > 120) throw new Error("Invalid full name.");
  if (rawPhone.length > 40 || !/^[+()\-\s\d]{7,40}$/.test(rawPhone)) throw new Error("Invalid phone number.");
  const phoneDigits = phoneNumber.replace(/\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15) throw new Error("Invalid phone number.");
  if (["yes", "no"].indexOf(attending) === -1) throw new Error("Invalid attendance value.");
  if (message.length > 800) throw new Error("Message is too long.");
  if (requestId && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    throw new Error("Invalid request identifier.");
  }

  if (attending === "no") {
    numberOfGuests = 0;
  } else if (!Number.isInteger(numberOfGuests) || numberOfGuests < 1 || numberOfGuests > 20) {
    throw new Error("Invalid guest count.");
  }

  return {
    event: event,
    fullName: fullName,
    phoneNumber: phoneNumber,
    attending: attending,
    numberOfGuests: numberOfGuests,
    message: message,
    requestId: requestId,
  };
}

function ensureResponseSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);
  if (sheet.getLastRow() === 0) sheet.appendRow(RESPONSE_HEADERS);

  const header = sheet.getRange(1, 1, 1, RESPONSE_HEADERS.length);
  header
    .setValues([RESPONSE_HEADERS])
    .setBackground("#7a1830")
    .setFontColor("#fffaf0")
    .setFontWeight("bold");
  sheet.setFrozenRows(1);
  return sheet;
}

function ensureSheets(spreadsheet) {
  const sheets = {};
  Object.keys(RESPONSE_SHEETS).forEach(function (event) {
    sheets[event] = ensureResponseSheet(spreadsheet, RESPONSE_SHEETS[event]);
  });

  let summary = spreadsheet.getSheetByName(SUMMARY_SHEET);
  if (!summary) summary = spreadsheet.insertSheet(SUMMARY_SHEET);
  sheets.summary = summary;
  return sheets;
}

function findResponseRow(sheet, normalizedPhone) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const phones = sheet.getRange(2, 4, lastRow - 1, 1).getDisplayValues();
  for (let index = 0; index < phones.length; index += 1) {
    if (normalizePhoneNumber(phones[index][0]) === normalizedPhone) return index + 2;
  }
  return -1;
}

function calculateStats(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { total: 0, yes: 0, no: 0, guests: 0 };
  const rows = sheet.getRange(2, 5, lastRow - 1, 2).getValues();
  return rows.reduce(function (stats, row) {
    const attending = String(row[0]).trim().toLowerCase();
    stats.total += 1;
    if (attending === "yes") {
      stats.yes += 1;
      stats.guests += Number(row[1]) || 0;
    } else if (attending === "no") {
      stats.no += 1;
    }
    return stats;
  }, { total: 0, yes: 0, no: 0, guests: 0 });
}

function updateSummary(summary, weddingSheet, homecomingSheet, nowText) {
  const wedding = calculateStats(weddingSheet);
  const homecoming = calculateStats(homecomingSheet);
  const rows = [
    ["JANITH & PRADEEPA RSVP SUMMARY", ""],
    ["", ""],
    ["WEDDING", ""],
    ["Total Responses", wedding.total],
    ["Attending Yes", wedding.yes],
    ["Attending No", wedding.no],
    ["Expected Guest Count", wedding.guests],
    ["", ""],
    ["HOMECOMING", ""],
    ["Total Responses", homecoming.total],
    ["Attending Yes", homecoming.yes],
    ["Attending No", homecoming.no],
    ["Expected Guest Count", homecoming.guests],
    ["", ""],
    ["Last Updated", nowText],
  ];

  summary.getRange("A1:B1").breakApart();
  summary.clear();
  summary.getRange(1, 1, rows.length, 2).setValues(rows);
  summary.getRange("A1:B1").merge().setBackground("#7a1830").setFontColor("#fffaf0").setFontWeight("bold");
  summary.getRange("A3:B3").setBackground("#ead8a7").setFontWeight("bold");
  summary.getRange("A9:B9").setBackground("#ead8a7").setFontWeight("bold");
  summary.getRange("A15:B15").setFontWeight("bold");
  summary.setColumnWidth(1, 190);
  summary.setColumnWidth(2, 190);
}

function buildEmail(data, updated, submittedAt) {
  const eventName = data.event === "wedding" ? "Wedding" : "Homecoming";
  const responseType = updated ? "Updated RSVP" : "New RSVP";
  const attendance = data.attending === "yes" ? "Yes" : "No";
  const subjectPrefix = updated ? "✏️ Updated" : data.event === "wedding" ? "💍 New" : "❤️ New";
  const subject = subjectPrefix + " " + eventName + " RSVP — " + data.fullName;
  const message = data.message || "—";
  const plainText = [
    "Janith & Pradeepa",
    "RSVP Notification",
    "",
    "Event: " + eventName,
    "Response Type: " + responseType,
    "Full Name: " + data.fullName,
    "Phone Number: " + data.phoneNumber,
    "Attendance: " + attendance,
    "Number of Guests: " + data.numberOfGuests,
    "Message: " + message,
    "Submitted: " + submittedAt,
  ].join("\n");

  const background = data.event === "wedding" ? "#f8f1e3" : "#3b0b18";
  const card = data.event === "wedding" ? "#fffaf0" : "#fff7e8";
  const heading = "#7a1830";
  const escapedName = escapeHtml(data.fullName);
  const htmlBody = [
    '<div style="margin:0;padding:24px 12px;background:' + background + ';font-family:Georgia,serif;color:#3f3027">',
    '<div style="max-width:560px;margin:0 auto;background:' + card + ';border:1px solid #c9a553;border-radius:18px;overflow:hidden">',
    '<div style="padding:24px;text-align:center;background:' + heading + ';color:#fffaf0">',
    '<div style="font-size:12px;letter-spacing:3px">JANITH &amp; PRADEEPA</div>',
    '<h1 style="margin:10px 0 0;font-size:25px">' + escapeHtml(responseType + " — " + eventName) + '</h1>',
    '</div>',
    '<div style="padding:26px">',
    '<h2 style="margin:0 0 20px;color:' + heading + ';font-size:23px">' + escapedName + '</h2>',
    '<table role="presentation" style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">',
    emailRow("Event", eventName),
    emailRow("Response Type", responseType),
    emailRow("Attendance", attendance),
    emailRow("Guests", data.numberOfGuests),
    emailRow("Phone", data.phoneNumber),
    emailRow("Message", message),
    emailRow("Submitted", submittedAt),
    '</table>',
    '</div></div></div>',
  ].join("");

  return { subject: subject, body: plainText, htmlBody: htmlBody };
}

function emailRow(label, value) {
  return '<tr><td style="padding:10px 10px 10px 0;border-bottom:1px solid #eadfca;color:#765f4b;font-weight:bold;vertical-align:top;width:38%">'
    + escapeHtml(label)
    + '</td><td style="padding:10px 0;border-bottom:1px solid #eadfca;vertical-align:top;white-space:pre-wrap">'
    + escapeHtml(value)
    + "</td></tr>";
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: "Missing request body." });
    }

    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (error) {
      return jsonResponse({ success: false, error: "Invalid JSON." });
    }

    const data = validatePayload(payload);
    const properties = PropertiesService.getScriptProperties();

    const now = new Date();
    const nowText = Utilities.formatDate(now, TIMEZONE, "yyyy-MM-dd HH:mm:ss");
    const submittedAt = Utilities.formatDate(now, TIMEZONE, "d MMMM yyyy, hh:mm a");
    const lock = LockService.getScriptLock();
    let updated = false;

    lock.waitLock(10000);
    try {
      const spreadsheet = getRsvpSpreadsheet(properties);
      const sheets = ensureSheets(spreadsheet);
      const responseSheet = sheets[data.event];
      const existingRow = findResponseRow(responseSheet, data.phoneNumber);
      const originalTimestamp = existingRow > 0
        ? responseSheet.getRange(existingRow, 1).getDisplayValue() || nowText
        : nowText;
      const rowValues = [
        originalTimestamp,
        nowText,
        safeCell(data.fullName),
        safeCell(data.phoneNumber),
        data.attending === "yes" ? "Yes" : "No",
        data.numberOfGuests,
        safeCell(data.message),
      ];

      if (existingRow > 0) {
        responseSheet.getRange(existingRow, 1, 1, RESPONSE_HEADERS.length).setValues([rowValues]);
        updated = true;
      } else {
        responseSheet.appendRow(rowValues);
      }

      try {
        updateSummary(sheets.summary, sheets.wedding, sheets.homecoming, nowText);
      } catch (summaryError) {
        console.error("RSVP saved, but Summary could not be refreshed.", summaryError);
      }
    } finally {
      lock.releaseLock();
    }

    storeRsvpReceipt(data.requestId, {
      saved: true,
      updated: updated,
      notificationSent: false,
    });

    let notificationSent = false;
    const notificationEmail = cleanText(properties.getProperty("RSVP_NOTIFICATION_EMAIL"));
    if (!notificationEmail) {
      console.error("RSVP saved, but RSVP_NOTIFICATION_EMAIL is not configured.");
    } else {
      try {
        const email = buildEmail(data, updated, submittedAt);
        MailApp.sendEmail({
          to: notificationEmail,
          subject: email.subject,
          body: email.body,
          htmlBody: email.htmlBody,
          name: "Janith & Pradeepa RSVP",
        });
        notificationSent = true;
      } catch (emailError) {
        console.error("RSVP saved, but the notification email could not be sent.", emailError);
      }
    }

    storeRsvpReceipt(data.requestId, {
      saved: true,
      updated: updated,
      notificationSent: notificationSent,
    });

    return jsonResponse({
      success: true,
      updated: updated,
      notificationSent: notificationSent,
    });
  } catch (error) {
    console.error("Unable to save RSVP.", error);
    return jsonResponse({ success: false, error: "Unable to save RSVP." });
  }
}
