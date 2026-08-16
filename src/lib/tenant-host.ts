/* Hosts that are the platform itself, not a tenant. */
const RESERVED = new Set([
  "www",
  "app",
  "admin",
  "api",
  "dashboard",
  "menu",
  "localhost",
]);

/**
 * The restaurant a host names, or null when the host is not a tenant's.
 *
 * Both the proxy and the web app manifest need this answer and must not
 * disagree: the proxy decides what a bare "/" resolves to, and the manifest
 * declares the scope the installed app runs in. If those two ever drifted
 * apart, the menu would look installable and then refuse to install.
 */
export function subdomainOf(host: string) {
  const lower = host.toLowerCase();

  /* IPv6 arrives bracketed — [::1]:3003 — and has no subdomain to read. */
  if (lower.startsWith("[")) return null;

  const name = lower.split(":")[0];

  /* Local development: kesar-tandoor.localhost:3003 works in every browser. */
  if (name.endsWith(".localhost")) {
    const label = name.slice(0, -".localhost".length);
    return RESERVED.has(label) ? null : label;
  }

  /* An IPv4 address has dots but no subdomain: 127.0.0.1 must not read as the
     restaurant "127". Health checks and LAN testing both arrive this way. */
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(name)) return null;

  /* Only the configured domain carries tenants. Without this, any host with
     three parts looks like one — a preview URL such as
     menu-eight-lime.vercel.app would be read as the restaurant
     "menu-eight-lime" and every page would 404. When no domain is configured
     the app is reached by path (/r/<slug>) and there are no subdomains at
     all, which is exactly how a demo deployment runs. */
  const apex = process.env.NEXT_PUBLIC_GUEST_HOST?.trim().toLowerCase();
  if (!apex) return null;
  if (!name.endsWith(`.${apex}`)) return null;

  const label = name.slice(0, -(apex.length + 1));
  /* Only a single label in front of the domain is a tenant. */
  if (!label || label.includes(".")) return null;
  if (RESERVED.has(label)) return null;
  return label;
}
