import { cn } from "@/lib/ui/cn";

export type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function Radio({ label, className, id, ...props }: RadioProps) {
  const radioId = id ?? props.name;

  return (
    <label className={cn("ds-radio", className)} htmlFor={radioId}>
      <input type="radio" id={radioId} {...props} />
      <span>{label}</span>
    </label>
  );
}
