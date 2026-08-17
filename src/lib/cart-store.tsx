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
  /** Every order this phone has sent, newest first. */
  history: PastOrder[];
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

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.payload, hydrated: true };

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
        /* Newest first, and capped: a phone that eats here every week should
           not carry a year of receipts around. */
        history: [past, ...state.history].slice(0, 25),
        /* Everyone watches their ticket move, in the room or not: a guest
           waiting to collect wants to know when to walk over. */
        stage: "placed",
        orderId: action.orderId,
        orderDbId: action.orderDbId,
        placedLines: state.lines,
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
        history: [past, ...state.history].slice(0, 25),
      };
    }

    case "updateHistoryStage":
      return {
        ...state,
        history: state.history.map((o) =>
          o.orderDbId === action.orderDbId ? { ...o, stage: action.stage } : o,
        ),
      };

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
      return state.stage ? { ...state, stage: action.stage } : state;

    case "resetOrder":
      return {
        ...state,
        stage: null,
        orderId: null,
        orderDbId: null,
        placedLines: [],
        customer: null,
      };

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
  children,
}: {
  storageKey: string;
  slug: string;
  /** Null when the guest is ordering for delivery instead of at a table. */
  token: string | null;
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

  /* Ask the kitchen where active orders have got to, until served. */
  useEffect(() => {
    if (!state.hydrated) return;

    const idsToPoll = new Set<string>();
    if (state.orderDbId && state.stage !== "served") {
      idsToPoll.add(state.orderDbId);
    }
    for (const o of state.history) {
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
            if (id === state.orderDbId && body.stage !== state.stage) {
              dispatch({ type: "stage", stage: body.stage });
            }
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
  }, [state.orderDbId, state.stage, state.history, state.hydrated]);

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
        tableNumber: chosenTable ?? token ?? null,
        lines,
        total,
      });

      if (!state.orderDbId || state.stage === "served") {
        dispatch({
          type: "place",
          orderId: result.code,
          orderDbId: result.orderId,
          tableNumber: chosenTable ?? token ?? null,
        });
      }

      return { ok: true as const, code: result.code };
    },
    [
      modeRef,
      token,
      chosenTable,
      sessionRef,
      guestsRef,
      pickupRef,
      slug,
      state.orderDbId,
      state.stage,
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
      tableNumber: chosenTable ?? token ?? null,
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
