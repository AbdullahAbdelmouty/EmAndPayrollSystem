import { PaginatedResult } from '../../common/pagination/paginated-result';
import { Employee } from '../domain/employee';
import { DuplicateEmailError } from '../domain/errors/duplicate-email.error';
import {
  EmployeeRepository,
  EmployeeSearchCriteria,
} from '../domain/employee.repository';

export class InMemoryEmployeeRepository implements EmployeeRepository {
  private readonly store = new Map<string, Employee>();

  async findById(id: string): Promise<Employee | null> {
    return this.store.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return this.findByNormalizedEmail(email.trim().toLowerCase()) ?? null;
  }

  async search(
    criteria: EmployeeSearchCriteria,
  ): Promise<PaginatedResult<Employee>> {
    const matches = [...this.store.values()]
      .filter((employee) => this.matches(employee, criteria))
      .sort(
        (a, b) =>
          a.fullName.localeCompare(b.fullName) || a.id.localeCompare(b.id),
      );

    const start = (criteria.page - 1) * criteria.pageSize;
    return {
      items: matches.slice(start, start + criteria.pageSize),
      total: matches.length,
      page: criteria.page,
      pageSize: criteria.pageSize,
    };
  }

  async save(employee: Employee): Promise<void> {
    const owner = this.findByNormalizedEmail(employee.email);
    if (owner && owner.id !== employee.id)
      throw new DuplicateEmailError(employee.email);
    this.store.set(employee.id, employee);
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
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
