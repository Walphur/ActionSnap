type Props = {
  count?: number;
  className?: string;
};

export function PhotoGridSkeleton({ count = 12, className = "" }: Props) {
  return (
    <div className={`photo-masonry ${className}`.trim()} aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="photo-masonry-item">
          <div className="photo-skeleton-wrap">
            <div className="photo-skeleton h-full w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
