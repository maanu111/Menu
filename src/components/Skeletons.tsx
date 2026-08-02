import { clsx } from "@/lib/format";

function Bar({ className }: { className?: string }) {
  return <div className={clsx("skeleton rounded-full", className)} />;
}

/** Stand-in for the restaurant mark while the logo file is still in flight. */
export function LogoSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Loading restaurant logo"
      className={clsx("skeleton rounded-2xl", className)}
    />
  );
}

export function NavbarSkeleton() {
  return (
    <div className="border-b border-line">
      <div className="mx-auto flex h-14 w-full max-w-140 items-center gap-2.5 px-4 sm:px-6">
        <LogoSkeleton className="size-9 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Bar className="h-3 w-32" />
          <Bar className="h-2 w-16" />
        </div>
        <Bar className="size-8 shrink-0" />
        <Bar className="size-8 shrink-0" />
      </div>
    </div>
  );
}

export function TableStripSkeleton() {
  return (
    <div className="flex items-center gap-3 pt-5 pb-1">
      <Bar className="h-2.5 w-10" />
      <Bar className="h-7 w-12 rounded-lg" />
      <Bar className="ml-auto h-2.5 w-28" />
    </div>
  );
}

/** Matches the real row: copy on the left, square photo on the right. */
export function MenuRowSkeleton() {
  return (
    <div className="flex gap-3 border-b border-line px-4 py-3 last:border-b-0 sm:px-6">
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
        <Bar className="h-2.5 w-12" />
        <Bar className="h-3 w-32 max-w-full" />
        <Bar className="h-2.5 w-full" />
        <Bar className="mt-auto h-3 w-14" />
      </div>
      <div className="relative w-24 shrink-0 self-start pb-4">
        <Bar className="aspect-square w-full rounded-xl" />
        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <Bar className="h-8 w-19 ring-2 ring-surface" />
        </div>
      </div>
    </div>
  );
}

export function MenuSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden="true">
      <div className="flex items-center gap-2 py-3">
        <Bar className="h-10 flex-1" />
        <Bar className="h-10 w-20" />
      </div>
      <div className="flex gap-1.5 overflow-hidden border-y border-line py-2.5">
        {["w-16", "w-20", "w-24", "w-16", "w-20"].map((w, i) => (
          <Bar key={i} className={clsx("h-7 shrink-0", w)} />
        ))}
      </div>
      <div className="pt-4">
        <Bar className="h-3 w-20" />
        <div className="-mx-4 mt-2 flex flex-col border-t border-line sm:-mx-6">
          {Array.from({ length: rows }).map((_, i) => (
            <MenuRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
