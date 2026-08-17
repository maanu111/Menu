import { t } from "@/lib/ui-translations";
import type { TableInfo } from "@/lib/types";

/** One quiet line establishing where the guest is sitting. Nothing more. */
export function TableStrip({ table, language }: { table: TableInfo; language: string }) {
  return (
    <div className="flex items-baseline gap-2 pt-5 pb-1">
      <span className="eyebrow text-[0.625rem] text-ink-3">{t("table", language)}</span>
      <span className="num text-2xl leading-none font-semibold tracking-tight text-ink">
        {table.number}
      </span>
      <span className="num ml-auto text-[0.6875rem] text-ink-3">
        {table.section} · {table.seats} {t("seats", language)}
      </span>
    </div>
  );
}
