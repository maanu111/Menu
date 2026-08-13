/** Turns a restaurant's single accent colour into the token set the menu uses. */

function channels(hex: string) {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ] as const;
}

/** Perceived brightness, so text on the accent is readable either way. */
function luminance(hex: string) {
  const [r, g, b] = channels(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function mix(hex: string, withWhite: boolean, amount: number) {
  const [r, g, b] = channels(hex);
  const target = withWhite ? 255 : 0;
  const blend = (c: number) => Math.round(c + (target - c) * amount);
  return `#${[blend(r), blend(g), blend(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Emits the CSS the guest page needs. Values are validated here rather than
 * trusted from the database, because they land inside a style block.
 */
export function brandStyle(color: string) {
  const accent = HEX.test(color) ? color : "#C8102E";

  /* A pale wash behind chips and selected options. */
  const soft = mix(accent, true, 0.9);
  /* Text sitting on the accent itself. */
  const ink = luminance(accent) > 0.62 ? "#1a1315" : "#ffffff";

  return `--accent:${accent};--accent-soft:${soft};--accent-ink:${ink};`;
}
