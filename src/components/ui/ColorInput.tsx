import { cn } from "@/lib/ui/cn";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: readonly string[];
  placeholder?: string;
  className?: string;
};

export function ColorInput({
  id,
  label,
  value,
  onChange,
  suggestions,
  placeholder = "Escribí o elegí un color",
  className,
}: Props) {
  const listId = `${id}-suggestions`;

  return (
    <label className={cn("ds-field", className)}>
      <span className="ds-field__label">{label}</span>
      <input
        id={id}
        className="ds-input"
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      <datalist id={listId}>
        {suggestions.map((color) => (
          <option key={color} value={color} />
        ))}
      </datalist>
    </label>
  );
}
