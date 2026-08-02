import {
  MenuSkeleton,
  NavbarSkeleton,
  TableStripSkeleton,
} from "@/components/Skeletons";

/** Shown while the table's menu is being fetched — mirrors the real layout. */
export default function Loading() {
  return (
    <>
      <NavbarSkeleton />
      <div className="mx-auto w-full max-w-140 px-4 sm:px-6">
        <TableStripSkeleton />
        <MenuSkeleton rows={5} />
      </div>
      <span className="sr-only" role="status">
        Loading menu
      </span>
    </>
  );
}
