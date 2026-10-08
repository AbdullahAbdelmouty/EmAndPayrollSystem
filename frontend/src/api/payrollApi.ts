import { http, toQueryString } from "@/api/httpClient";
import type { Payslip } from "@/features/payroll/types";

export const payrollApi = {
  getPayslip(
    employeeId: string,
    month: string,
    signal?: AbortSignal,
  ): Promise<Payslip> {
    return http<Payslip>(
      `/employees/${employeeId}/payslip${toQueryString({ month })}`,
      { signal },
    );
  },
};
