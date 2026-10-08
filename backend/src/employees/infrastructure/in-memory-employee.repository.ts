import { PaginatedResult } from '../../common/pagination/paginated-result';
import { Employee } from '../domain/employee';
import { DuplicateEmailError } from '../domain/errors/duplicate-email.error';
import {
  EmployeeRepository,
  EmployeeSearchCriteria,
} from '../domain/employee.repository';

export class InMemoryEmployeeRepository implements EmployeeRepository {
  private readonly store = new Map<string, Employee>();

  findById(id: string): Promise<Employee | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findByEmail(email: string): Promise<Employee | null> {
    return Promise.resolve(
      this.findByNormalizedEmail(email.trim().toLowerCase()) ?? null,
    );
  }

  search(criteria: EmployeeSearchCriteria): Promise<PaginatedResult<Employee>> {
    const matches = [...this.store.values()]
      .filter((employee) => this.matches(employee, criteria))
      .sort(
        (a, b) =>
          a.fullName.localeCompare(b.fullName) || a.id.localeCompare(b.id),
      );

    const start = (criteria.page - 1) * criteria.pageSize;
    return Promise.resolve({
      items: matches.slice(start, start + criteria.pageSize),
      total: matches.length,
      page: criteria.page,
      pageSize: criteria.pageSize,
    });
  }

  save(employee: Employee): Promise<void> {
    const owner = this.findByNormalizedEmail(employee.email);
    if (owner && owner.id !== employee.id) {
      return Promise.reject(new DuplicateEmailError(employee.email));
    }
    this.store.set(employee.id, employee);
    return Promise.resolve();
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(this.store.delete(id));
  }

  private findByNormalizedEmail(email: string): Employee | undefined {
    return [...this.store.values()].find(
      (employee) => employee.email === email,
    );
  }

  private matches(
    employee: Employee,
    { search, department, status }: EmployeeSearchCriteria,
  ): boolean {
    if (department && employee.department !== department) return false;
    if (status && employee.status !== status) return false;
    if (!search) return true;
    const needle = search.toLowerCase();
    return (
      employee.fullName.toLowerCase().includes(needle) ||
      employee.email.includes(needle)
    );
  }
}
