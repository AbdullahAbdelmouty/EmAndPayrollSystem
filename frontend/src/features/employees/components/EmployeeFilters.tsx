import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  EmployeeListQuery,
  EmployeeStatus,
} from "@/features/employees/types";

interface EmployeeFiltersProps {
  filters: EmployeeListQuery;
  onChange: (filters: EmployeeListQuery) => void;
}

export function EmployeeFilters({ filters, onChange }: EmployeeFiltersProps) {
  const update = (values: Partial<EmployeeListQuery>) =>
    onChange({ ...filters, ...values, page: 1 });
  const hasFilters = Boolean(
    filters.search || filters.department || filters.status,
  );

  return (
    <div className="grid gap-3 border-b p-4 sm:grid-cols-[minmax(0,1fr)_12rem_10rem_auto] sm:items-center">
      <label className="relative">
        <span className="sr-only">Search employees</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          className="pl-9"
          onChange={(event) => update({ search: event.target.value })}
          placeholder="Search by name or email"
          value={filters.search ?? ""}
        />
      </label>
      <label>
        <span className="sr-only">Department</span>
        <Input
          onChange={(event) => update({ department: event.target.value })}
          placeholder="Department"
          value={filters.department ?? ""}
        />
      </label>
      <label>
        <span className="sr-only">Status</span>
        <select
          className="flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          onChange={(event) =>
            update({ status: event.target.value as EmployeeStatus | undefined })
          }
          value={filters.status ?? ""}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </label>
      {hasFilters ? (
        <Button
          onClick={() => onChange({ page: 1, pageSize: filters.pageSize })}
          size="sm"
          variant="ghost"
        >
          <X className="size-4" />
          Clear
        </Button>
      ) : (
        <div className="hidden sm:block" />
      )}
    </div>
  );
}
