import { EmployeeStatus } from '../../employees/domain/employee-status.enum';

export interface SeedPayItem {
  type: string;
  amountMinor: number;
}

export interface SeedEmployee {
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  hireDate: string;
  baseSalaryMinor: number;
  status: EmployeeStatus;
  allowances: SeedPayItem[];
  deductions: SeedPayItem[];
}

/**
 * Demo records for local and containerized development. Amounts use minor
 * currency units, matching the API contract (for example, 125000 = 1,250.00).
 */
export const demoEmployees: SeedEmployee[] = [
  {
    fullName: 'Ana Silva',
    email: 'ana.silva@acme.test',
    jobTitle: 'Engineering Manager',
    department: 'Engineering',
    hireDate: '2021-04-12',
    baseSalaryMinor: 850000,
    status: EmployeeStatus.Active,
    allowances: [
      { type: 'HOUSING', amountMinor: 125000 },
      { type: 'TRANSPORT', amountMinor: 30000 },
    ],
    deductions: [{ type: 'LOAN_REPAYMENT', amountMinor: 25000 }],
  },
  {
    fullName: 'Omar Hassan',
    email: 'omar.hassan@acme.test',
    jobTitle: 'Senior Backend Engineer',
    department: 'Engineering',
    hireDate: '2022-01-17',
    baseSalaryMinor: 680000,
    status: EmployeeStatus.Active,
    allowances: [{ type: 'REMOTE_WORK', amountMinor: 20000 }],
    deductions: [],
  },
  {
    fullName: 'Lina Farouk',
    email: 'lina.farouk@acme.test',
    jobTitle: 'Frontend Engineer',
    department: 'Engineering',
    hireDate: '2023-06-05',
    baseSalaryMinor: 510000,
    status: EmployeeStatus.Active,
    allowances: [{ type: 'TRANSPORT', amountMinor: 25000 }],
    deductions: [],
  },
  {
    fullName: 'Youssef Adel',
    email: 'youssef.adel@acme.test',
    jobTitle: 'QA Engineer',
    department: 'Engineering',
    hireDate: '2024-02-19',
    baseSalaryMinor: 420000,
    status: EmployeeStatus.Active,
    allowances: [],
    deductions: [{ type: 'EQUIPMENT_ADVANCE', amountMinor: 15000 }],
  },
  {
    fullName: 'Maya Chen',
    email: 'maya.chen@acme.test',
    jobTitle: 'Product Manager',
    department: 'Product',
    hireDate: '2020-09-01',
    baseSalaryMinor: 720000,
    status: EmployeeStatus.Active,
    allowances: [{ type: 'MOBILE', amountMinor: 12000 }],
    deductions: [],
  },
  {
    fullName: 'Karim Nabil',
    email: 'karim.nabil@acme.test',
    jobTitle: 'Product Designer',
    department: 'Product',
    hireDate: '2023-03-14',
    baseSalaryMinor: 480000,
    status: EmployeeStatus.Active,
    allowances: [{ type: 'REMOTE_WORK', amountMinor: 20000 }],
    deductions: [],
  },
  {
    fullName: 'Nora Ibrahim',
    email: 'nora.ibrahim@acme.test',
    jobTitle: 'HR Business Partner',
    department: 'People',
    hireDate: '2021-11-08',
    baseSalaryMinor: 560000,
    status: EmployeeStatus.Active,
    allowances: [{ type: 'TRANSPORT', amountMinor: 30000 }],
    deductions: [],
  },
  {
    fullName: 'Daniel Brooks',
    email: 'daniel.brooks@acme.test',
    jobTitle: 'Talent Acquisition Specialist',
    department: 'People',
    hireDate: '2022-08-22',
    baseSalaryMinor: 390000,
    status: EmployeeStatus.Active,
    allowances: [],
    deductions: [],
  },
  {
    fullName: 'Salma Tarek',
    email: 'salma.tarek@acme.test',
    jobTitle: 'Financial Controller',
    department: 'Finance',
    hireDate: '2019-05-27',
    baseSalaryMinor: 760000,
    status: EmployeeStatus.Active,
    allowances: [{ type: 'HOUSING', amountMinor: 100000 }],
    deductions: [{ type: 'SAVINGS_PLAN', amountMinor: 40000 }],
  },
  {
    fullName: 'Hassan Mahmoud',
    email: 'hassan.mahmoud@acme.test',
    jobTitle: 'Accountant',
    department: 'Finance',
    hireDate: '2024-01-15',
    baseSalaryMinor: 400000,
    status: EmployeeStatus.Active,
    allowances: [{ type: 'TRANSPORT', amountMinor: 25000 }],
    deductions: [],
  },
  {
    fullName: 'Priya Kapoor',
    email: 'priya.kapoor@acme.test',
    jobTitle: 'Account Executive',
    department: 'Sales',
    hireDate: '2022-04-04',
    baseSalaryMinor: 460000,
    status: EmployeeStatus.Active,
    allowances: [{ type: 'COMMISSION', amountMinor: 90000 }],
    deductions: [],
  },
  {
    fullName: 'Adam Wright',
    email: 'adam.wright@acme.test',
    jobTitle: 'Customer Success Manager',
    department: 'Customer Success',
    hireDate: '2023-09-11',
    baseSalaryMinor: 450000,
    status: EmployeeStatus.Active,
    allowances: [{ type: 'MOBILE', amountMinor: 12000 }],
    deductions: [],
  },
  {
    fullName: 'Reem Mostafa',
    email: 'reem.mostafa@acme.test',
    jobTitle: 'Operations Coordinator',
    department: 'Operations',
    hireDate: '2020-07-20',
    baseSalaryMinor: 370000,
    status: EmployeeStatus.Active,
    allowances: [{ type: 'MEAL', amountMinor: 18000 }],
    deductions: [],
  },
  {
    fullName: 'Victor Martinez',
    email: 'victor.martinez@acme.test',
    jobTitle: 'Support Specialist',
    department: 'Customer Success',
    hireDate: '2021-02-10',
    baseSalaryMinor: 340000,
    status: EmployeeStatus.Inactive,
    allowances: [],
    deductions: [],
  },
];
