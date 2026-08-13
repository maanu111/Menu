import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const REASONS = new Set(["water", "cutlery", "napkins", "bill", "assistance"]);

/**
 * One open call per table at a time — a guest tapping twice shouldn't put two
 * rows in front of the floor, and the cooldown on the phone backs this up.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
    token?: string;
    reason?: string;
    sessionId?: string;
  };

  if (!body.slug || !body.token) {
    return NextResponse.json({ message: "Missing table." }, { status: 400 });
  }

  const table = await db.restaurantTable.findUnique({
    where: { qrToken: body.token.toUpperCase() },
    select: {
      id: true,
      restaurantId: true,
      isActive: true,
      restaurant: { select: { slug: true } },
    },
  });

  if (!table || table.restaurant.slug !== body.slug || !table.isActive) {
    return NextResponse.json({ message: "Unknown table." }, { status: 404 });
  }

  const reason = REASONS.has(body.reason ?? "")
    ? (body.reason as string)
    : "assistance";

  const open = await db.waiterCall.findFirst({
    where: { tableId: table.id, acknowledgedAt: null },
    select: { id: true },
  });

  if (open) {
    await db.waiterCall.update({ where: { id: open.id }, data: { reason } });
    return NextResponse.json({ ok: true, merged: true });
  }

  await db.waiterCall.create({
    data: {
      restaurantId: table.restaurantId,
      tableId: table.id,
      reason,
      sessionId: body.sessionId ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
