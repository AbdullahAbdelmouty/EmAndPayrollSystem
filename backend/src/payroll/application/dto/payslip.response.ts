import { ApiProperty } from '@nestjs/swagger';
import { PayslipLine } from '../../domain/payslip';
import { PayslipResult } from '../payroll.service';

export class PayslipLineResponse {
  @ApiProperty({ example: 'INCOME_TAX' }) type!: string;
  @ApiProperty({ description: 'Minor units (cents)' }) amountMinor!: number;

  static from(line: PayslipLine): PayslipLineResponse {
    return { type: line.type, amountMinor: line.amount.toMinorNumber() };
  }
}

export class PayslipEmployeeResponse {
  @ApiProperty() id!: string;
  @ApiProperty() fullName!: string;
  @ApiProperty() jobTitle!: string;
  @ApiProperty() department!: string;
}

export class PayslipResponse {
  @ApiProperty({ type: PayslipEmployeeResponse })
  employee!: PayslipEmployeeResponse;
  @ApiProperty({ example: '2026-03' }) month!: string;
  @ApiProperty({ example: 'USD' }) currency!: string;
  @ApiProperty({ description: 'Minor units (cents)' }) baseSalaryMinor!: number;
  @ApiProperty({ type: [PayslipLineResponse] })
  allowances!: PayslipLineResponse[];
  @ApiProperty({ description: 'Minor units (cents)' })
  grossSalaryMinor!: number;
  @ApiProperty({ type: [PayslipLineResponse] })
  statutoryDeductions!: PayslipLineResponse[];
  @ApiProperty({ type: [PayslipLineResponse] })
  otherDeductions!: PayslipLineResponse[];
  @ApiProperty({ description: 'Minor units (cents)' })
  totalDeductionsMinor!: number;
  @ApiProperty({ description: 'Minor units (cents)' }) netSalaryMinor!: number;

  static from({
    employee,
    month,
    currency,
    payslip,
  }: PayslipResult): PayslipResponse {
    return {
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        jobTitle: employee.jobTitle,
        department: employee.department,
      },
      month,
      currency,
      baseSalaryMinor: payslip.baseSalary.toMinorNumber(),
      allowances: payslip.allowances.map(PayslipLineResponse.from),
      grossSalaryMinor: payslip.grossSalary.toMinorNumber(),
      statutoryDeductions: payslip.statutoryDeductions.map(
        PayslipLineResponse.from,
      ),
      otherDeductions: payslip.otherDeductions.map(PayslipLineResponse.from),
      totalDeductionsMinor: payslip.totalDeductions.toMinorNumber(),
      netSalaryMinor: payslip.netSalary.toMinorNumber(),
    };
  }
}
