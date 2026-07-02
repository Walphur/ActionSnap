import { cn } from "@/lib/ui/cn";

export type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function Switch({ label, className, id, ...props }: SwitchProps) {
  const switchId = id ?? props.name;

  return (
    <label className={cn("ds-switch", className)} htmlFor={switchId}>
      <input type="checkbox" role="switch" id={switchId} {...props} />
      <span className="ds-switch__track" aria-hidden />
      <span>{label}</span>
    </label>
  );
}
