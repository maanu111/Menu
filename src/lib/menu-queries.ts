import "server-only";
import { cache } from "react";
import { db } from "./db";
import type {
  Banner,
  Category,
  DietType,
  MenuItem,
  Restaurant,
  TableInfo,
} from "./types";

/* Plate gradients for dishes with no photo yet. Picked by a hash of the id so
   a dish keeps the same colour between visits. */
const SWATCHES: [string, string][] = [
  ["#E9A23B", "#C2571F"],
  ["#E2703A", "#A8380F"],
  ["#7A5236", "#3A2114"],
  ["#D9A441", "#8A5410"],
  ["#7FA84C", "#3D5B21"],
  ["#EBD7A9", "#C09A55"],
  ["#C0341C", "#6B1508"],
  ["#F0C9D2", "#C06B84"],
];

const GLYPHS = ["🍛", "🍲", "🍗", "🥘", "🫓", "🍚", "🥗", "🍮"];

function hash(value: string) {
  let n = 0;
  for (let i = 0; i < value.length; i++) n = (n * 31 + value.charCodeAt(i)) >>> 0;
  return n;
}

const DIET: Record<string, DietType> = {
  VEG: "veg",
  NONVEG: "nonveg",
  EGG: "egg",
};

export type RestaurantMenu = {
  restaurant: Restaurant;
  categories: Category[];
  items: MenuItem[];
  banners: Banner[];
  /** Every open table, so the popup can ask which one they are at. */
  tables: { number: string; section: string; token: string }[];
};

export type TableMenu = RestaurantMenu & { table: TableInfo };

/**
 * Everything a guest screen needs, in one round trip.
 *
 * `token` null means the guest is ordering for delivery, so no table has to
 * resolve — a restaurant that delivers without seating still gets a menu.
 *
 * Wrapped in cache() so the layout can check the code is real — and answer a
 * true 404 before the page's loading skeleton flushes the response — without
 * the page paying for a second round trip.
 */
const loadMenu = cache(async function loadMenu(
  slug: string,
  token: string | null,
): Promise<TableMenu | RestaurantMenu | null> {
  const row = await db.restaurant.findUnique({
    where: { slug },
    include: {
      tables: {
        where: { isActive: true },
        orderBy: { number: "asc" },
        select: {
          id: true,
          number: true,
          seats: true,
          section: true,
          qrToken: true,
          isActive: true,
        },
      },
      banners: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          imageUrl: true,
          headline: true,
          subtext: true,
          code: true,
        },
      },
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            include: {
              optionGroups: {
                orderBy: { sortOrder: "asc" },
                include: { choices: { orderBy: { sortOrder: "asc" } } },
              },
            },
          },
        },
      },
    },
  });

  if (!row) return null;

  /* A printed code that no longer matches an open table shows nothing. */
  const scanned = token
    ? row.tables.find((t) => t.qrToken === token.toUpperCase())
    : undefined;
  if (token && !scanned) return null;
  const table = scanned;

  const items: MenuItem[] = row.categories.flatMap((category) =>
    category.items.map((item) => {
      const seed = hash(item.id);
      return {
        id: item.id,
        name: item.name,
        description: item.description ?? "",
        price: item.pricePaise / 100,
        diet: DIET[item.diet] ?? "veg",
        categoryId: category.id,
        prepMinutes: item.prepMinutes,
        available: item.isAvailable,
        bestseller: item.isBestseller,
        isAddOn: item.isAddOn,
        spiceLevel: Math.min(3, Math.max(0, item.spiceLevel)) as 0 | 1 | 2 | 3,
        imageUrl: item.imageUrl ?? undefined,
        swatch: SWATCHES[seed % SWATCHES.length],
        glyph: GLYPHS[seed % GLYPHS.length],
        options: item.optionGroups.map((group) => ({
          id: group.id,
          label: group.name,
          required: group.isRequired,
          choices: group.choices.map((choice) => ({
            id: choice.id,
            label: choice.label,
            priceDelta: choice.priceDeltaPaise / 100,
          })),
        })),
      };
    }),
  );

  return {
    restaurant: {
      slug: row.slug,
      name: row.name,
      tagline: row.tagline ?? "",
      logoSrc: row.logoUrl ?? "/kesar-tandoor.svg",
      brandColor: row.brandColor,
      menuNote: row.menuNote ?? undefined,
      fssai: row.fssai ?? "",
      gstPercent: row.gstPercent,
      serviceHours: row.serviceHours ?? "",
      isOpen: row.isOpen,
      currency: row.currency,
      acceptsPickup: row.acceptsPickup,
      pickupNote: row.pickupNote ?? undefined,
      pickupMin: row.pickupMinPaise / 100,
    },
    ...(table
      ? {
          table: {
            token: table.qrToken,
            number: table.number,
            seats: table.seats,
            section: table.section ?? "",
          },
        }
      : {}),
    categories: row.categories
      .filter((c) => c.items.length > 0)
      .map((c) => ({ id: c.id, name: c.name })),
    items,
    banners: row.banners,
    tables: row.tables.map((t) => ({
      number: t.number,
      section: t.section ?? "",
      token: t.qrToken,
    })),
  };
});

/** The menu behind a printed table QR. */
export async function getTableMenu(slug: string, token: string) {
  return (await loadMenu(slug, token)) as TableMenu | null;
}

/**
 * The menu behind the restaurant's own code — the one that goes up in offices
 * and canteens as well as by the door. No table is implied; the opening popup
 * asks whether the guest is eating in or collecting.
 */
export async function getRestaurantMenu(slug: string) {
  return (await loadMenu(slug, null)) as RestaurantMenu | null;
}

/** One row per QR open — this is what the owner's scan reports count. */
export async function logScan(
  restaurantSlug: string,
  tableToken: string,
  sessionId: string,
) {
  const table = await db.restaurantTable.findUnique({
    where: { qrToken: tableToken.toUpperCase() },
    select: { id: true, restaurantId: true, restaurant: { select: { slug: true } } },
  });
  if (!table || table.restaurant.slug !== restaurantSlug) return;

  await db.qrScan.create({
    data: {
      restaurantId: table.restaurantId,
      tableId: table.id,
      sessionId,
    },
  });
}
