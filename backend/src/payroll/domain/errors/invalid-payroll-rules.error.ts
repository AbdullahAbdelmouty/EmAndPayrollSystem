export class InvalidPayrollRulesError extends Error {
  constructor(reason: string) {
    super(`Invalid payroll rules: ${reason}`);
    this.name = 'InvalidPayrollRulesError';
  }
}
