"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MenuItemCard } from "./MenuItemCard";
import { DietMark } from "./DietMark";
import { clsx } from "@/lib/format";
import type { Category, MenuItem } from "@/lib/types";

export function MenuBrowser({
  categories,
  items,
}: {
  categories: Category[];
  items: MenuItem[];
}) {
  const [query, setQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const railRef = useRef<HTMLDivElement>(null);

  const searching = query.trim().length > 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (vegOnly && item.diet !== "veg") return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [items, query, vegOnly]);

  const grouped = useMemo(
    () =>
      categories
        .map((category) => ({
          category,
          items: filtered.filter((i) => i.categoryId === category.id),
        }))
        .filter((group) => group.items.length > 0),
    [categories, filtered],
  );

  /* Highlight whichever section the guest is actually looking at. */
  useEffect(() => {
    if (searching) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-72px 0px -65% 0px", threshold: 0 },
    );

    const nodes = Object.values(sectionRefs.current).filter(Boolean) as HTMLElement[];
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [searching, grouped.length]);

  /* Keep the active chip inside the visible part of the rail. */
  useEffect(() => {
    const chip = railRef.current?.querySelector<HTMLElement>(
      `[data-chip="${activeId}"]`,
    );
    chip?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  function jumpTo(id: string) {
    setActiveId(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const vegCount = items.filter((i) => i.diet === "veg").length;

  return (
    <div className="flex flex-col">
      {/* ------------------------------------------------------ Search row */}
      <div className="flex items-center gap-2 py-3">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-3"
            fill="none"
          >
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M13.2 13.2L17 17"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes"
            aria-label="Search the menu"
            className="h-10 w-full rounded-full border border-line bg-surface pr-4 pl-9 text-[0.8125rem] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
          />
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={vegOnly}
          onClick={() => setVegOnly((v) => !v)}
          className={clsx(
            "flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[0.8125rem] font-medium transition active:scale-95",
            vegOnly
              ? "border-veg bg-veg/10 text-veg"
              : "border-line bg-surface text-ink-2 hover:bg-surface-2",
          )}
        >
          <DietMark diet="veg" />
          <span className="hidden sm:inline">Veg only</span>
          <span className="num text-xs opacity-70">{vegCount}</span>
        </button>
      </div>

      {/* ------------------------------------------------- Category rail */}
      {!searching ? (
        <div className="sticky top-[4.5rem] z-20 -mx-4 border-b border-line bg-ground/95 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 shadow-xs">
          <div ref={railRef} className="no-bar flex items-center gap-2.5 overflow-x-auto py-3">
            {grouped.map(({ category }) => {
              const active = activeId === category.id;
              return (
                <button
                  key={category.id}
                  data-chip={category.id}
                  type="button"
                  onClick={() => jumpTo(category.id)}
                  aria-current={active ? "true" : undefined}
                  className={clsx(
                    "shrink-0 rounded-full border px-5 py-2 text-sm sm:text-[0.9375rem] font-bold whitespace-nowrap transition-all duration-200 active:scale-95",
                    active
                      ? "border-veg bg-veg text-white shadow-md shadow-veg/35 scale-[1.04] ring-2 ring-veg/30"
                      : "border-line bg-surface text-ink-2 hover:border-ink-3/50 hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* ------------------------------------------------------- Sections */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line py-16 text-center">
          <span aria-hidden="true" className="text-3xl">
            🍽️
          </span>
          <p className="text-base font-semibold text-ink">No dishes match</p>
          <p className="max-w-60 text-sm text-ink-2">
            Try a shorter word, or ask a server.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setVegOnly(false);
            }}
            className="mt-1 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 pt-4">
          {grouped.map(({ category, items: rows }, groupIndex) => (
            <section
              key={category.id}
              id={category.id}
              ref={(node) => {
                sectionRefs.current[category.id] = node;
              }}
              className="scroll-mt-28"
              aria-labelledby={`${category.id}-heading`}
            >
              <div className="my-5 flex items-center justify-center gap-3 text-center">
                <span className="h-0.5 flex-1 bg-veg/30" />
                <div className="flex items-center gap-2.5 rounded-full border-2 border-veg/40 bg-veg/10 px-6 py-2 shadow-xs">
                  <h2
                    id={`${category.id}-heading`}
                    className="text-base sm:text-lg font-black tracking-wider uppercase text-veg"
                  >
                    {category.name}
                  </h2>
                  <span className="num rounded-full bg-veg px-2.5 py-0.5 text-xs font-bold text-white shadow-2xs">
                    {rows.length}
                  </span>
                </div>
                <span className="h-0.5 flex-1 bg-veg/30" />
              </div>

              {/* Rows run edge to edge; only their contents keep the gutter. */}
              <div className="-mx-4 flex flex-col border-t border-line sm:-mx-6">
                {rows.map((item, rowIndex) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    priority={groupIndex === 0 && rowIndex < 3}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
