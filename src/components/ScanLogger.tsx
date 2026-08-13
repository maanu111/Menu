"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart-store";

/**
 * Records one scan per phone per table, from the browser rather than the
 * render, so server re-renders never inflate the owner's scan counts.
 */
export function ScanLogger({ slug, token }: { slug: string; token: string }) {
  const { state } = useCart();
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || !state.sessionId) return;

    const key = `kt-scan-${slug}-${token}`;
    try {
      if (window.sessionStorage.getItem(key)) {
        sent.current = true;
        return;
      }
      window.sessionStorage.setItem(key, "1");
    } catch {
      /* Private mode — worst case the scan is counted twice. */
    }

    sent.current = true;
    void fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, token, sessionId: state.sessionId }),
      keepalive: true,
    }).catch(() => {
      /* A missed count must never interrupt the meal. */
    });
  }, [slug, token, state.sessionId]);

  return null;
}
