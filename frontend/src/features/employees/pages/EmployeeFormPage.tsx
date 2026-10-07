import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmployeeForm } from "@/features/employees/components/EmployeeForm";
import { useEmployeeMutations } from "@/features/employees/hooks/useEmployeeMutations";
import { useEmployee } from "@/features/employees/hooks/useEmployees";
import type { EmployeeInput } from "@/features/employees/types";
import { getErrorMessage } from "@/lib/get-error-message";

interface EmployeeFormPageProps {
  employeeId?: string;
  onBack: () => void;
  onSaved: () => void;
}

/** A route-ready page for creating an employee or editing one by ID. */
export function EmployeeFormPage({
  employeeId,
  onBack,
  onSaved,
}: EmployeeFormPageProps) {
  const { employee, error: loadError, isLoading } = useEmployee(employeeId);
  const { createEmployee, isPending, updateEmployee } = useEmployeeMutations();
  const isEditing = Boolean(employeeId);

  async function handleSave(input: EmployeeInput) {
    if (employeeId) await updateEmployee(employeeId, input);
    else await createEmployee(input);
    onSaved();
  }

  if (isEditing && isLoading) {
    return (
      <div className="grid min-h-64 place-items-center text-sm text-muted-foreground">
        Loading employee…
      </div>
    );
  }

  if (isEditing && loadError) {
    return (
      <section className="max-w-xl">
        <Button onClick={onBack} variant="ghost">
          <ArrowLeft className="size-4" />
          Back to employees
        </Button>
        <div
          className="mt-6 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
          role="alert"
        >
          {getErrorMessage(loadError)}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <Button onClick={onBack} variant="ghost">
          <ArrowLeft className="size-4" />
          Back to employees
        </Button>
      </div>
      <EmployeeForm
        employee={employee ?? undefined}
        isPending={isPending}
        onCancel={onBack}
        onSave={handleSave}
      />
    </section>
  );
}
