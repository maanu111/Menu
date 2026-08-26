"use server";

import { db } from "./db";

/** Who is collecting, and the number to ring when it is ready. */
export type PickupDetails = {
  name: string;
  phone: string;
};

export type PlaceOrderInput = {
  slug: string;
  /** The table's printed code. Null when the guest is collecting. */
  token: string | null;
  sessionId: string;
  guests: number;
  lines: { itemId: string; qty: number; optionIds: string[] }[];
  offerCode?: string;
  /** Present only for collection, and then both parts are required. */
  pickup?: PickupDetails;
  /** The guest built this from a past order rather than from the menu. */
  isRepeat?: boolean;
};

/* Indian mobile numbers, however the guest types them. */
function cleanPhone(value: string) {
  return value.replace(/[^0-9]/g, "").replace(/^(0|91)(?=\d{10}$)/, "");
}

/**
 * Works out what a code is worth against a given subtotal. Read live from the
 * database, so pausing an offer in the dashboard stops it on the next tap —
 * a guest who typed it a minute ago does not get a stale discount.
 */
export async function checkOffer(
  slug: string,
  code: string,
  subtotalPaise: number,
) {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { ok: false as const, message: "Enter a code." };

  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!restaurant) return { ok: false as const, message: "Unknown restaurant." };

  const offer = await db.offer.findFirst({
    where: { restaurantId: restaurant.id, code: trimmed },
  });

  if (!offer || !offer.isActive) {
    return { ok: false as const, message: "That code isn't valid." };
  }

  const now = new Date();
  if (offer.startsAt && offer.startsAt > now) {
    return { ok: false as const, message: "That code isn't live yet." };
  }
  if (offer.endsAt && offer.endsAt < now) {
    return { ok: false as const, message: "That code has expired." };
  }
  if (subtotalPaise < offer.minSpendPaise) {
    const short = (offer.minSpendPaise - subtotalPaise) / 100;
    return {
      ok: false as const,
      message: `Spend ₹${Math.ceil(short)} more to use ${trimmed}.`,
    };
  }

  const discount =
    offer.kind === "PERCENT"
      ? Math.round((subtotalPaise * offer.value) / 100)
      : Math.min(offer.value, subtotalPaise);

  return {
    ok: true as const,
    code: trimmed,
    discountPaise: discount,
    label:
      offer.kind === "PERCENT"
        ? `${offer.value}% off`
        : `₹${Math.round(offer.value / 100)} off`,
  };
}

/** Daily sequential code starting with C (C-001, C-002...) restarting each day per restaurant */
async function nextCode(restaurantId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayCount = await db.order.count({
    where: {
      restaurantId,
      placedAt: { gte: startOfDay, lte: endOfDay },
    },
  });

  let num = todayCount + 1;
  let code = `C-${String(num).padStart(3, "0")}`;

  while (
    await db.order.findFirst({
      where: { restaurantId, code },
      select: { id: true },
    })
  ) {
    num++;
    code = `C-${String(num).padStart(3, "0")}`;
  }

  return code;
}

/**
 * Prices are re-read from the database here. Whatever the phone thinks a
 * dish costs is a display detail; the bill is built server-side.
 */
export async function placeOrder(input: PlaceOrderInput) {
  const forPickup = Boolean(input.pickup);

  const restaurant = await db.restaurant.findUnique({
    where: { slug: input.slug },
    select: {
      id: true,
      gstPercent: true,
      isOpen: true,
      autoAccept: true,
      acceptsPickup: true,
      pickupMinPaise: true,
    },
  });
  if (!restaurant) {
    return { ok: false as const, message: "This restaurant isn't taking orders." };
  }
  if (!restaurant.isOpen) {
    return { ok: false as const, message: "This restaurant is currently closed." };
  }

  /* A table order needs a live table; a delivery order needs none. Either way
     the destination is settled before a single price is read. */
  let tableId: string | null = null;
  let pickup: PickupDetails | null = null;

  if (forPickup) {
    if (!restaurant.acceptsPickup) {
      return {
        ok: false as const,
        message: "This restaurant isn't taking pickup orders right now.",
      };
    }

    const name = (input.pickup!.name ?? "").trim();
    const phone = cleanPhone(input.pickup!.phone ?? "");

    if (name.length < 2) {
      return { ok: false as const, field: "name", message: "Add a name for the order." };
    }
    if (phone.length !== 10) {
      return {
        ok: false as const,
        field: "phone",
        message: "Enter a 10-digit mobile number so they can reach you.",
      };
    }

    pickup = { name: name.slice(0, 80), phone };
  } else {
    const table = await db.restaurantTable.findUnique({
      where: { qrToken: (input.token ?? "").toUpperCase() },
      select: { id: true, isActive: true, restaurantId: true },
    });

    if (!table || table.restaurantId !== restaurant.id || !table.isActive) {
      return { ok: false as const, message: "This table isn't taking orders." };
    }
    tableId = table.id;
  }

  const lines = input.lines.filter((l) => l.qty > 0);
  if (lines.length === 0) {
    return { ok: false as const, message: "Your order is empty." };
  }

  const items = await db.menuItem.findMany({
    where: {
      id: { in: lines.map((l) => l.itemId) },
      restaurantId: restaurant.id,
    },
    include: { optionGroups: { include: { choices: true } } },
  });

  const soldOut = items.find((i) => !i.isAvailable);
  if (soldOut) {
    return {
      ok: false as const,
      message: `${soldOut.name} just sold out — please remove it.`,
    };
  }
  if (items.length !== new Set(lines.map((l) => l.itemId)).size) {
    return { ok: false as const, message: "Something on your order is no longer served." };
  }

  const priced = lines.map((line) => {
    const item = items.find((i) => i.id === line.itemId)!;
    const chosen = item.optionGroups
      .flatMap((g) => g.choices)
      .filter((c) => line.optionIds.includes(c.id));

    const unit =
      item.pricePaise + chosen.reduce((sum, c) => sum + c.priceDeltaPaise, 0);

    return {
      menuItemId: item.id,
      nameSnapshot: item.name,
      unitPricePaise: unit,
      costPaise: item.costPaise,
      qty: line.qty,
      optionLabels: chosen.map((c) => c.label),
    };
  });

  const subtotal = priced.reduce((sum, l) => sum + l.qty * l.unitPricePaise, 0);

  /* Re-checked here, never trusted from the phone: an offer paused between
     applying and sending must not still come off the bill. */
  let discount = 0;
  if (input.offerCode) {
    const offer = await checkOffer(input.slug, input.offerCode, subtotal);
    if (offer.ok) discount = offer.discountPaise;
  }

  if (forPickup && subtotal < restaurant.pickupMinPaise) {
    const short = (restaurant.pickupMinPaise - subtotal) / 100;
    return {
      ok: false as const,
      message: `Pickup orders start at ₹${Math.round(restaurant.pickupMinPaise / 100)} — add ₹${Math.ceil(short)} more.`,
    };
  }

  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round((taxable * restaurant.gstPercent) / 100);

  const order = await db.order.create({
    data: {
      restaurantId: restaurant.id,
      tableId,
      sessionId: input.sessionId,
      code: await nextCode(restaurant.id),
      channel: forPickup ? "PICKUP" : "QR",
      stage: restaurant.autoAccept === false ? "ACCEPTED" : "PLACED",
      guests: forPickup ? 1 : Math.max(1, Math.min(input.guests, 30)),
      customerName: pickup?.name ?? null,
      customerPhone: pickup?.phone ?? null,
      isRepeat: Boolean(input.isRepeat),
      subtotalPaise: subtotal,
      discountPaise: discount,
      taxPaise: tax,
      totalPaise: taxable + tax,
      items: { create: priced },
    },
    select: { id: true, code: true },
  });

  return { ok: true as const, orderId: order.id, code: order.code };
}

/** Called after the order is in — never a condition of placing one. */
export async function attachCustomer(
  orderId: string,
  sessionId: string,
  details: { name: string; phone: string; occasion?: string },
) {
  const updated = await db.order.updateMany({
    where: { id: orderId, sessionId },
    data: {
      customerName: details.name || null,
      customerPhone: details.phone || null,
      occasion: details.occasion || null,
    },
  });

  return updated.count > 0
    ? { ok: true as const }
    : { ok: false as const, message: "Couldn't attach those details." };
}
