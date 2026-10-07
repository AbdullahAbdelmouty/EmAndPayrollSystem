import { DomainValidationError } from '../../common/errors/domain.error';
import {
  EmployeeDetails,
  EmployeeDetailsInput,
  normalizeDetails,
  PayItem,
} from './employee-details';
import { EmployeeStatus } from './employee-status.enum';
import { validateEmployeeDetails } from './employee.validation';

export interface EmployeeState extends EmployeeDetails {
  id: string;
  status: EmployeeStatus;
}

export type NewEmployee = EmployeeDetailsInput & {
  id: string;
  status?: EmployeeStatus;
};

export class Employee {
  private constructor(private readonly state: EmployeeState) {}

  // Validates and normalizes. `today` is passed in so the "hire date not in the future" rule is testable.
  static create(input: NewEmployee, today: Date): Employee {
    const details = Employee.validated(Employee.withDefaults(input), today);
    return new Employee({
      id: input.id,
      status: input.status ?? EmployeeStatus.Active,
      ...details,
    });
  }

  // Rebuilds an employee from trusted persisted data without re-running creation rules.
  static rehydrate(state: EmployeeState): Employee {
    return new Employee(copyState(state));
  }

  update(changes: Partial<EmployeeDetailsInput>, today: Date): Employee {
    const details = Employee.validated(
      { ...this.details(), ...definedOnly(changes) },
      today,
    );
    return new Employee({ ...this.state, ...details });
  }

  activate(): Employee {
    return new Employee({ ...this.state, status: EmployeeStatus.Active });
  }

  deactivate(): Employee {
    return new Employee({ ...this.state, status: EmployeeStatus.Inactive });
  }

  isActive(): boolean {
    return this.state.status === EmployeeStatus.Active;
  }

  get id(): string {
    return this.state.id;
  }
  get fullName(): string {
    return this.state.fullName;
  }
  get email(): string {
    return this.state.email;
  }
  get jobTitle(): string {
    return this.state.jobTitle;
  }
  get department(): string {
    return this.state.department;
  }
  get hireDate(): string {
    return this.state.hireDate;
  }
  get baseSalaryMinor(): number {
    return this.state.baseSalaryMinor;
  }
  get status(): EmployeeStatus {
    return this.state.status;
  }
  get allowances(): PayItem[] {
    return this.state.allowances.map((item) => ({ ...item }));
  }
  get deductions(): PayItem[] {
    return this.state.deductions.map((item) => ({ ...item }));
  }

  toState(): EmployeeState {
    return copyState(this.state);
  }

  private details(): EmployeeDetails {
    const { id, status, ...details } = this.state;
    return details;
  }

  private static withDefaults(input: EmployeeDetailsInput): EmployeeDetails {
    return {
      ...input,
      allowances: input.allowances ?? [],
      deductions: input.deductions ?? [],
    };
  }

  private static validated(
    details: EmployeeDetails,
    today: Date,
  ): EmployeeDetails {
    const normalized = normalizeDetails(details);
    const errors = validateEmployeeDetails(normalized, today);
    if (errors.length > 0) throw new DomainValidationError(errors);
    return normalized;
  }
}

function copyState(state: EmployeeState): EmployeeState {
  return {
    ...state,
    allowances: state.allowances.map((item) => ({ ...item })),
    deductions: state.deductions.map((item) => ({ ...item })),
  };
}

function definedOnly<T extends object>(changes: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(changes).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
