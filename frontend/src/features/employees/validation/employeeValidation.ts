import type { EmployeeInput } from "@/features/employees/types";

export type EmployeeFormValues = Omit<EmployeeInput, "baseSalaryMinor"> & {
  baseSalary: string;
};

export type FieldErrors = Partial<Record<keyof EmployeeFormValues, string>>;

export function validateEmployee(values: EmployeeFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.fullName.trim()) errors.fullName = "Full name is required.";
  else if (values.fullName.trim().length > 100)
    errors.fullName = "Full name must be 100 characters or fewer.";
  if (!values.email.trim()) errors.email = "Email is required.";
  else if (!/^\S+@\S+\.\S+$/.test(values.email))
    errors.email = "Enter a valid email address.";
  if (!values.jobTitle.trim()) errors.jobTitle = "Job title is required.";
  if (!values.department.trim()) errors.department = "Department is required.";
  if (!values.hireDate) errors.hireDate = "Hire date is required.";
  else if (values.hireDate > new Date().toISOString().slice(0, 10))
    errors.hireDate = "Hire date cannot be in the future.";
  if (!values.baseSalary.trim()) errors.baseSalary = "Base salary is required.";
  else if (
    !Number.isFinite(Number(values.baseSalary)) ||
    Number(values.baseSalary) <= 0
  )
    errors.baseSalary = "Base salary must be greater than zero.";

  return errors;
}

export function toEmployeeInput(values: EmployeeFormValues): EmployeeInput {
  return {
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    jobTitle: values.jobTitle.trim(),
    department: values.department.trim(),
    hireDate: values.hireDate,
    baseSalaryMinor: Math.round(Number(values.baseSalary) * 100),
    status: values.status,
    allowances: values.allowances,
    deductions: values.deductions,
  };
}
