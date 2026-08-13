"use client";

import Image from "next/image";
import { useState } from "react";
import { clsx } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

/**
 * Dish photo with a shimmer while it loads. If the file 404s or the guest is
 * offline, it falls back to the dish's own gradient rather than a broken box.
 */
export function DishImage({
  item,
  className,
  sizes = "96px",
  priority = false,
}: {
  item: MenuItem;
  className?: string;
  sizes?: string;
  /** Set on the few dishes above the fold so the LCP image isn't lazy. */
  priority?: boolean;
}) {
  const src = item.imageUrl;
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!src);

  return (
    <div
      className={clsx("relative overflow-hidden rounded-xl bg-surface-2", className)}
      style={
        failed || !src
          ? {
              backgroundImage: `radial-gradient(120% 120% at 30% 20%, ${item.swatch[0]}, ${item.swatch[1]})`,
            }
          : undefined
      }
    >
      {!loaded && src && !failed ? (
        <div className="skeleton absolute inset-0" aria-hidden="true" />
      ) : null}

      {failed || !src ? (
        <span
          aria-hidden="true"
          className="grid size-full place-items-center text-2xl select-none"
        >
          {item.glyph}
        </span>
      ) : (
        <Image
          src={src}
          alt={item.name}
          fill
          sizes={sizes}
          priority={priority}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={clsx(
            "object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}

      <span className="absolute inset-0 rounded-xl ring-1 ring-black/8 ring-inset" />
    </div>
  );
}
