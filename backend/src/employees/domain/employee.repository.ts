import { PaginatedResult } from '../../common/pagination/paginated-result';
import { Employee } from './employee';
import { EmployeeStatus } from './employee-status.enum';

export interface EmployeeSearchCriteria {
  search?: string; // matches full name or email
  department?: string;
  status?: EmployeeStatus;
  page: number;
  pageSize: number;
}

export interface EmployeeRepository {
  findById(id: string): Promise<Employee | null>;
  findByEmail(email: string): Promise<Employee | null>;
  search(criteria: EmployeeSearchCriteria): Promise<PaginatedResult<Employee>>;
  save(employee: Employee): Promise<void>; // insert or update
  delete(id: string): Promise<boolean>; // false when nothing was deleted
}

export const EMPLOYEE_REPOSITORY = Symbol('EmployeeRepository');
