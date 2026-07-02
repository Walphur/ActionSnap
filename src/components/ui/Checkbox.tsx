import { cn } from "@/lib/ui/cn";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const checkboxId = id ?? props.name;

  return (
    <label className={cn("ds-check", className)} htmlFor={checkboxId}>
      <input type="checkbox" id={checkboxId} {...props} />
      <span>{label}</span>
    </label>
  );
}
