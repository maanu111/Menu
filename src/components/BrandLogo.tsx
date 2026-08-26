"use client";

import Image from "next/image";
import { useState } from "react";
import { clsx } from "@/lib/format";

/**
 * Shows the logo skeleton until the file actually decodes, then cross-fades.
 * Falls back to the restaurant's initials if the asset is missing.
 */
export function BrandLogo({
  src,
  name,
  className,
  sizePx = 64,
  widthPx,
  heightPx,
  fit = "fill",
}: {
  src: string;
  name: string;
  className?: string;
  sizePx?: number;
  widthPx?: number;
  heightPx?: number;
  fit?: "contain" | "cover" | "fill";
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div
      className={clsx(
        "relative shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-2",
        className,
      )}
    >
      {!loaded && !failed ? (
        <div
          className="skeleton absolute inset-0"
          role="img"
          aria-label={`Loading ${name} logo`}
        />
      ) : null}

      {failed ? (
        <div className="num grid size-full place-items-center bg-accent-soft text-base font-semibold text-accent">
          {initials}
        </div>
      ) : (
        <Image
          src={src}
          alt={`${name} logo`}
          width={widthPx ?? sizePx}
          height={heightPx ?? sizePx}
          priority
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={clsx(
            "size-full transition-opacity duration-300",
            fit === "fill" ? "object-fill" : fit === "cover" ? "object-cover" : "object-contain",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}
