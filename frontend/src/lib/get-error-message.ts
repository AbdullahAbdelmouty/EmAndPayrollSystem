import { isApiError } from "@/api/problemDetails";

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.problem.detail ?? error.problem.title;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
