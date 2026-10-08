import { registerAs } from '@nestjs/config';
import { join } from 'path';

export const payrollConfig = registerAs('payroll', () => ({
  rulesPath:
    process.env.PAYROLL_RULES_PATH ?? join(__dirname, 'payroll-rules.json'),
}));
