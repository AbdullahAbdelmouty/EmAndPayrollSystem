import { useCallback, useEffect, useState } from "react";

import { payrollApi } from "@/api/payrollApi";
import { isRequestCanceled } from "@/api/httpClient";
import type { Payslip } from "@/features/payroll/types";

interface PayslipState {
  data: Payslip | null;
  error: unknown;
  isLoading: boolean;
  key?: string;
}

export function usePayslip(employeeId?: string, month?: string) {
  const [state, setState] = useState<PayslipState>({
    data: null,
    error: null,
    isLoading: false,
  });
  const [reloadVersion, setReloadVersion] = useState(0);
  const key = employeeId && month ? `${employeeId}:${month}` : undefined;

  useEffect(() => {
    if (!employeeId || !month || !key) return;

    const controller = new AbortController();
    void payrollApi.getPayslip(employeeId, month, controller.signal).then(
      (data) => setState({ data, error: null, isLoading: false, key }),
      (error: unknown) => {
        if (isRequestCanceled(error)) return;
        setState({ data: null, error, isLoading: false, key });
      },
    );

    return () => controller.abort();
  }, [employeeId, key, month, reloadVersion]);

  return {
    payslip: state.key === key ? state.data : null,
    error: state.key === key ? state.error : null,
    isLoading: Boolean(key) && (state.key !== key || state.isLoading),
    refresh: useCallback(() => setReloadVersion((version) => version + 1), []),
  };
}
