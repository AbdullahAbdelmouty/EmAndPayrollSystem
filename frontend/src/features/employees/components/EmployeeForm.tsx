import type { FormEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEmployeeForm } from "@/features/employees/hooks/useEmployeeForm";
import type { Employee, EmployeeInput } from "@/features/employees/types";
import { toEmployeeInput } from "@/features/employees/validation/employeeValidation";
import { getErrorMessage } from "@/lib/get-error-message";

interface EmployeeFormProps {
  employee?: Employee;
  isPending: boolean;
  onCancel: () => void;
  onSave: (input: EmployeeInput) => Promise<unknown>;
}

export function EmployeeForm({
  employee,
  isPending,
  onCancel,
  onSave,
}: EmployeeFormProps) {
  const { errors, setField, validate, values } = useEmployeeForm(employee);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    try {
      await onSave(toEmployeeInput(values));
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  }

  const fieldClass = "grid gap-1.5";
  const labelClass = "text-sm font-medium";
  const error = (message?: string) =>
    message ? <p className="text-sm text-destructive">{message}</p> : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{employee ? "Edit employee" : "Add employee"}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {employee
            ? "Update the employee’s personal and employment details."
            : "Create an employee record to include them in payroll."}
        </p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          {submitError ? (
            <div
              className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
              role="alert"
            >
              {submitError}
            </div>
          ) : null}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={fieldClass}>
              <span className={labelClass}>Full name</span>
              <Input
                aria-invalid={Boolean(errors.fullName)}
                onChange={(event) => setField("fullName", event.target.value)}
                placeholder="Ana Silva"
                value={values.fullName}
              />
              {error(errors.fullName)}
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Email address</span>
              <Input
                aria-invalid={Boolean(errors.email)}
                onChange={(event) => setField("email", event.target.value)}
                placeholder="ana@company.com"
                type="email"
                value={values.email}
              />
              {error(errors.email)}
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Job title</span>
              <Input
                aria-invalid={Boolean(errors.jobTitle)}
                onChange={(event) => setField("jobTitle", event.target.value)}
                placeholder="Software Engineer"
                value={values.jobTitle}
              />
              {error(errors.jobTitle)}
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Department</span>
              <Input
                aria-invalid={Boolean(errors.department)}
                onChange={(event) => setField("department", event.target.value)}
                placeholder="Engineering"
                value={values.department}
              />
              {error(errors.department)}
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Hire date</span>
              <Input
                aria-invalid={Boolean(errors.hireDate)}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(event) => setField("hireDate", event.target.value)}
                type="date"
                value={values.hireDate}
              />
              {error(errors.hireDate)}
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Base monthly salary</span>
              <Input
                aria-invalid={Boolean(errors.baseSalary)}
                min="0.01"
                onChange={(event) => setField("baseSalary", event.target.value)}
                placeholder="0.00"
                step="0.01"
                type="number"
                value={values.baseSalary}
              />
              {error(errors.baseSalary)}
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Status</span>
              <select
                className="flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                onChange={(event) =>
                  setField(
                    "status",
                    event.target.value as "ACTIVE" | "INACTIVE",
                  )
                }
                value={values.status}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
          </div>
          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <Button
              disabled={isPending}
              onClick={onCancel}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending
                ? "Saving…"
                : employee
                  ? "Save changes"
                  : "Create employee"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
