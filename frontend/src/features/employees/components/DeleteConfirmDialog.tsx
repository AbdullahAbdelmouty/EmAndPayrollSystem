import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DeleteConfirmDialogProps {
  employeeName: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  employeeName,
  isPending,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <div
      aria-labelledby="delete-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl">
        <div className="flex size-10 items-center justify-center rounded-full bg-rose-50 text-destructive">
          <AlertTriangle className="size-5" />
        </div>
        <h2 className="mt-4 text-lg font-semibold" id="delete-title">
          Delete {employeeName}?
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This employee record will be permanently removed. This action cannot
          be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button disabled={isPending} onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={onConfirm}
            variant="destructive"
          >
            {isPending ? "Deleting…" : "Delete employee"}
          </Button>
        </div>
      </div>
    </div>
  );
}
