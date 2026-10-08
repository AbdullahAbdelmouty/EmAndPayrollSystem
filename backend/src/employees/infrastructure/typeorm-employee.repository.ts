import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, QueryFailedError, Repository } from 'typeorm';
import { escapeLikePattern } from '../../common/database/escape-like-pattern';
import { PaginatedResult } from '../../common/pagination/paginated-result';
import { Employee } from '../domain/employee';
import { DuplicateEmailError } from '../domain/errors/duplicate-email.error';
import {
  EmployeeRepository,
  EmployeeSearchCriteria,
} from '../domain/employee.repository';
import { EmployeeOrmEntity } from './employee.orm-entity';
import { toDomain, toOrmEntity } from './employee.mapper';
import { EmployeeAllowanceOrmEntity } from './employee-allowances.orm-entity';
import { EmployeeDeductionOrmEntity } from './employee-deductions.orm-entity';

const PG_UNIQUE_VIOLATION = '23505';
const WITH_PAY_ITEMS = ['allowances', 'deductions'];

@Injectable()
export class TypeOrmEmployeeRepository implements EmployeeRepository {
  constructor(
    @InjectRepository(EmployeeOrmEntity)
    private readonly employees: Repository<EmployeeOrmEntity>,
  ) {}

  async findById(id: string): Promise<Employee | null> {
    const entity = await this.employees.findOne({
      where: { id },
      relations: WITH_PAY_ITEMS,
    });
    return entity ? toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<Employee | null> {
    const entity = await this.employees.findOne({
      where: { email: email.trim().toLowerCase() },
      relations: WITH_PAY_ITEMS,
    });
    return entity ? toDomain(entity) : null;
  }

  async search(
    criteria: EmployeeSearchCriteria,
  ): Promise<PaginatedResult<Employee>> {
    const [entities, total] = await this.employees.findAndCount({
      where: this.buildWhere(criteria),
      relations: WITH_PAY_ITEMS,
      order: { fullName: 'ASC', id: 'ASC' },
      skip: (criteria.page - 1) * criteria.pageSize,
      take: criteria.pageSize,
    });
    return {
      items: entities.map(toDomain),
      total,
      page: criteria.page,
      pageSize: criteria.pageSize,
    };
  }

  async save(employee: Employee): Promise<void> {
    const entity = toOrmEntity(employee);
    try {
      await this.employees.manager.transaction(async (manager) => {
        // Pay items have no identity in the domain, so they are replaced as a whole.
        await manager.delete(EmployeeAllowanceOrmEntity, {
          employeeId: entity.id,
        });
        await manager.delete(EmployeeDeductionOrmEntity, {
          employeeId: entity.id,
        });
        await manager.save(entity);
      });
    } catch (error) {
      throw this.translateError(error, employee);
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.employees.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  private buildWhere(
    criteria: EmployeeSearchCriteria,
  ): FindOptionsWhere<EmployeeOrmEntity>[] {
    const filters: FindOptionsWhere<EmployeeOrmEntity> = {};
    if (criteria.department) filters.department = criteria.department;
    if (criteria.status) filters.status = criteria.status;
    if (!criteria.search) return [filters];

    const pattern = ILike(`%${escapeLikePattern(criteria.search)}%`);
    return [
      { ...filters, fullName: pattern },
      { ...filters, email: pattern },
    ];
  }

  // A concurrent insert can slip past the service's email check; the unique index is the last line of defence.
  private translateError(error: unknown, employee: Employee): unknown {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as {
        code?: string;
        detail?: string;
      };
      if (
        driverError.code === PG_UNIQUE_VIOLATION &&
        driverError.detail?.includes('(email)')
      ) {
        return new DuplicateEmailError(employee.email);
      }
    }
    return error;
  }
}
