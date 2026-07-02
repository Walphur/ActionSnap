import { cn } from "@/lib/ui/cn";

export type TooltipProps = {
  content: string;
  children: React.ReactNode;
  className?: string;
};

export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <span className={cn("ds-tooltip-wrap", className)}>
      {children}
      <span className="ds-tooltip" role="tooltip">
        {content}
      </span>
    </span>
  );
}
