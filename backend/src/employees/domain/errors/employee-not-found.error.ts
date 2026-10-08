import { NotFoundError } from '../../../common/errors/domain.error';

export class EmployeeNotFoundError extends NotFoundError {
  readonly code = 'EMPLOYEE_NOT_FOUND';

  constructor(employeeId: string) {
    super(`Employee ${employeeId} was not found.`);
  }
}
