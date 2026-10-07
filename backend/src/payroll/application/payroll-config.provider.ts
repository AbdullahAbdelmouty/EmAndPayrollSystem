export interface TaxBracketRule {
  upToMinor: number | null;
  ratePercent: number;
}

export interface PayrollRules {
  currency: string;
  incomeTax: { brackets: TaxBracketRule[] };
  socialInsurance: {
    ratePercent: number;
    insurableSalaryCapMinor: number | null;
  };
}

export interface PayrollConfigProvider {
  getRules(): PayrollRules;
}

export const PAYROLL_CONFIG_PROVIDER = Symbol('PayrollConfigProvider');
