import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters/date";
import { formatMoney } from "@/lib/formatters/money";
import type { Employee } from "@/features/employees/types";

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeTable({
  employees,
  isLoading,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  if (isLoading)
    return (
      <div className="p-12 text-center text-sm text-muted-foreground">
        Loading employees…
      </div>
    );
  if (employees.length === 0)
    return (
      <div className="p-12 text-center">
        <MoreHorizontal className="mx-auto size-8 text-muted-foreground" />
        <h2 className="mt-3 font-semibold">No employees found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Try changing your filters or add an employee.
        </p>
      </div>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3">Employee</th>
            <th className="px-5 py-3">Department</th>
            <th className="px-5 py-3">Hire date</th>
            <th className="px-5 py-3 text-right">Monthly salary</th>
            <th className="px-5 py-3">Status</th>
            <th className="w-24 px-5 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {employees.map((employee) => (
            <tr
              className="transition-colors hover:bg-muted/30"
              key={employee.id}
            >
              <td className="px-5 py-4">
                <p className="font-semibold text-foreground">
                  {employee.fullName}
                </p>
                <p className="mt-0.5 text-muted-foreground">{employee.email}</p>
              </td>
              <td className="px-5 py-4">
                <p>{employee.department}</p>
                <p className="mt-0.5 text-muted-foreground">
                  {employee.jobTitle}
                </p>
              </td>
              <td className="px-5 py-4 text-muted-foreground">
                {formatDate(employee.hireDate)}
              </td>
              <td className="px-5 py-4 text-right font-medium">
                {formatMoney(employee.baseSalaryMinor)}
              </td>
              <td className="px-5 py-4">
                <Badge
                  variant={
                    employee.status === "ACTIVE" ? "success" : "secondary"
                  }
                >
                  {employee.status === "ACTIVE" ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-1">
                  <Button
                    aria-label={`Edit ${employee.fullName}`}
                    onClick={() => onEdit(employee)}
                    size="icon"
                    variant="ghost"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    aria-label={`Delete ${employee.fullName}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(employee)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
