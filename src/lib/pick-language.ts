import { isLanguage } from "./languages";

/**
 * Which language to serve.
 *
 * Every browser sends an Accept-Language header saying what its owner reads,
 * so a guest whose phone is set to Hindi should get a Hindi menu without
 * touching anything. Reading it on the server means the first paint is
 * already right — nothing swaps language after the page appears.
 *
 * An explicit choice always wins, including choosing English: "en" is how a
 * guest says "leave it in the original", which has to survive a phone set to
 * something else.
 */
export function pickLanguage(
  requested: string | undefined,
  acceptLanguage: string | null,
  offered: string[],
): string {
  /* The guest has spoken. "en" means the English the owner typed. */
  if (requested === "en") return "";
  if (requested && offered.includes(requested)) return requested;

  if (!acceptLanguage || offered.length === 0) return "";

  /* "hi-IN,hi;q=0.9,en-GB;q=0.8" — take them in the order the browser meant,
     which is by q, highest first, and ties in the order written. */
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag, ...rest] = part.trim().split(";");
      const q = rest
        .map((r) => r.trim())
        .find((r) => r.startsWith("q="));
      return {
        base: tag.trim().toLowerCase().split("-")[0],
        q: q ? Number(q.slice(2)) || 0 : 1,
        index,
      };
    })
    /* English stays in the running even though it is not a translation: a
       phone that prefers English over Hindi must get the English menu, and
       dropping it here would hand that guest Hindi. */
    .filter((entry) => entry.base && (entry.base === "en" || isLanguage(entry.base)))
    .sort((a, b) => b.q - a.q || a.index - b.index);

  for (const entry of ranked) {
    /* English is never a translation — it is what the menu already is. */
    if (entry.base === "en") return "";
    if (offered.includes(entry.base)) return entry.base;
  }

  return "";
}
