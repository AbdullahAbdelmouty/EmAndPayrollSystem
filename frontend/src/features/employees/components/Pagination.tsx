import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { EmployeePage } from "@/features/employees/types";

interface PaginationProps {
  page: EmployeePage;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, onPageChange }: PaginationProps) {
  if (page.total === 0) return null;
  const from = (page.page - 1) * page.pageSize + 1;
  const to = Math.min(page.page * page.pageSize, page.total);
  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing {from}–{to} of {page.total} employees
      </p>
      <div className="flex gap-2">
        <Button
          aria-label="Previous page"
          disabled={page.page <= 1}
          onClick={() => onPageChange(page.page - 1)}
          size="sm"
          variant="outline"
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          aria-label="Next page"
          disabled={page.page >= page.totalPages}
          onClick={() => onPageChange(page.page + 1)}
          size="sm"
          variant="outline"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
