import { useState } from "react";

import type { Employee } from "@/features/employees/types";
import {
  type EmployeeFormValues,
  type FieldErrors,
  validateEmployee,
} from "@/features/employees/validation/employeeValidation";

const emptyValues: EmployeeFormValues = {
  fullName: "",
  email: "",
  jobTitle: "",
  department: "",
  hireDate: "",
  baseSalary: "",
  status: "ACTIVE",
  allowances: [],
  deductions: [],
};

function fromEmployee(employee?: Employee): EmployeeFormValues {
  if (!employee) return emptyValues;
  return {
    ...employee,
    baseSalary: (employee.baseSalaryMinor / 100).toFixed(2),
  };
}

export function useEmployeeForm(employee?: Employee) {
  const [values, setValues] = useState<EmployeeFormValues>(() =>
    fromEmployee(employee),
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  return {
    values,
    errors,
    setField<K extends keyof EmployeeFormValues>(
      field: K,
      value: EmployeeFormValues[K],
    ) {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    },
    validate() {
      const nextErrors = validateEmployee(values);
      setErrors(nextErrors);
      return Object.keys(nextErrors).length === 0;
    },
  };
}
