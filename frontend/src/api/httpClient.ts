import axios, { type AxiosRequestConfig } from "axios";

import { ApiError, type ProblemDetails } from "@/api/problemDetails";

const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? "/api"}/v1`;

export interface RequestOptions extends Omit<AxiosRequestConfig, "data" | "url"> {
  body?: unknown;
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: "application/json, application/problem+json" },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    if (axios.isAxiosError(error)) return Promise.reject(new ApiError(toProblemDetails(error)));
    return Promise.reject(error);
  },
);

export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, ...config } = options;
  const response = await httpClient.request<T>({
    ...config,
    data: body,
    url: path,
  });
  return response.data;
}

export function toQueryString(query: object): string {
  const search = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (typeof value === "string" || typeof value === "number") {
      if (value !== "") search.set(key, String(value));
    }
  });

  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}

export function isRequestCanceled(error: unknown): boolean {
  return axios.isCancel(error);
}

function toProblemDetails(error: { response?: { data?: unknown; status: number; statusText: string } }): ProblemDetails {
  const problem = error.response?.data;
  if (isProblemDetails(problem)) return problem;

  return {
    type: "about:blank",
    title: error.response?.statusText || "Request failed",
    status: error.response?.status ?? 0,
  };
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return typeof value === "object" && value !== null && "title" in value && "status" in value;
}
