export const EMPLOYEE_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export interface PayItem {
  type: string;
  month: string;
  amountMinor: number;
}

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  hireDate: string;
  baseSalaryMinor: number;
  status: EmployeeStatus;
  allowances: PayItem[];
  deductions: PayItem[];
}

export interface EmployeeInput {
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  hireDate: string;
  baseSalaryMinor: number;
  status?: EmployeeStatus;
  allowances?: PayItem[];
  deductions?: PayItem[];
}

export type EmployeeUpdate = Partial<EmployeeInput>;

export interface EmployeeListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  status?: EmployeeStatus;
}

export interface EmployeePage {
  items: Employee[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
