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
  spiceLevel?: 0 | 1 | 2 | 3;
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
  fssai: string;
  gstPercent: number;
  serviceHours: string;
  isOpen: boolean;
  currency: string;
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
  optionLabels: string[];
  note?: string;
};

export type OrderStage = "placed" | "accepted" | "preparing" | "ready" | "served";

export type WaiterRequest =
  | "water"
  | "cutlery"
  | "napkins"
  | "bill"
  | "assistance";
