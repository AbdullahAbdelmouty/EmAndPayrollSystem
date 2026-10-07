import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { readFileSync } from 'fs';
import { payrollConfig } from '../../config/payroll.config';
import {
  PayrollConfigProvider,
  PayrollRules,
} from '../application/payroll-config.provider';
import { InvalidPayrollRulesError } from '../domain/errors/invalid-payroll-rules.error';
import { parsePayrollRules } from './payroll-rules.parser';

@Injectable()
export class JsonPayrollConfigProvider implements PayrollConfigProvider {
  private readonly rules: PayrollRules;

  constructor(
    @Inject(payrollConfig.KEY)
    config: ConfigType<typeof payrollConfig>,
  ) {
    this.rules = parsePayrollRules(readJson(config.rulesPath));
  }

  getRules(): PayrollRules {
    return this.rules;
  }
}

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new InvalidPayrollRulesError(
      `cannot read ${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
