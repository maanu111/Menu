import "server-only";
import { cache } from "react";
import { db } from "./db";

/**
 * Just enough of a restaurant to name and colour an installed app icon.
 *
 * The full menu query pulls every dish, category and translation; the manifest
 * and the icon need three columns, and both are fetched on their own request.
 */
export const getRestaurantBrand = cache(async (slug: string) => {
  return db.restaurant.findUnique({
    where: { slug },
    select: { name: true, brandColor: true, tagline: true },
  });
});
