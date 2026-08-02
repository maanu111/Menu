import { redirect } from "next/navigation";
import { restaurant, table } from "@/lib/mock-data";

/* Nobody types the root — a real guest always arrives from a printed QR. */
export default function Home() {
  redirect(`/r/${restaurant.slug}/t/${table.token}`);
}
