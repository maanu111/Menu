"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { clsx } from "@/lib/format";
import { languageLabel } from "@/lib/languages";

/**
 * Which language the menu is read in.
 *
 * The choice is a URL parameter, so the server sends a menu already written in
 * that language. Nothing rewrites the page after it arrives — which is the
 * whole reason this is reliable where a translate widget is not.
 */
export function LanguagePicker({ languages }: { languages: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  if (languages.length === 0) return null;

  const current = params.get("lang") ?? "";

  function choose(code: string) {
    const next = new URLSearchParams(params.toString());
    if (code) next.set("lang", code);
    else next.delete("lang");
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      /* The menu is server-rendered per language, so it has to be refetched. */
      router.refresh();
    });
  }

  return (
    <div
      className={clsx(
        "no-bar mt-3 flex gap-1.5 overflow-x-auto",
        pending && "opacity-60",
      )}
      role="group"
      aria-label="Menu language"
    >
      <button
        type="button"
        onClick={() => choose("")}
        aria-pressed={current === ""}
        className={clsx(
          "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
          current === ""
            ? "border-accent bg-accent-soft text-accent"
            : "border-line text-ink-2",
        )}
      >
        English
      </button>
      {languages.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => choose(code)}
          aria-pressed={current === code}
          className={clsx(
            "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
            current === code
              ? "border-accent bg-accent-soft text-accent"
              : "border-line text-ink-2",
          )}
        >
          {languageLabel(code)}
        </button>
      ))}
    </div>
  );
}
