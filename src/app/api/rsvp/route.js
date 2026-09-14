import { NextResponse } from "next/server";
import { validateRsvp } from "@/lib/validation";

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Please submit valid RSVP details." }, { status: 400 });
  }

  const { data, errors } = validateRsvp(payload);
  if (Object.keys(errors).length) {
    return NextResponse.json({ success: false, error: "Please check the highlighted details and try again.", errors }, { status: 400 });
  }

  const scriptUrl = process.env.RSVP_GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    return NextResponse.json(
      { success: false, error: "RSVP submissions are not configured yet. Please contact the couple directly." },
      { status: 503 },
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) throw new Error("Upstream RSVP service rejected the request.");
    return NextResponse.json({ success: true, message: "Your RSVP has been received with love. Thank you!" });
  } catch {
    return NextResponse.json({ success: false, error: "We could not save your RSVP just now. Please try again in a moment." }, { status: 502 });
  }
}
