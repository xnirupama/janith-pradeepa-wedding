import { NextResponse } from "next/server";

const HEALTH_TIMEOUT_MS = 5000;

function getConfiguredUrl() {
  try {
    const url = new URL(process.env.RSVP_GOOGLE_SCRIPT_URL);
    return url.protocol === "https:"
      && url.hostname === "script.google.com"
      && url.pathname.endsWith("/exec")
      ? url
      : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const configuredUrl = getConfiguredUrl();
  if (!configuredUrl) {
    return NextResponse.json(
      { configured: false, upstreamReachable: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  let upstreamReachable = false;

  try {
    const response = await fetch(configuredUrl.toString(), {
      cache: "no-store",
      signal: controller.signal,
    });
    upstreamReachable = response.ok;
  } catch {
    upstreamReachable = false;
  } finally {
    clearTimeout(timeout);
  }

  return NextResponse.json(
    { configured: true, upstreamReachable },
    { headers: { "Cache-Control": "no-store" } },
  );
}
