/**
 * Placeholder photography until the restaurant supplies its own shots.
 * Swap each value for a URL from their own storage and nothing else changes.
 */
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=320&h=320&q=70`;

export const dishImages: Record<string, string> = {
  "paneer-tikka": UNSPLASH("photo-1567188040759-fb8a883dc6d8"),
  "dahi-ke-kebab": UNSPLASH("photo-1601050690597-df0568f70950"),
  "amritsari-macchi": UNSPLASH("photo-1626777552726-4a6b54c97e46"),
  "chilli-mushroom": UNSPLASH("photo-1563379091339-03b21ab4a4f8"),

  "murgh-malai-tikka": UNSPLASH("photo-1610057099443-fde8c4d50f91"),
  "tandoori-chicken": UNSPLASH("photo-1588166524941-3bf61a9c41db"),
  "tandoori-broccoli": UNSPLASH("photo-1596797038530-2c107229654b"),
  "seekh-kebab": UNSPLASH("photo-1606491956689-2ea866880c84"),

  "dal-makhani": UNSPLASH("photo-1585937421612-70a008356fbe"),
  "butter-chicken": UNSPLASH("photo-1603894584373-5ac82b2ae398"),
  "paneer-lababdar": UNSPLASH("photo-1631452180519-c014fe946bc7"),
  "laal-maas": UNSPLASH("photo-1565557623262-b51c2513a641"),

  "butter-naan": UNSPLASH("photo-1517244683847-7456b63c5969"),
  "laccha-paratha": UNSPLASH("photo-1589302168068-964664d93dc0"),
  "garlic-kulcha": UNSPLASH("photo-1596040033229-a9821ebd058d"),
  "tandoori-roti": UNSPLASH("photo-1512058564366-18510be2db19"),

  "hyderabadi-biryani": UNSPLASH("photo-1599487488170-d11ec9c172f0"),
  "subz-biryani": UNSPLASH("photo-1630383249896-424e482df921"),
  "jeera-rice": UNSPLASH("photo-1609501676725-7186f017a4b7"),

  "gulab-jamun": UNSPLASH("photo-1585032226651-759b368d7246"),
  "shahi-tukda": UNSPLASH("photo-1668236543090-82eba5ee5976"),
  "kulfi-falooda": UNSPLASH("photo-1601050690597-df0568f70950"),

  "masala-chaas": UNSPLASH("photo-1626777552726-4a6b54c97e46"),
  "sweet-lassi": UNSPLASH("photo-1563379091339-03b21ab4a4f8"),
  "nimbu-soda": UNSPLASH("photo-1512058564366-18510be2db19"),
  "kesar-chai": UNSPLASH("photo-1517244683847-7456b63c5969"),
};
