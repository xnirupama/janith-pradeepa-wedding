import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { validateRsvp } from "@/lib/validation";

export const maxDuration = 60;

const RSVP_UPSTREAM_TIMEOUT_MS = 45000;
const RSVP_RECEIPT_TIMEOUT_MS = 10000;

async function confirmSavedReceipt(configuredUrl, requestId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RSVP_RECEIPT_TIMEOUT_MS);

  try {
    const response = await fetch(configuredUrl.toString(), {
      cache: "no-store",
      signal: controller.signal,
    });
    const health = await response.json().catch(() => null);
    if (!response.ok || !health?.success || !Array.isArray(health.receipts)) return null;
    return health.receipts.find((receipt) => receipt?.requestId === requestId && receipt.saved === true) || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ success: false, error: "Invalid RSVP request." }, { status: 415 });
  }
  if (contentLength > 5000) {
    return NextResponse.json({ success: false, error: "RSVP request is too large." }, { status: 413 });
  }

  let payload;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 5000) {
      return NextResponse.json({ success: false, error: "RSVP request is too large." }, { status: 413 });
    }
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, error: "Please submit valid RSVP details." }, { status: 400 });
  }

  const { data, errors, spam } = validateRsvp(payload);
  if (spam) {
    return NextResponse.json({ success: true, message: "Your RSVP has been received with love. Thank you!" });
  }
  if (Object.keys(errors).length) {
    return NextResponse.json({ success: false, error: "Please check the highlighted details and try again.", errors }, { status: 400 });
  }

  const scriptUrl = process.env.RSVP_GOOGLE_SCRIPT_URL;
  let configuredUrl;
  try {
    configuredUrl = new URL(scriptUrl);
  } catch {
    configuredUrl = null;
  }
  const isConfigured = configuredUrl
    && configuredUrl.protocol === "https:"
    && configuredUrl.hostname === "script.google.com"
    && configuredUrl.pathname.endsWith("/exec");
  if (!isConfigured) {
    return NextResponse.json(
      { success: false, error: "RSVP submissions are not configured yet. Please contact the couple directly." },
      { status: 503 },
    );
  }

  const requestId = randomUUID();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RSVP_UPSTREAM_TIMEOUT_MS);
  let failureReason = "Apps Script request failed.";
  try {
    const response = await fetch(configuredUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, requestId }),
      cache: "no-store",
      signal: controller.signal,
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      console.error("Apps Script rejected an RSVP request.", {
        status: response.status,
        responseType: result ? "json" : "non-json",
        upstreamError: typeof result?.error === "string" ? result.error : undefined,
      });
      failureReason = `Apps Script returned ${response.status} without a success response.`;
    } else {
      return NextResponse.json({
        success: true,
        updated: result.updated === true,
        notificationSent: result.notificationSent === true,
      });
    }
  } catch (error) {
    failureReason = error instanceof Error && error.name === "AbortError"
      ? "Apps Script request timed out."
      : "Apps Script request failed.";
  } finally {
    clearTimeout(timeout);
  }

  const receipt = await confirmSavedReceipt(configuredUrl, requestId);
  if (receipt) {
    console.info("RSVP success confirmed through its save receipt after the primary response failed.");
    return NextResponse.json({
      success: true,
      updated: receipt.updated === true,
      notificationSent: receipt.notificationSent === true,
      reconciled: true,
    });
  }

  console.error("RSVP forwarding failed.", failureReason);
  return NextResponse.json({ success: false, error: "We could not save your RSVP just now. Please try again in a moment." }, { status: 502 });
}
