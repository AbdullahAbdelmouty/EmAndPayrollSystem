import { BusinessRuleViolationError } from '../../../common/errors/domain.error';

export class InactiveEmployeeError extends BusinessRuleViolationError {
  readonly code = 'PAYSLIP_EMPLOYEE_INACTIVE';

  constructor(employeeId: string) {
    super(
      `Employee ${employeeId} is inactive, so no payslip can be generated.`,
    );
  }
}
