export default function ProductSkeleton() {
  return (
    <div className="w-full flex flex-col bg-white border border-bordergray rounded-3xl overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square w-full bg-warmwhite" />
      {/* Details Skeleton */}
      <div className="flex flex-col gap-2.5 p-4 sm:p-5">
        {/* Title */}
        <div className="h-5 bg-warmwhite rounded-lg w-3/4" />
        {/* Unit */}
        <div className="h-3.5 bg-warmwhite rounded-lg w-1/3" />
        {/* Price */}
        <div className="h-6 bg-warmwhite rounded-lg w-1/4 mt-1" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductSkeleton key={idx} />
      ))}
    </div>
  );
}
