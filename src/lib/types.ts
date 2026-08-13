export type DietType = "veg" | "nonveg" | "egg";

export type OptionGroup = {
  id: string;
  label: string;
  required: boolean;
  choices: { id: string; label: string; priceDelta: number }[];
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  diet: DietType;
  categoryId: string;
  /** Minutes the kitchen needs — shown so guests self-manage expectations. */
  prepMinutes: number;
  available: boolean;
  bestseller?: boolean;
  /** Eligible for the post-order add-on rail. */
  isAddOn?: boolean;
  spiceLevel?: 0 | 1 | 2 | 3;
  /** Set once the restaurant uploads a photo; otherwise the plate gradient shows. */
  imageUrl?: string;
  /** Two stops used to build the plate gradient before a real photo exists. */
  swatch: [string, string];
  glyph: string;
  options?: OptionGroup[];
};

export type Category = {
  id: string;
  name: string;
};

export type Restaurant = {
  slug: string;
  name: string;
  tagline: string;
  logoSrc: string;
  /** Accent the owner picked in the dashboard. */
  brandColor: string;
  /** Optional welcome line under the header. */
  menuNote?: string;
  fssai: string;
  gstPercent: number;
  serviceHours: string;
  isOpen: boolean;
  currency: string;
  /** Whether this restaurant delivers its own orders. */
  acceptsDelivery: boolean;
  /** Their delivery terms — area, charge, timing. Their promise, not ours. */
  deliveryNote?: string;
  /** Smallest delivery order they will send out, in rupees. 0 = no minimum. */
  deliveryMin: number;
};

/** A slide in the strip above the menu. */
export type Banner = {
  id: string;
  imageUrl: string | null;
  headline: string | null;
  subtext: string | null;
  code: string | null;
};

export type TableInfo = {
  token: string;
  number: string;
  seats: number;
  section: string;
};

export type CartLine = {
  /** Stable key combining item + chosen options, so variants never merge. */
  lineId: string;
  itemId: string;
  name: string;
  diet: DietType;
  unitPrice: number;
  qty: number;
  /** Ids go to the server for re-pricing; labels are for the guest to read. */
  optionIds: string[];
  optionLabels: string[];
  note?: string;
};

export type OrderStage = "placed" | "accepted" | "preparing" | "ready" | "served";

/** Everything here is optional — a guest can order without giving anything. */
export type CustomerDetails = {
  name: string;
  phone: string;
  occasion?: string;
};

/**
 * How this guest is ordering. The restaurant's QR goes up in offices and
 * canteens as well as on tables, so the menu cannot assume anyone is sitting
 * in the restaurant — it has to ask.
 */
export type OrderMode = "dinein" | "delivery";

/** Where a delivery is going. Collected before the guest browses. */
export type DeliveryAddress = {
  name: string;
  phone: string;
  address: string;
  note: string;
};

export type WaiterRequest =
  | "water"
  | "cutlery"
  | "napkins"
  | "bill"
  | "assistance";
