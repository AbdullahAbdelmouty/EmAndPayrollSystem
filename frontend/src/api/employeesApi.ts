import { http, toQueryString } from "@/api/httpClient";
import type {
  Employee,
  EmployeeInput,
  EmployeeListQuery,
  EmployeePage,
  EmployeeUpdate,
} from "@/features/employees/types";

const EMPLOYEES_PATH = "/employees";

export const employeesApi = {
  list(
    query: EmployeeListQuery = {},
    signal?: AbortSignal,
  ): Promise<EmployeePage> {
    return http<EmployeePage>(`${EMPLOYEES_PATH}${toQueryString(query)}`, {
      signal,
    });
  },

  get(id: string, signal?: AbortSignal): Promise<Employee> {
    return http<Employee>(`${EMPLOYEES_PATH}/${id}`, { signal });
  },

  create(input: EmployeeInput): Promise<Employee> {
    return http<Employee>(EMPLOYEES_PATH, { body: input, method: "POST" });
  },

  update(id: string, input: EmployeeUpdate): Promise<Employee> {
    return http<Employee>(`${EMPLOYEES_PATH}/${id}`, {
      body: input,
      method: "PATCH",
    });
  },

  remove(id: string): Promise<void> {
    return http<void>(`${EMPLOYEES_PATH}/${id}`, { method: "DELETE" });
  },
};
