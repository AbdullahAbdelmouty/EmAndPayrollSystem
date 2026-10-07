import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PaginatedResult } from '../../common/pagination/paginated-result';
import { CLOCK, Clock } from '../../common/time/clock';
import { Employee } from '../domain/employee';
import { EmployeeStatus } from '../domain/employee-status.enum';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from '../domain/employee.repository';
import { DuplicateEmailError } from '../domain/errors/duplicate-email.error';
import { EmployeeNotFoundError } from '../domain/errors/employee-not-found.error';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ListEmployeesQuery } from './dto/list-employees.query';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly repository: EmployeeRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const employee = Employee.create(
      { id: randomUUID(), ...dto },
      this.clock.now(),
    );
    await this.ensureEmailAvailable(employee.email);
    await this.repository.save(employee);
    return employee;
  }

  async get(id: string): Promise<Employee> {
    const employee = await this.repository.findById(id);
    if (!employee) throw new EmployeeNotFoundError(id);
    return employee;
  }

  list(query: ListEmployeesQuery): Promise<PaginatedResult<Employee>> {
    const { search, department, status, page, pageSize } = query;
    return this.repository.search({
      search,
      department,
      status,
      page,
      pageSize,
    });
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const current = await this.get(id);
    const { status, ...changes } = dto;

    let updated = current.update(changes, this.clock.now());
    if (status !== undefined) updated = this.withStatus(updated, status);
    if (updated.email !== current.email)
      await this.ensureEmailAvailable(updated.email, current.id);

    await this.repository.save(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new EmployeeNotFoundError(id);
  }

  private withStatus(employee: Employee, status: EmployeeStatus): Employee {
    return status === EmployeeStatus.Active
      ? employee.activate()
      : employee.deactivate();
  }

  private async ensureEmailAvailable(
    email: string,
    ownerId?: string,
  ): Promise<void> {
    const existing = await this.repository.findByEmail(email);
    if (existing && existing.id !== ownerId)
      throw new DuplicateEmailError(email);
  }
}
