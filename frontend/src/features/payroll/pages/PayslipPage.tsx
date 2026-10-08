import { FileText, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { OptionCombobox } from "@/components/shared/OptionCombobox";
import { Card, CardContent } from "@/components/ui/card";
import { MonthPicker } from "@/features/payroll/components/MonthPicker";
import { PayslipBreakdown } from "@/features/payroll/components/PayslipBreakdown";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { usePayslip } from "@/features/payroll/hooks/usePayslip";
import { getErrorMessage } from "@/lib/get-error-message";
import { Button } from "@/components/ui/button";

interface PayslipRequest {
  employeeId: string;
  month: string;
}

export function PayslipPage() {
  const { employees, error: employeeError } = useEmployees({
    pageSize: 100,
    status: "ACTIVE",
  });
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [month, setMonth] = useState(initialMonth());
  const [request, setRequest] = useState<PayslipRequest>();
  const { payslip, error, isLoading } = usePayslip(
    request?.employeeId,
    request?.month,
  );

  const submit = () => {
    const employee = employees.find(
      (candidate) => employeeOption(candidate) === employeeSearch,
    );
    if (employee && month) setRequest({ employeeId: employee.id, month });
  };

  return (
    <section>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Compensation
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Payroll
        </h1>
        <p className="mt-2 text-muted-foreground">
          Review a monthly payslip for an active employee.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_12rem_auto] lg:items-end">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Employee
            <OptionCombobox
              items={employees.map(employeeOption)}
              onChange={(value) => setEmployeeSearch(value)}
              placeholder="Search an employee"
              value={employeeSearch}
            />
          </label>
          <MonthPicker month={month} onChange={setMonth} />
          <Button
            disabled={
              !hasSelectedEmployee(employees, employeeSearch) ||
              !month ||
              isLoading
            }
            onClick={submit}
          >
            {isLoading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <FileText className="size-4" />
            )}
            Generate payslip
          </Button>
        </CardContent>
      </Card>

      {employeeError || error ? (
        <div
          className="mb-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          role="alert"
        >
          {getErrorMessage(employeeError ?? error)}
        </div>
      ) : null}

      {isLoading ? <LoadingState /> : null}
      {payslip ? <PayslipBreakdown payslip={payslip} /> : null}
      {!isLoading && !payslip && !error && !employeeError ? (
        <EmptyState />
      ) : null}
    </section>
  );
}

function LoadingState() {
  return (
    <Card className="grid min-h-72 place-items-center">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin text-primary" />
        Calculating payslip…
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="grid min-h-72 place-items-center border-dashed">
      <div className="max-w-sm px-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-indigo-50 text-primary">
          <FileText className="size-6" />
        </span>
        <h2 className="mt-4 font-semibold">Generate a payslip</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose an active employee and a payroll month to see their earnings
          and deductions.
        </p>
      </div>
    </Card>
  );
}

function initialMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function employeeOption(employee: {
  fullName: string;
  jobTitle: string;
  department: string;
}): string {
  return `${employee.fullName} · ${employee.jobTitle} · ${employee.department}`;
}

function hasSelectedEmployee(
  employees: { fullName: string; jobTitle: string; department: string }[],
  value: string,
): boolean {
  return employees.some((employee) => employeeOption(employee) === value);
}
