export interface PayslipLine {
  type: string;
  amountMinor: number;
}

export interface PayslipEmployee {
  id: string;
  fullName: string;
  jobTitle: string;
  department: string;
}

export interface Payslip {
  employee: PayslipEmployee;
  month: string;
  currency: string;
  baseSalaryMinor: number;
  allowances: PayslipLine[];
  grossSalaryMinor: number;
  statutoryDeductions: PayslipLine[];
  otherDeductions: PayslipLine[];
  totalDeductionsMinor: number;
  netSalaryMinor: number;
}
