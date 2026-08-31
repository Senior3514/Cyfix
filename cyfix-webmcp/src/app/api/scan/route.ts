import { NextRequest, NextResponse } from "next/server";
import { runPassiveScan, ScanUnreachableError } from "@/lib/scanner";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizeDomain } from "@/lib/utils";

export const runtime = "nodejs";
// A passive scan makes a handful of outbound requests; give it room on
// serverless hosts whose default function timeout is a few seconds.
export const maxDuration = 60;

const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 5);

function clientKey(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.domain !== "string") {
    return NextResponse.json({ error: "A domain is required." }, { status: 400 });
  }

  if (body.authorized !== true) {
    return NextResponse.json(
      { error: "Authorization is required. Confirm you are authorized to test this domain before scanning." },
      { status: 400 },
    );
  }

  const domain = normalizeDomain(body.domain);
  if (!domain) {
    return NextResponse.json(
      { error: "Enter a valid public domain (e.g. example.com). Local/IP addresses are not supported." },
      { status: 400 },
    );
  }

  const { allowed, resetAt } = checkRateLimit(clientKey(req), RATE_LIMIT_MAX);
  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: `Rate limit reached. Try again in ${retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  try {
    const result = await runPassiveScan(domain);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ScanUnreachableError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Scan failed unexpectedly. Please try again." }, { status: 500 });
  }
}
