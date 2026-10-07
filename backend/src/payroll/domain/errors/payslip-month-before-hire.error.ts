import { BusinessRuleViolationError } from '../../../common/errors/domain.error';

export class PayslipMonthBeforeHireError extends BusinessRuleViolationError {
  readonly code = 'PAYSLIP_MONTH_BEFORE_HIRE';

  constructor(month: string, hireDate: string) {
    super(`Month ${month} is before the employee's hire date (${hireDate}).`);
  }
}
