import type { MouseEvent } from "react";
import { useRef, useState } from "react";
import { CalendarRange, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionCombobox } from "@/components/shared/OptionCombobox";
import type { PayItem } from "@/features/employees/types";

export function PayItemsEditor({
  error,
  items,
  kind,
  onChange,
}: {
  error?: string;
  items: PayItem[];
  kind: "Allowance" | "Deduction";
  onChange: (items: PayItem[]) => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [announcement, setAnnouncement] = useState("");
  const kindLower = kind.toLowerCase();

  const update = (index: number, changes: Partial<PayItem>) => {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...changes } : item,
      ),
    );
  };

  const add = () => {
    onChange([...items, { type: "", month: currentMonth(), amountMinor: 0 }]);
    setAnnouncement(`New ${kindLower} added.`);
    requestAnimationFrame(() =>
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      }),
    );
  };

  const remove = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
    setAnnouncement(`${describe(items[index], kind)} removed.`);
  };

  const applyToYear = (index: number) => {
    const source = items[index];
    const year = yearOf(source.month);
    if (!source.type || !year) return;

    const yearItems = monthsOfYear(year).map((month) => ({
      ...source,
      month,
    }));

    onChange(
      items.flatMap((item, itemIndex) => {
        if (itemIndex === index) return yearItems;
        const duplicate =
          item.type === source.type && yearOf(item.month) === year;
        return duplicate ? [] : [item];
      }),
    );
    setAnnouncement(
      `${formatPayItemType(source.type)} applied to all 12 months of ${year}.`,
    );
  };

  return (
    <fieldset className="grid content-start gap-3 rounded-lg border bg-slate-50/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <legend className="font-semibold">
            {kind}s
            {items.length ? (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({items.length})
              </span>
            ) : null}
          </legend>
          <p className="mt-1 text-xs text-muted-foreground">
            Add pay items for a specific payroll month.
          </p>
        </div>
        <Button onClick={add} size="sm" type="button" variant="outline">
          <Plus aria-hidden="true" className="size-4" /> Add {kindLower}
        </Button>
      </div>

      {items.length ? (
        <ul
          aria-label={`${kind} list`}
          className="grid max-h-[32rem] content-start gap-3 overflow-y-auto pr-1 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
          ref={listRef}
          // Keyboard users can scroll the list once it overflows.
          tabIndex={0}
        >
          {items.map((item, index) => {
            const year = yearOf(item.month);
            const appliedToYear = coversYear(items, item);
            const canApplyToYear = Boolean(item.type && year) && !appliedToYear;

            return (
              <li
                className="grid gap-3 rounded-md border bg-white p-3"
                key={index}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{describe(item, kind)}</p>
                  <Button
                    aria-label={`Remove ${describe(item, kind)}`}
                    onClick={() => remove(index)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5 sm:col-span-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Type
                    </span>
                    <OptionCombobox
                      ariaLabel={`${kind} type`}
                      formatLabel={formatPayItemType}
                      items={PAY_ITEM_TYPE_OPTIONS}
                      onChange={(type) => update(index, { type })}
                      placeholder="Select type"
                      value={item.type}
                    />
                  </div>
                  <label className="grid gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Month
                    </span>
                    <Input
                      className="min-w-0"
                      onChange={(event) =>
                        update(index, { month: event.target.value })
                      }
                      onClick={openPicker}
                      type="month"
                      value={item.month}
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Amount
                    </span>
                    <Input
                      className="min-w-0"
                      inputMode="decimal"
                      min="0"
                      onChange={(event) =>
                        update(index, {
                          amountMinor: Math.round(
                            Number(event.target.value || 0) * 100,
                          ),
                        })
                      }
                      placeholder="0.00"
                      step="0.01"
                      type="number"
                      value={item.amountMinor / 100}
                    />
                  </label>
                </div>

                {appliedToYear ? (
                  <p className="text-xs text-muted-foreground">
                    Applied to all 12 months of {year}.
                  </p>
                ) : (
                  <Button
                    className="justify-self-start"
                    disabled={!canApplyToYear}
                    onClick={() => applyToYear(index)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <CalendarRange aria-hidden="true" className="size-4" />
                    {year
                      ? `Apply to all months of ${year}`
                      : "Apply to all months"}
                  </Button>
                )}
                {!item.type && !appliedToYear ? (
                  <p className="-mt-1 text-xs text-muted-foreground">
                    Select a type to apply it to the whole year.
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No {kindLower}s added.</p>
      )}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {/* Announces add / remove / apply-to-year results to screen readers. */}
      <p aria-live="polite" className="sr-only" role="status">
        {announcement}
      </p>
    </fieldset>
  );
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function yearOf(month: string): string {
  return /^\d{4}-\d{2}$/.test(month) ? month.slice(0, 4) : "";
}

function monthsOfYear(year: string): string[] {
  return Array.from(
    { length: 12 },
    (_, index) => `${year}-${String(index + 1).padStart(2, "0")}`,
  );
}

function coversYear(items: PayItem[], item: PayItem): boolean {
  const year = yearOf(item.month);
  if (!item.type || !year) return false;
  return monthsOfYear(year).every((month) =>
    items.some(
      (other) =>
        other.type === item.type &&
        other.month === month &&
        other.amountMinor === item.amountMinor,
    ),
  );
}

/** "2026-05" -> "May 2026" */
function formatMonth(month: string): string {
  if (!yearOf(month)) return "no month";
  return new Date(`${month}-01T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/** Human-readable summary used as the row heading and in button labels. */
function describe(item: PayItem, kind: string): string {
  const type = item.type
    ? formatPayItemType(item.type)
    : `New ${kind.toLowerCase()}`;
  return `${type} · ${formatMonth(item.month)}`;
}

function formatPayItemType(type: string): string {
  return type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function openPicker(event: MouseEvent<HTMLInputElement>) {
  try {
    event.currentTarget.showPicker?.();
  } catch {
    // Some browsers block showPicker(); the native input still works.
  }
}

const PAY_ITEM_TYPE_OPTIONS = [
  "COMMISSION",
  "EQUIPMENT_ADVANCE",
  "HOUSING",
  "LOAN_REPAYMENT",
  "MEAL",
  "MOBILE",
  "REMOTE_WORK",
  "SAVINGS_PLAN",
  "TRANSPORT",
];
