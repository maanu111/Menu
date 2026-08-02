"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type { CartLine, MenuItem, OrderStage, WaiterRequest } from "./types";

/* How long the guest must wait before calling a waiter again. */
export const WAITER_COOLDOWN_MS = 60_000;

/* Demo-only: the kitchen advances the order on a timer instead of a socket. */
const STAGE_AFTER: Partial<Record<OrderStage, { next: OrderStage; ms: number }>> = {
  placed: { next: "accepted", ms: 3000 },
  accepted: { next: "preparing", ms: 4000 },
  preparing: { next: "ready", ms: 8000 },
};

type State = {
  hydrated: boolean;
  lines: CartLine[];
  stage: OrderStage | null;
  orderId: string | null;
  placedLines: CartLine[];
  waiterCalledAt: number | null;
  waiterReason: WaiterRequest | null;
};

type Action =
  | { type: "hydrate"; payload: Partial<State> }
  | { type: "add"; item: MenuItem; optionIds: string[] }
  | { type: "inc"; lineId: string }
  | { type: "dec"; lineId: string }
  | { type: "remove"; lineId: string }
  | { type: "note"; lineId: string; note: string }
  | { type: "clear" }
  | { type: "place"; orderId: string }
  | { type: "stage"; stage: OrderStage }
  | { type: "resetOrder" }
  | { type: "callWaiter"; reason: WaiterRequest; at: number }
  | { type: "clearWaiter" };

const EMPTY: State = {
  hydrated: false,
  lines: [],
  stage: null,
  orderId: null,
  placedLines: [],
  waiterCalledAt: null,
  waiterReason: null,
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
      return { ...state, lines: [] };

    case "place":
      if (state.lines.length === 0) return state;
      return {
        ...state,
        stage: "placed",
        orderId: action.orderId,
        placedLines: state.lines,
        lines: [],
      };

    case "stage":
      return state.stage ? { ...state, stage: action.stage } : state;

    case "resetOrder":
      return { ...state, stage: null, orderId: null, placedLines: [] };

    case "callWaiter":
      return { ...state, waiterCalledAt: action.at, waiterReason: action.reason };

    case "clearWaiter":
      return { ...state, waiterCalledAt: null, waiterReason: null };

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
  placeOrder: () => string | null;
  resetOrder: () => void;
  callWaiter: (reason: WaiterRequest) => void;
  clearWaiter: () => void;
  qtyOf: (itemId: string) => number;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({
  storageKey,
  children,
}: {
  storageKey: string;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, EMPTY);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        }),
      );
    } catch {
      /* Private mode — the cart simply won't survive a refresh. */
    }
  }, [state, storageKey]);

  /* Walk the order through the kitchen stages. */
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!state.stage) return;
    const step = STAGE_AFTER[state.stage];
    if (!step) return;
    timer.current = setTimeout(
      () => dispatch({ type: "stage", stage: step.next }),
      step.ms,
    );
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state.stage]);

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

  const lineCount = state.lines.length;
  const placeOrder = useCallback(() => {
    if (lineCount === 0) return null;
    const orderId = `KT-${String(Math.floor(1000 + Math.random() * 9000))}`;
    dispatch({ type: "place", orderId });
    return orderId;
  }, [lineCount]);

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
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export function billFor(subtotal: number, gstPercent: number) {
  const gst = Math.round((subtotal * gstPercent) / 100);
  return { subtotal, gst, total: subtotal + gst };
}
