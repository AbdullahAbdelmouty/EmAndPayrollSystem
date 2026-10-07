import { Deduction } from './deductions/deduction';
import { DeductionsExceedGrossError } from './errors/deductions-exceed-gross.error';
import { Money } from './money';
import { Payslip, PayslipLine } from './payslip';

export interface PayrollInput {
  baseSalary: Money;
  allowances: readonly PayslipLine[];
  otherDeductions: readonly PayslipLine[];
}

export class PayrollCalculator {
  constructor(private readonly statutoryDeductions: readonly Deduction[]) {}

  calculate(input: PayrollInput): Payslip {
    const grossSalary = Money.sum([
      input.baseSalary,
      ...input.allowances.map((allowance) => allowance.amount),
    ]);
    const context = { baseSalary: input.baseSalary, grossSalary };

    const statutoryDeductions = this.statutoryDeductions.map((deduction) => ({
      type: deduction.type,
      amount: deduction.calculate(context),
    }));
    const totalDeductions = Money.sum(
      [...statutoryDeductions, ...input.otherDeductions].map(
        (line) => line.amount,
      ),
    );

    const netSalary = grossSalary.subtract(totalDeductions);
    if (netSalary.isNegative()) {
      throw new DeductionsExceedGrossError(grossSalary, totalDeductions);
    }

    return {
      baseSalary: input.baseSalary,
      allowances: input.allowances,
      grossSalary,
      statutoryDeductions,
      otherDeductions: input.otherDeductions,
      totalDeductions,
      netSalary,
    };
  }
}
