type Props = {
  count?: number;
  className?: string;
};

export function PhotoGridSkeleton({ count = 12, className = "" }: Props) {
  return (
    <div className={`photo-masonry ${className}`.trim()}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="photo-masonry-item">
          <div className="photo-skeleton aspect-[4/3] w-full rounded-xl" aria-hidden />
        </div>
      ))}
    </div>
  );
}
