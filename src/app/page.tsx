import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * The guest app's own root — reached only when the host carries no restaurant
 * subdomain (the bare domain, or www).
 *
 * It must not resolve to a restaurant. Picking "the first one in the database"
 * would show a stranger one tenant's live menu at the platform's own address.
 *
 * In development it does list them, because there is no wildcard DNS on a
 * laptop and typing `slug.localhost:3003` from memory is a poor way to spend
 * an afternoon. The list is compiled out of production builds.
 */
export default async function Home() {
  const showDevIndex = process.env.NODE_ENV !== "production";

  const restaurants = showDevIndex
    ? await db.restaurant.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          tables: {
            where: { isActive: true },
            orderBy: { number: "asc" },
            take: 3,
            select: { id: true, number: true, qrToken: true },
          },
        },
      })
    : [];

  return (
    <main className="mx-auto flex w-full max-w-140 flex-1 flex-col justify-center gap-4 px-6 py-16">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight text-balance text-ink">
          Scan the code on your table
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-2">
          This page opens a restaurant&rsquo;s menu from the QR code printed at
          the table. Point your camera at it and the menu will load itself.
        </p>
      </div>

      {showDevIndex && restaurants.length > 0 ? (
        <section className="mt-6 rounded-xl border border-dashed border-line p-4">
          <p className="text-xs font-semibold text-ink">Development only</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-2">
            In production each restaurant lives on its own subdomain and this
            list does not exist. Locally, these open the same pages a QR code
            would.
          </p>

          <ul className="mt-3 flex flex-col gap-3">
            {restaurants.map((restaurant) => (
              <li key={restaurant.id}>
                <p className="text-sm font-semibold text-ink">
                  {restaurant.name}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Link
                    href={`/r/${restaurant.slug}`}
                    className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink transition hover:border-accent hover:text-accent"
                  >
                    Restaurant QR
                  </Link>
                  {restaurant.tables.map((table) => (
                    <Link
                      key={table.id}
                      href={`/r/${restaurant.slug}/t/${table.qrToken}`}
                      className="num rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink transition hover:border-accent hover:text-accent"
                    >
                      Table {table.number}
                    </Link>
                  ))}
                </div>
                <p className="num mt-1.5 text-[0.6875rem] text-ink-3">
                  or the real thing: {restaurant.slug}.localhost:3003
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
