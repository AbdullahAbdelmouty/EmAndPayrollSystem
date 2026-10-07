import { CalendarDays } from "lucide-react";

import { Input } from "@/components/ui/input";

interface MonthPickerProps {
  month: string;
  onChange: (month: string) => void;
}

export function MonthPicker({ month, onChange }: MonthPickerProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      Payroll month
      <span className="relative">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Payroll month"
          className="pl-9"
          max={currentMonth()}
          onChange={(event) => onChange(event.target.value)}
          type="month"
          value={month}
        />
      </span>
    </label>
  );
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
