"use client";

import Image from "next/image";
import { useState } from "react";
import { clsx, resolveMediaUrl } from "@/lib/format";

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
  const resolvedSrc = resolveMediaUrl(src) || src;
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
        "relative shrink-0 overflow-hidden border border-line",
        className ? className : "rounded-2xl bg-surface-2",
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
          src={resolvedSrc}
          alt={`${name} logo`}
          width={widthPx ?? sizePx}
          height={heightPx ?? sizePx}
          unoptimized
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
