import { useCallback, useEffect, useMemo, useState } from "react";

import { employeesApi } from "@/api/employeesApi";
import { isRequestCanceled } from "@/api/httpClient";
import type {
  Employee,
  EmployeeListQuery,
  EmployeePage,
} from "@/features/employees/types";

interface ResourceState<T> {
  data: T | null;
  error: unknown;
  isLoading: boolean;
  key?: string;
}

const initialPage: EmployeePage = {
  items: [],
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
};

export function useEmployees(query: EmployeeListQuery = {}) {
  const [state, setState] = useState<ResourceState<EmployeePage>>({
    data: null,
    error: null,
    isLoading: true,
  });
  const queryKey = JSON.stringify(query);
  const stableQuery = useMemo(
    () => JSON.parse(queryKey) as EmployeeListQuery,
    [queryKey],
  );
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void employeesApi.list(stableQuery, controller.signal).then(
      (data) =>
        setState({ data, error: null, isLoading: false, key: queryKey }),
      (error: unknown) => {
        if (isRequestCanceled(error)) return;
        setState({ data: null, error, isLoading: false, key: queryKey });
      },
    );

    return () => controller.abort();
  }, [queryKey, reloadVersion, stableQuery]);

  return {
    employees:
      state.key === queryKey
        ? (state.data?.items ?? initialPage.items)
        : initialPage.items,
    page: state.key === queryKey ? (state.data ?? initialPage) : initialPage,
    error: state.key === queryKey ? state.error : null,
    isLoading: state.isLoading || state.key !== queryKey,
    refresh: useCallback(() => setReloadVersion((version) => version + 1), []),
  };
}

export function useEmployee(id: string | undefined) {
  const [state, setState] = useState<ResourceState<Employee>>({
    data: null,
    error: null,
    isLoading: Boolean(id),
  });
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    void employeesApi.get(id, controller.signal).then(
      (data) => setState({ data, error: null, isLoading: false, key: id }),
      (error: unknown) => {
        if (isRequestCanceled(error)) return;
        setState({ data: null, error, isLoading: false, key: id });
      },
    );

    return () => controller.abort();
  }, [id, reloadVersion]);

  return {
    employee: state.key === id ? state.data : null,
    error: state.key === id ? state.error : null,
    isLoading: Boolean(id) && (state.isLoading || state.key !== id),
    refresh: useCallback(() => setReloadVersion((version) => version + 1), []),
  };
}
