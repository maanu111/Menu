import "server-only";
import { db } from "./db";
import { isLanguage } from "./languages";

/**
 * Menus in other languages, made on demand and kept.
 *
 * Nobody configures this. The first guest to ask for a language waits a
 * moment while the menu is translated; everyone after that is served from the
 * database instantly. The restaurant never has to think about it.
 *
 * The work happens here rather than in the guest's browser on purpose: a
 * script that rewrites the page as it loads fights React for the same DOM,
 * and the guest gets flickering text, doubled lines, or a crash mid-order.
 */

const MAX_CHARS = 480;
/* Gentle on a free service, and still finishes a menu in a few seconds. */
const AT_ONCE = 6;

function endpoint() {
  if (process.env.DEEPL_API_KEY) return "deepl" as const;
  if (process.env.GOOGLE_TRANSLATE_API_KEY) return "google" as const;
  return "open" as const;
}

async function once(text: string, to: string): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > MAX_CHARS) return null;

  try {
    if (endpoint() === "deepl") {
      const key = process.env.DEEPL_API_KEY!;
      const host = key.endsWith(":fx")
        ? "https://api-free.deepl.com"
        : "https://api.deepl.com";
      const r = await fetch(`${host}/v2/translate`, {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: [trimmed], target_lang: to.toUpperCase() }),
        cache: "no-store",
      });
      if (!r.ok) return null;
      const body = (await r.json()) as { translations?: { text: string }[] };
      return body.translations?.[0]?.text ?? null;
    }

    if (endpoint() === "google") {
      const key = process.env.GOOGLE_TRANSLATE_API_KEY!;
      const r = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: trimmed,
            source: "en",
            target: to,
            format: "text",
          }),
          cache: "no-store",
        },
      );
      if (!r.ok) return null;
      const body = (await r.json()) as {
        data?: { translations?: { translatedText: string }[] };
      };
      return body.data?.translations?.[0]?.translatedText ?? null;
    }

    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", trimmed);
    url.searchParams.set("langpair", `en|${to}`);
    const email = process.env.MYMEMORY_EMAIL;
    if (email) url.searchParams.set("de", email);

    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    const body = (await r.json()) as {
      responseData?: { translatedText?: string };
      responseStatus?: number | string;
    };
    const out = body.responseData?.translatedText;
    if (!out || Number(body.responseStatus) >= 400) return null;
    /* The service echoes the input back inside a warning when it is out of
       quota, which must not be stored as if it were a translation. */
    if (/MYMEMORY WARNING|QUERY LENGTH LIMIT/i.test(out)) return null;
    return out;
  } catch {
    return null;
  }
}

/** Runs a handful at a time rather than all at once or one by one. */
async function inBatches<T, R>(
  items: T[],
  size: number,
  work: (item: T) => Promise<R>,
) {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(work))));
  }
  return out;
}

/**
 * Makes sure this restaurant's menu exists in one language, translating
 * whatever is missing. Safe to call on every request: once a language is
 * done, this costs one small query and nothing else.
 */
export async function ensureTranslations(restaurantId: string, lang: string) {
  if (!lang || !isLanguage(lang)) return;

  const [categories, items] = await Promise.all([
    db.category.findMany({
      where: { restaurantId, translations: { none: { lang } } },
      select: { id: true, name: true },
    }),
    db.menuItem.findMany({
      where: { restaurantId, translations: { none: { lang } } },
      select: { id: true, name: true, description: true },
    }),
  ]);

  if (categories.length === 0 && items.length === 0) return;

  await inBatches(categories, AT_ONCE, async (category) => {
    const name = await once(category.name, lang);
    /* An unchanged string means the service had no word for it; storing it
       would claim a translation that never happened. */
    if (!name || name.trim().toLowerCase() === category.name.trim().toLowerCase()) return;
    await db.categoryTranslation
      .create({ data: { categoryId: category.id, lang, name } })
      .catch(() => {});
  });

  await inBatches(items, AT_ONCE, async (item) => {
    const name = await once(item.name, lang);
    if (!name || name.trim().toLowerCase() === item.name.trim().toLowerCase()) return;
    const description = item.description
      ? await once(item.description, lang)
      : null;
    await db.menuItemTranslation
      .create({
        data: { menuItemId: item.id, lang, name, description },
      })
      .catch(() => {});
  });
}
