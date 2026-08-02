import Link from "next/link";
import { restaurant, table } from "@/lib/mock-data";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-140 flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <span aria-hidden="true" className="text-4xl">
        🔍
      </span>
      <h1 className="text-xl font-semibold tracking-tight text-balance text-ink">
        This code isn&rsquo;t linked to a table
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-ink-2">
        The sticker may have been replaced. Ask a server to point you at the right
        one, or scan the code on your table again.
      </p>
      <Link
        href={`/r/${restaurant.slug}/t/${table.token}`}
        className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink transition hover:brightness-110"
      >
        Open the demo table
      </Link>
    </main>
  );
}
