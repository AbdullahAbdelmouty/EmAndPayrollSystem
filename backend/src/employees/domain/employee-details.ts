export interface PayItem {
  type: string;
  month: string;
  amountMinor: number;
}

export interface EmployeeDetails {
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  hireDate: string;
  baseSalaryMinor: number;
  allowances: PayItem[];
  deductions: PayItem[];
}

export type EmployeeDetailsInput = Omit<
  EmployeeDetails,
  'allowances' | 'deductions'
> & {
  allowances?: PayItem[];
  deductions?: PayItem[];
};

export function normalizeDetails(details: EmployeeDetails): EmployeeDetails {
  return {
    ...details,
    fullName: details.fullName.trim(),
    email: details.email.trim().toLowerCase(),
    jobTitle: details.jobTitle.trim(),
    department: details.department.trim(),
    hireDate: details.hireDate.trim(),
    allowances: details.allowances.map(normalizePayItem),
    deductions: details.deductions.map(normalizePayItem),
  };
}

function normalizePayItem(item: PayItem): PayItem {
  return {
    ...item,
    type: item.type.trim().toUpperCase(),
    month: item.month.trim(),
  };
}
