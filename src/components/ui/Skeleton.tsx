import { cn } from "@/lib/ui/cn";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  width?: string | number;
  height?: string | number;
};

export function Skeleton({ width, height, className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("ds-skeleton", className)}
      style={{ width, height, ...style }}
      aria-hidden
      {...props}
    />
  );
}
