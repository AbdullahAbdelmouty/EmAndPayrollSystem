import { Banknote, MinusCircle, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Payslip, PayslipLine } from "@/features/payroll/types";
import { formatMoney } from "@/lib/formatters/money";

interface PayslipBreakdownProps {
  payslip: Payslip;
}

export function PayslipBreakdown({ payslip }: PayslipBreakdownProps) {
  const money = (amount: number) =>
    formatMoney(amount, { currency: payslip.currency });

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={Banknote}
          label="Gross pay"
          value={money(payslip.grossSalaryMinor)}
        />
        <SummaryCard
          icon={MinusCircle}
          label="Total deductions"
          tone="rose"
          value={money(payslip.totalDeductionsMinor)}
        />
        <SummaryCard
          icon={WalletCards}
          label="Net pay"
          tone="primary"
          value={money(payslip.netSalaryMinor)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <PayGroup
          baseSalaryMinor={payslip.baseSalaryMinor}
          currency={payslip.currency}
          lines={payslip.allowances}
          title="Earnings"
        />
        <Card>
          <CardHeader>
            <CardTitle>Deductions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Statutory and employee-specific deductions.
            </p>
          </CardHeader>
          <CardContent className="grid gap-5">
            <LineList
              currency={payslip.currency}
              emptyMessage="No statutory deductions"
              lines={payslip.statutoryDeductions}
              title="Statutory deductions"
            />
            <LineList
              currency={payslip.currency}
              emptyMessage="No additional deductions"
              lines={payslip.otherDeductions}
              title="Other deductions"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  tone = "default",
  value,
}: {
  icon: typeof Banknote;
  label: string;
  tone?: "default" | "primary" | "rose";
  value: string;
}) {
  const iconClasses = {
    default: "bg-slate-100 text-slate-600",
    primary: "bg-indigo-100 text-primary",
    rose: "bg-rose-100 text-rose-700",
  }[tone];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid size-10 place-items-center rounded-lg ${iconClasses}`}
        >
          <Icon className="size-5" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
    </Card>
  );
}

function PayGroup({
  baseSalaryMinor,
  currency,
  lines,
  title,
}: {
  baseSalaryMinor: number;
  currency: string;
  lines: PayslipLine[];
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Base salary and recurring employee allowances.
        </p>
      </CardHeader>
      <CardContent className="grid gap-5">
        <LineList
          currency={currency}
          lines={[{ type: "BASE_SALARY", amountMinor: baseSalaryMinor }]}
          title="Base salary"
        />
        <LineList
          currency={currency}
          emptyMessage="No allowances for this employee"
          lines={lines}
          title="Allowances"
        />
      </CardContent>
    </Card>
  );
}

function LineList({
  currency,
  emptyMessage = "No items",
  lines,
  title,
}: {
  currency: string;
  emptyMessage?: string;
  lines: PayslipLine[];
  title: string;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {lines.length ? (
        <ul className="divide-y rounded-md border">
          {lines.map((line) => (
            <li
              className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm"
              key={line.type}
            >
              <span>{humanize(line.type)}</span>
              <span className="font-semibold tabular-nums">
                {formatMoney(line.amountMinor, { currency })}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

function humanize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
