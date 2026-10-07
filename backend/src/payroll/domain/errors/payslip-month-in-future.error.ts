import { BusinessRuleViolationError } from '../../../common/errors/domain.error';

export class PayslipMonthInFutureError extends BusinessRuleViolationError {
  readonly code = 'PAYSLIP_MONTH_IN_FUTURE';

  constructor(month: string) {
    super(`Month ${month} is in the future, so no payslip can be generated.`);
  }
}
