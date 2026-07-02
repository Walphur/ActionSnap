import { cn, type DsSize } from "@/lib/ui/cn";

export type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  src?: string | null;
  alt?: string;
  initials?: string;
  size?: DsSize;
};

export function Avatar({ src, alt = "", initials, size = "md", className, ...props }: AvatarProps) {
  return (
    <div className={cn("ds-avatar", `ds-avatar--${size}`, className)} {...props}>
      {src ? <img src={src} alt={alt} /> : <span aria-hidden>{initials?.slice(0, 2).toUpperCase()}</span>}
    </div>
  );
}
