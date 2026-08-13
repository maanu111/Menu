import { NextResponse } from "next/server";
import { logScan } from "@/lib/menu-queries";

/**
 * Fired once per session from the guest's phone. Doing it here rather than in
 * the page render keeps server re-renders from inflating the scan count.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
    token?: string;
    sessionId?: string;
  };

  if (!body.slug || !body.token || !body.sessionId) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  try {
    await logScan(body.slug, body.token, body.sessionId);
  } catch {
    /* A missed scan count must never break the menu. */
  }

  return NextResponse.json({ ok: true });
}
