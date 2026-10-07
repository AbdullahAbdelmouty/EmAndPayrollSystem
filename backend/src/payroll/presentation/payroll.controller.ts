import { Controller, Get, ParseUUIDPipe, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { PayslipQuery } from '../application/dto/payslip.query';
import { PayslipResponse } from '../application/dto/payslip.response';
import { PayrollService } from '../application/payroll.service';

@ApiTags('Payroll')
@Controller({
  path: 'employees',
  version: process.env.API_VERSION,
})
export class PayrollController {
  constructor(private readonly payroll: PayrollService) {}

  @Get(':id/payslip')
  @ApiOperation({ summary: 'Monthly payslip for an employee' })
  @ApiOkResponse({ type: PayslipResponse })
  @ApiNotFoundResponse({ description: 'Employee not found.' })
  @ApiUnprocessableEntityResponse({
    description:
      'Employee inactive, month before hire or in the future, or deductions exceed gross.',
  })
  async getPayslip(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PayslipQuery,
  ): Promise<PayslipResponse> {
    return PayslipResponse.from(await this.payroll.getPayslip(id, query.month));
  }
}
