import { Skeleton } from "@/components/ui/Skeleton";

type Props = {
  count?: number;
  className?: string;
};

export function PhotoGridSkeleton({ count = 12, className = "" }: Props) {
  return (
    <div className={`buyer-gallery ${className}`.trim()} aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="buyer-gallery__item">
          <div className="buyer-skeleton-card">
            <Skeleton className="aspect-[4/5] w-full rounded-none" />
          </div>
        </div>
      ))}
    </div>
  );
}
