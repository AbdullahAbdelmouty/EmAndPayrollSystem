import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TimeModule } from '../common/time/time.module';
import { payrollConfig } from '../config/payroll.config';
import { EmployeesModule } from '../employees/employees.module';
import { buildPayrollCalculator } from './application/payroll-calculator.factory';
import {
  PAYROLL_CONFIG_PROVIDER,
  PayrollConfigProvider,
} from './application/payroll-config.provider';
import { PayrollService } from './application/payroll.service';
import { PayrollCalculator } from './domain/payroll-calculator';
import { JsonPayrollConfigProvider } from './infrastructure/json-payroll-config.provider';
import { PayrollController } from './presentation/payroll.controller';

@Module({
  imports: [
    ConfigModule.forFeature(payrollConfig),
    EmployeesModule,
    TimeModule,
  ],
  controllers: [PayrollController],
  providers: [
    PayrollService,
    { provide: PAYROLL_CONFIG_PROVIDER, useClass: JsonPayrollConfigProvider },
    {
      provide: PayrollCalculator,
      inject: [PAYROLL_CONFIG_PROVIDER],
      useFactory: (config: PayrollConfigProvider) =>
        buildPayrollCalculator(config.getRules()),
    },
  ],
})
export class PayrollModule {}
