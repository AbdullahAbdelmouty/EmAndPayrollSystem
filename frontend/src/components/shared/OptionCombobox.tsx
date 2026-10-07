import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

interface OptionComboboxProps {
  ariaLabel?: string;
  invalid?: boolean;
  items: string[];
  onChange: (value: string) => void;
  placeholder: string;
  value?: string;
  /** Turns a stored value (e.g. "REMOTE_WORK") into display text ("Remote Work"). */
  formatLabel?: (value: string) => string;
}

export function OptionCombobox({
  ariaLabel,
  invalid,
  items,
  onChange,
  placeholder,
  value,
  formatLabel = (item) => item,
}: OptionComboboxProps) {
  return (
    <Combobox
      items={items}
      itemToStringLabel={(item: string) => formatLabel(item)}
      onValueChange={(next) => onChange((next as string | null) ?? "")}
      value={value || null}
    >
      <ComboboxInput
        aria-invalid={invalid}
        aria-label={ariaLabel}
        placeholder={placeholder}
      />
      <ComboboxContent className="z-50 bg-popover text-popover-foreground shadow-md">
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(option: string) => (
            <ComboboxItem key={option} value={option}>
              {formatLabel(option)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
