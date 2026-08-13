import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const STAGE: Record<string, string> = {
  PLACED: "placed",
  ACCEPTED: "accepted",
  PREPARING: "preparing",
  READY: "ready",
  SERVED: "served",
  CANCELLED: "cancelled",
};

/**
 * Polled by the guest's phone every few seconds. MySQL has no realtime, and
 * a four-second delay is invisible to someone sitting at a table.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    select: { stage: true, code: true, totalPaise: true },
  });

  if (!order) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      stage: STAGE[order.stage] ?? "placed",
      code: order.code,
      totalPaise: order.totalPaise,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
