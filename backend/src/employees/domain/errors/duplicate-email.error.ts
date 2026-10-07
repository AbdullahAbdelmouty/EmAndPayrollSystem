import { ConflictError } from '../../../common/errors/domain.error';

export class DuplicateEmailError extends ConflictError {
  readonly code = 'EMPLOYEE_EMAIL_ALREADY_EXISTS';

  constructor(email: string) {
    super(`An employee with email ${email} already exists.`);
  }
}
