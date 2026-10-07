import { useCallback, useState } from "react";

import { employeesApi } from "@/api/employeesApi";
import type {
  Employee,
  EmployeeInput,
  EmployeeUpdate,
} from "@/features/employees/types";

interface MutationState {
  error: unknown;
  isPending: boolean;
}

export function useEmployeeMutations() {
  const [state, setState] = useState<MutationState>({
    error: null,
    isPending: false,
  });

  const run = useCallback(async <T>(mutation: () => Promise<T>): Promise<T> => {
    setState({ error: null, isPending: true });
    try {
      return await mutation();
    } catch (error) {
      setState({ error, isPending: false });
      throw error;
    } finally {
      setState((current) =>
        current.error ? current : { error: null, isPending: false },
      );
    }
  }, []);

  return {
    createEmployee: (input: EmployeeInput): Promise<Employee> =>
      run(() => employeesApi.create(input)),
    updateEmployee: (id: string, input: EmployeeUpdate): Promise<Employee> =>
      run(() => employeesApi.update(id, input)),
    deleteEmployee: (id: string): Promise<void> =>
      run(() => employeesApi.remove(id)),
    error: state.error,
    isPending: state.isPending,
    reset: () => setState({ error: null, isPending: false }),
  };
}
