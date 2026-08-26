"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { placeOrder as placeOrderOnServer } from "./order-actions";
import type {
  CartLine,
  CustomerDetails,
  OrderMode,
  PickupDetails,
  MenuItem,
  OrderStage,
  WaiterRequest,
} from "./types";

/* How long the guest must wait before calling a waiter again. */
export const WAITER_COOLDOWN_MS = 60_000;

/* MySQL has no realtime, so the phone asks. Four seconds reads as instant
   to someone sitting at a table, and costs one tiny query per guest. */
const POLL_MS = 4000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * An order this phone has already sent. Kept on the device rather than behind
 * a login: someone ordering lunch will not make an account, but they will
 * happily tap "same again" next week.
 */
export type PastOrder = {
  code: string;
  orderDbId: string;
  placedAt: number;
  mode: OrderMode;
  tableNumber: string | null;
  lines: CartLine[];
  total: number;
  stage?: OrderStage;
};

export type CheckoutVisit = {
  id: string;
  checkedOutAt: number;
  mode: OrderMode;
  tableNumber: string | null;
  lines: CartLine[];
  total: number;
  ticketCodes: string[];
};

type State = {
  hydrated: boolean;
  lines: CartLine[];
  stage: OrderStage | null;
  orderId: string | null;
  placedLines: CartLine[];
  waiterCalledAt: number | null;
  waiterReason: WaiterRequest | null;
  /** Row id of the live order, used to poll its stage. */
  orderDbId: string | null;
  /** Offer the guest applied, re-checked server-side when sending. */
  offer: { code: string; label: string; discount: number } | null;
  /** Anonymous id for this phone, so it can see its own order after a refresh. */
  sessionId: string;
  /** How many people are eating — drives portioning and per-head reporting. */
  guests: number;
  /** Optional: the guest may leave a name/phone after ordering, never before. */
  customer: CustomerDetails | null;
  /** Null until the opening popup is answered. */
  mode: OrderMode | null;
  /** Which table they picked, when dining in from a shared QR. */
  tableToken: string | null;
  /** Set for collection only, before they start browsing. */
  pickup: PickupDetails | null;
  /** Every completed checkout visit on this phone, newest first. */
  history: CheckoutVisit[];
  /**
   * Every ticket still on this table's open bill, newest first. A ticket stays
   * here even after it has been served; only checkout archives it.
   */
  activeOrders: PastOrder[];
  /** Set when anything in the basket came from a past order. */
  fromRepeat: boolean;
};

type Action =
  | { type: "hydrate"; payload: Partial<State> }
  | { type: "add"; item: MenuItem; optionIds: string[] }
  | { type: "inc"; lineId: string }
  | { type: "dec"; lineId: string }
  | { type: "remove"; lineId: string }
  | { type: "note"; lineId: string; note: string }
  | { type: "clear" }
  | { type: "place"; orderId: string; orderDbId: string; tableNumber: string | null }
  | {
      type: "placeDirectHistoryOrder";
      orderId: string;
      orderDbId: string;
      tableNumber: string | null;
      lines: CartLine[];
      total: number;
    }
  | { type: "reorder"; lines: CartLine[] }
  | { type: "session"; sessionId: string }
  | { type: "offer"; offer: { code: string; label: string; discount: number } | null }
  | { type: "stage"; stage: OrderStage }
  | { type: "resetOrder" }
  | { type: "checkout" }
  | { type: "callWaiter"; reason: WaiterRequest; at: number }
  | { type: "clearWaiter" }
  | { type: "guests"; count: number }
  | { type: "customer"; details: CustomerDetails | null }
  | {
      type: "mode";
      mode: OrderMode;
      tableToken: string | null;
      pickup: PickupDetails | null;
    }
  | { type: "resetMode" }
  | { type: "updateHistoryStage"; orderDbId: string; stage: OrderStage };

const EMPTY: State = {
  hydrated: false,
  lines: [],
  stage: null,
  orderId: null,
  placedLines: [],
  waiterCalledAt: null,
  waiterReason: null,
  orderDbId: null,
  offer: null,
  sessionId: "",
  guests: 2,
  customer: null,
  mode: null,
  tableToken: null,
  pickup: null,
  history: [],
  activeOrders: [],
  fromRepeat: false,
};

/** Same dish with different options must stay a separate line. */
function makeLineId(itemId: string, optionIds: string[]) {
  return optionIds.length ? `${itemId}|${[...optionIds].sort().join(",")}` : itemId;
}

function buildLine(item: MenuItem, optionIds: string[]): CartLine {
  const chosen = (item.options ?? []).flatMap((group) =>
    group.choices.filter((c) => optionIds.includes(c.id)),
  );
  return {
    lineId: makeLineId(item.id, optionIds),
    itemId: item.id,
    name: item.name,
    diet: item.diet,
    unitPrice: item.price + chosen.reduce((sum, c) => sum + c.priceDelta, 0),
    qty: 1,
    optionIds: chosen.map((c) => c.id),
    optionLabels: chosen.map((c) => c.label),
  };
}

function latestOrderFields(orders: PastOrder[]) {
  const latest = orders[0];
  return latest
    ? {
        stage: latest.stage ?? "placed",
        orderId: latest.code,
        orderDbId: latest.orderDbId,
        placedLines: latest.lines,
      }
    : {
        stage: null,
        orderId: null,
        orderDbId: null,
        placedLines: [],
      };
}

function uniqueOrders(orders: PastOrder[]) {
  const seen = new Set<string>();
  return orders.filter((order) => {
    const key = order.orderDbId || `${order.code}-${order.placedAt}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      {
        const saved = action.payload;
        /* Previous versions put every ticket straight into `history`. Those
           tickets were still part of the table's live bill, so move them into
           the new open-session list once, without losing anything. */
        const legacyLive =
          saved.orderDbId && saved.orderId
            ? [
                {
                  code: saved.orderId,
                  orderDbId: saved.orderDbId,
                  placedAt: Date.now(),
                  mode: saved.mode ?? "dinein",
                  tableNumber: saved.tableToken ?? null,
                  lines: saved.placedLines ?? [],
                  total: (saved.placedLines ?? []).reduce(
                    (sum, line) => sum + line.qty * line.unitPrice,
                    0,
                  ),
                  stage: saved.stage ?? "placed",
                },
              ]
            : [];
        const hasOpenSession = Array.isArray(saved.activeOrders);
        const activeOrders = uniqueOrders([
          ...(hasOpenSession ? saved.activeOrders ?? [] : []),
          ...legacyLive,
        ]);
        const rawHistory = saved.history ?? [];
        const now = Date.now();
        const history: CheckoutVisit[] = rawHistory
          .map((item: any, idx: number) => {
            if (item && item.lines && Array.isArray(item.lines)) {
              return item as CheckoutVisit;
            }
            if (item && item.orders && Array.isArray(item.orders)) {
              const orders = item.orders as PastOrder[];
              return {
                id: item.id || `visit-${idx}`,
                checkedOutAt: item.checkedOutAt || Date.now(),
                mode: item.mode || "dinein",
                tableNumber: item.tableNumber || null,
                lines: orders.flatMap((o) => o.lines),
                total: item.total || orders.reduce((sum, o) => sum + o.total, 0),
                ticketCodes: orders.map((o) => o.code),
              };
            }
            const single = item as PastOrder;
            return {
              id: `visit-${single.orderDbId || single.code || idx}`,
              checkedOutAt: single.placedAt || Date.now(),
              mode: single.mode || "dinein",
              tableNumber: single.tableNumber || null,
              lines: single.lines || [],
              total: single.total || 0,
              ticketCodes: single.code ? [single.code] : [],
            };
          })
          .filter((visit) => now - visit.checkedOutAt < THIRTY_DAYS_MS);
        return {
          ...state,
          ...saved,
          history,
          activeOrders,
          ...latestOrderFields(activeOrders),
          hydrated: true,
        };
      }

    case "add": {
      const line = buildLine(action.item, action.optionIds);
      const existing = state.lines.find((l) => l.lineId === line.lineId);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.lineId === line.lineId ? { ...l, qty: l.qty + 1 } : l,
          ),
        };
      }
      return { ...state, lines: [...state.lines, line] };
    }

    case "inc":
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.lineId === action.lineId ? { ...l, qty: Math.min(l.qty + 1, 20) } : l,
        ),
      };

    case "dec":
      return {
        ...state,
        lines: state.lines.flatMap((l) => {
          if (l.lineId !== action.lineId) return [l];
          return l.qty <= 1 ? [] : [{ ...l, qty: l.qty - 1 }];
        }),
      };

    case "remove":
      return { ...state, lines: state.lines.filter((l) => l.lineId !== action.lineId) };

    case "note":
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.lineId === action.lineId ? { ...l, note: action.note } : l,
        ),
      };

    case "clear":
      return { ...state, lines: [], offer: null };

    case "place": {
      if (state.lines.length === 0) return state;
      const past: PastOrder = {
        code: action.orderId,
        orderDbId: action.orderDbId,
        placedAt: Date.now(),
        mode: state.mode ?? "dinein",
        tableNumber: action.tableNumber,
        lines: state.lines,
        total: state.lines.reduce((n, l) => n + l.qty * l.unitPrice, 0),
        stage: "placed",
      };
      return {
        ...state,
        /* A kitchen ticket belongs to the current table session until the
           guest checks out. It is not order history merely because it has
           been served. */
        activeOrders: [past, ...state.activeOrders],
        ...latestOrderFields([past, ...state.activeOrders]),
        lines: [],
        offer: null,
        fromRepeat: false,
      };
    }

    case "placeDirectHistoryOrder": {
      const past: PastOrder = {
        code: action.orderId,
        orderDbId: action.orderDbId,
        placedAt: Date.now(),
        mode: state.mode ?? "dinein",
        tableNumber: action.tableNumber,
        lines: action.lines,
        total: action.total,
        stage: "placed",
      };
      return {
        ...state,
        activeOrders: [past, ...state.activeOrders],
        ...latestOrderFields([past, ...state.activeOrders]),
      };
    }

    case "updateHistoryStage":
      {
        const activeOrders = state.activeOrders.map((o) =>
          o.orderDbId === action.orderDbId ? { ...o, stage: action.stage } : o,
        );
        return { ...state, activeOrders, ...latestOrderFields(activeOrders) };
      }

    /* Ordering the same again puts the lines back in the basket rather than
       sending anything — they may want to change the quantity first. */
    case "reorder": {
      const merged = [...state.lines];
      for (const line of action.lines) {
        const found = merged.find((l) => l.lineId === line.lineId);
        if (found) found.qty += line.qty;
        else merged.push({ ...line });
      }
      return { ...state, lines: merged, fromRepeat: true };
    }

    case "session":
      return { ...state, sessionId: action.sessionId };

    case "offer":
      return { ...state, offer: action.offer };

    case "stage":
      if (!state.orderDbId) return state;
      {
        const activeOrders = state.activeOrders.map((order) =>
          order.orderDbId === state.orderDbId
            ? { ...order, stage: action.stage }
            : order,
        );
        return { ...state, activeOrders, ...latestOrderFields(activeOrders) };
      }

    case "resetOrder":
      return {
        ...state,
        activeOrders: [],
        ...latestOrderFields([]),
        customer: null,
      };

    case "checkout": {
      if (state.activeOrders.length === 0) return state;
      const allLines = state.activeOrders.flatMap((order) => order.lines);
      const total = state.activeOrders.reduce((sum, order) => sum + order.total, 0);
      const ticketCodes = state.activeOrders.map((order) => order.code);
      const mode = state.activeOrders[0]?.mode ?? "dinein";
      const tableNumber = state.activeOrders[0]?.tableNumber ?? null;

      const newVisit: CheckoutVisit = {
        id: `checkout-${Date.now()}`,
        checkedOutAt: Date.now(),
        mode,
        tableNumber,
        lines: allLines,
        total,
        ticketCodes,
      };

      return {
        ...state,
        history: [newVisit, ...state.history].slice(0, 20),
        activeOrders: [],
        ...latestOrderFields([]),
        customer: null,
        fromRepeat: false,
      };
    }

    case "callWaiter":
      return { ...state, waiterCalledAt: action.at, waiterReason: action.reason };

    case "clearWaiter":
      return { ...state, waiterCalledAt: null, waiterReason: null };

    case "guests":
      return { ...state, guests: Math.min(Math.max(action.count, 1), 30) };

    case "customer":
      return { ...state, customer: action.details };

    case "mode":
      return {
        ...state,
        mode: action.mode,
        tableToken: action.tableToken,
        pickup: action.pickup,
      };

    /* Switching between eating in and collecting re-opens the popup. The
       basket survives — they may have picked dishes first. */
    case "resetMode":
      return { ...state, mode: null, pickup: null };

    default:
      return state;
  }
}

type CartApi = {
  state: State;
  add: (item: MenuItem, optionIds?: string[]) => void;
  inc: (lineId: string) => void;
  dec: (lineId: string) => void;
  remove: (lineId: string) => void;
  setNote: (lineId: string, note: string) => void;
  clear: () => void;
  placeOrder: () => Promise<
    { ok: true; code: string } | { ok: false; message: string }
  >;
  resetOrder: () => void;
  checkout: () => void;
  callWaiter: (reason: WaiterRequest) => void;
  clearWaiter: () => void;
  applyOffer: (offer: { code: string; label: string; discount: number }) => void;
  clearOffer: () => void;
  setGuests: (count: number) => void;
  setCustomer: (details: CustomerDetails | null) => void;
  setMode: (
    mode: OrderMode,
    tableToken: string | null,
    pickup: PickupDetails | null,
  ) => void;
  resetMode: () => void;
  reorder: (lines: CartLine[]) => void;
  reorderDirect: (
    lines: CartLine[],
  ) => Promise<{ ok: true; code: string } | { ok: false; message: string }>;
  qtyOf: (itemId: string) => number;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({
  storageKey,
  slug,
  token,
  tableNumber,
  children,
}: {
  storageKey: string;
  slug: string;
  /** Null when the guest is ordering for delivery instead of at a table. */
  token: string | null;
  tableNumber?: string | null;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, EMPTY);

  /* Read persisted state after mount so server and client HTML match. */
  useEffect(() => {
    let payload: Partial<State> = {};
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) payload = JSON.parse(raw) as Partial<State>;
    } catch {
      /* Corrupt or blocked storage should never block the menu. */
    }
    dispatch({ type: "hydrate", payload });
  }, [storageKey]);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          lines: state.lines,
          stage: state.stage,
          orderId: state.orderId,
          placedLines: state.placedLines,
          waiterCalledAt: state.waiterCalledAt,
          waiterReason: state.waiterReason,
          orderDbId: state.orderDbId,
          offer: state.offer,
          sessionId: state.sessionId,
          guests: state.guests,
          customer: state.customer,
          mode: state.mode,
          tableToken: state.tableToken,
          pickup: state.pickup,
          history: state.history,
          activeOrders: state.activeOrders,
          fromRepeat: state.fromRepeat,
        }),
      );
    } catch {
      /* Private mode — the cart simply won't survive a refresh. */
    }
  }, [state, storageKey]);

  /* Give this phone a stable id the first time it opens the menu. */
  useEffect(() => {
    if (!state.hydrated || state.sessionId) return;
    const id =
      globalThis.crypto?.randomUUID?.() ??
      `s-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    dispatch({ type: "session", sessionId: id });
  }, [state.hydrated, state.sessionId]);

  /* Ask the kitchen where every ticket on the open table bill has got to. */
  useEffect(() => {
    if (!state.hydrated) return;

    const idsToPoll = new Set<string>();
    for (const o of state.activeOrders) {
      if (o.orderDbId && o.stage !== "served") {
        idsToPoll.add(o.orderDbId);
      }
    }

    if (idsToPoll.size === 0) return;

    let cancelled = false;
    const tick = async () => {
      for (const id of idsToPoll) {
        try {
          const response = await fetch(`/api/order/${id}`, { cache: "no-store" });
          if (!response.ok || cancelled) continue;
          const body = (await response.json()) as { stage?: OrderStage };
          if (body.stage) {
            dispatch({ type: "updateHistoryStage", orderDbId: id, stage: body.stage });
          }
        } catch {
          /* Offline for a moment — the next tick picks it up. */
        }
      }
    };

    const timer = window.setInterval(tick, POLL_MS);
    void tick();
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [state.activeOrders, state.hydrated]);

  const add = useCallback(
    (item: MenuItem, optionIds: string[] = []) =>
      dispatch({ type: "add", item, optionIds }),
    [],
  );
  const inc = useCallback((lineId: string) => dispatch({ type: "inc", lineId }), []);
  const dec = useCallback((lineId: string) => dispatch({ type: "dec", lineId }), []);
  const remove = useCallback(
    (lineId: string) => dispatch({ type: "remove", lineId }),
    [],
  );
  const setNote = useCallback(
    (lineId: string, note: string) => dispatch({ type: "note", lineId, note }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const resetOrder = useCallback(() => dispatch({ type: "resetOrder" }), []);
  const checkout = useCallback(() => dispatch({ type: "checkout" }), []);
  const clearWaiter = useCallback(() => dispatch({ type: "clearWaiter" }), []);
  const applyOffer = useCallback(
    (offer: { code: string; label: string; discount: number }) =>
      dispatch({ type: "offer", offer }),
    [],
  );
  const clearOffer = useCallback(() => dispatch({ type: "offer", offer: null }), []);
  const setGuests = useCallback(
    (count: number) => dispatch({ type: "guests", count }),
    [],
  );
  const setCustomer = useCallback(
    (details: CustomerDetails | null) => dispatch({ type: "customer", details }),
    [],
  );
  const setMode = useCallback(
    (
      mode: OrderMode,
      tableToken: string | null,
      pickup: PickupDetails | null,
    ) => dispatch({ type: "mode", mode, tableToken, pickup }),
    [],
  );
  const resetMode = useCallback(() => dispatch({ type: "resetMode" }), []);
  const reorder = useCallback(
    (lines: CartLine[]) => dispatch({ type: "reorder", lines }),
    [],
  );

  const linesRef = state.lines;
  const guestsRef = state.guests;
  const sessionRef = state.sessionId;
  const offerRef = state.offer;
  const modeRef = state.mode;
  const pickupRef = state.pickup;
  const repeatRef = state.fromRepeat;
  const chosenTable = state.tableToken;

  const reorderDirect = useCallback(
    async (lines: CartLine[]) => {
      if (lines.length === 0) {
        return { ok: false as const, message: "No items to reorder." };
      }
      const mode = modeRef ?? "dinein";
      const result = await placeOrderOnServer({
        slug,
        token: mode === "pickup" ? null : (token ?? chosenTable),
        sessionId: sessionRef,
        guests: guestsRef,
        lines: lines.map((line) => ({
          itemId: line.itemId,
          qty: line.qty,
          optionIds: line.optionIds,
        })),
        pickup: mode === "pickup" && pickupRef ? pickupRef : undefined,
        isRepeat: true,
      });

      if (!result.ok) return result;

      const total = lines.reduce((n, l) => n + l.qty * l.unitPrice, 0);
      dispatch({
        type: "placeDirectHistoryOrder",
        orderId: result.code,
        orderDbId: result.orderId,
        tableNumber: tableNumber ?? chosenTable ?? null,
        lines,
        total,
      });

      return { ok: true as const, code: result.code };
    },
    [
      modeRef,
      token,
      tableNumber,
      chosenTable,
      sessionRef,
      guestsRef,
      pickupRef,
      slug,
    ],
  );

  const placeOrder = useCallback(async () => {
    if (linesRef.length === 0) {
      return { ok: false as const, message: "Your order is empty." };
    }
    if (!modeRef) {
      return { ok: false as const, message: "Tell us how you're ordering first." };
    }

    const result = await placeOrderOnServer({
      slug,
      /* The printed table code wins; otherwise the table they picked in the
         popup. Delivery sends neither. */
      token: modeRef === "pickup" ? null : (token ?? chosenTable),
      sessionId: sessionRef,
      guests: guestsRef,
      lines: linesRef.map((line) => ({
        itemId: line.itemId,
        qty: line.qty,
        optionIds: line.optionIds,
      })),
      offerCode: offerRef?.code,
      pickup: modeRef === "pickup" && pickupRef ? pickupRef : undefined,
      isRepeat: repeatRef,
    });

    if (!result.ok) return result;

    dispatch({
      type: "place",
      orderId: result.code,
      orderDbId: result.orderId,
      tableNumber: tableNumber ?? chosenTable ?? null,
    });
    return { ok: true as const, code: result.code };
  }, [
    linesRef,
    guestsRef,
    sessionRef,
    offerRef,
    modeRef,
    pickupRef,
    repeatRef,
    chosenTable,
    slug,
    token,
    tableNumber,
  ]);

  const callWaiter = useCallback(
    (reason: WaiterRequest) =>
      dispatch({ type: "callWaiter", reason, at: Date.now() }),
    [],
  );

  const value = useMemo<CartApi>(() => {
    const count = state.lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = state.lines.reduce((n, l) => n + l.qty * l.unitPrice, 0);
    return {
      state,
      add,
      inc,
      dec,
      remove,
      setNote,
      clear,
      placeOrder,
      resetOrder,
      checkout,
      callWaiter,
      clearWaiter,
      applyOffer,
      clearOffer,
      setGuests,
      setCustomer,
      setMode,
      resetMode,
      reorder,
      reorderDirect,
      count,
      subtotal,
      qtyOf: (itemId: string) =>
        state.lines
          .filter((l) => l.itemId === itemId)
          .reduce((n, l) => n + l.qty, 0),
    };
  }, [
    state,
    add,
    inc,
    dec,
    remove,
    setNote,
    clear,
    placeOrder,
    resetOrder,
    checkout,
    callWaiter,
    clearWaiter,
    applyOffer,
    clearOffer,
    setGuests,
    setCustomer,
    setMode,
    resetMode,
    reorder,
    reorderDirect,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export function billFor(subtotal: number, gstPercent: number, discount = 0) {
  /* Tax follows the discounted amount, which is how a bill actually works. */
  const taxable = Math.max(0, subtotal - discount);
  const gst = Math.round((taxable * gstPercent) / 100);
  return { subtotal, discount, gst, total: taxable + gst };
}
