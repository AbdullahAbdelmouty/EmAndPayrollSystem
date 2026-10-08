import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeleteConfirmDialog } from "@/features/employees/components/DeleteConfirmDialog";
import { EmployeeFilters } from "@/features/employees/components/EmployeeFilters";
import { EmployeeTable } from "@/features/employees/components/EmployeeTable";
import { Pagination } from "@/features/employees/components/Pagination";
import { useEmployeeMutations } from "@/features/employees/hooks/useEmployeeMutations";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import type {
  Employee,
  EmployeeListQuery,
} from "@/features/employees/types";
import { getErrorMessage } from "@/lib/get-error-message";
import { EmployeeFormPage } from "./EmployeeFormPage";

type View = "list" | "create" | "edit";

export function EmployeeListPage() {
  const [filters, setFilters] = useState<EmployeeListQuery>({
    page: 1,
    pageSize: 10,
  });
  const [view, setView] = useState<View>("list");
  const [selectedEmployee, setSelectedEmployee] = useState<
    Employee | undefined
  >();
  const [employeeToDelete, setEmployeeToDelete] = useState<
    Employee | undefined
  >();
  const { employees, error, isLoading, page, refresh } = useEmployees(filters);
  const {
    deleteEmployee,
    error: mutationError,
    isPending,
  } = useEmployeeMutations();

  const closeForm = () => {
    setView("list");
    setSelectedEmployee(undefined);
  };
  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteEmployee(employeeToDelete.id);
      setEmployeeToDelete(undefined);
      refresh();
    } catch {
      /* Mutation state renders the error. */
    }
  };

  if (view !== "list")
    return (
      <EmployeeFormPage
        employeeId={view === "edit" ? selectedEmployee?.id : undefined}
        onBack={closeForm}
        onSaved={() => {
          closeForm();
          refresh();
        }}
      />
    );

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Workforce
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Employees
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage employee records and prepare monthly payroll.
          </p>
        </div>
        <Button onClick={() => setView("create")}>
          <Plus className="size-4" />
          Add employee
        </Button>
      </div>
      {error || mutationError ? (
        <div
          className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          role="alert"
        >
          {getErrorMessage(error ?? mutationError)}
        </div>
      ) : null}
      <Card>
        <EmployeeFilters filters={filters} onChange={setFilters} />
        <EmployeeTable
          employees={employees}
          isLoading={isLoading}
          onDelete={setEmployeeToDelete}
          onEdit={(employee) => {
            setSelectedEmployee(employee);
            setView("edit");
          }}
        />
        <Pagination
          onPageChange={(nextPage) =>
            setFilters((current) => ({ ...current, page: nextPage }))
          }
          page={page}
        />
      </Card>
      {employeeToDelete ? (
        <DeleteConfirmDialog
          employeeName={employeeToDelete.fullName}
          isPending={isPending}
          onCancel={() => setEmployeeToDelete(undefined)}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}
    </section>
  );
}
