import { Building2, Menu, ReceiptText, UsersRound, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Section = "employees" | "payroll";
interface AppShellProps {
  children: ReactNode;
  activeSection: Section;
}
const navItems = [
  { id: "employees", label: "Employees", icon: UsersRound },
  { id: "payroll", label: "Payroll", icon: ReceiptText },
] as const;

export function AppShell({ children, activeSection }: AppShellProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-background lg:flex">
      {open ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setOpen(false)}
          type="button"
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col bg-slate-950 px-3 py-5 text-slate-300 transition-transform lg:sticky lg:translate-x-0",
          open && "translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-2 pb-8">
          <a
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-white"
            href="#employees"
          >
            <span className="grid size-8 place-items-center rounded-md bg-primary">
              <Building2 className="size-4" />
            </span>
            Payroll
          </a>
          <Button
            aria-label="Close navigation"
            className="lg:hidden"
            onClick={() => setOpen(false)}
            size="icon"
            variant="ghost"
          >
            <X className="size-5" />
          </Button>
        </div>
        <nav aria-label="Primary navigation" className="grid gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = item.id === activeSection;
            return (
              <a
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white",
                  selected && "bg-slate-800 text-white",
                )}
                href={`#${item.id}`}
                key={item.id}
                onClick={() => setOpen(false)}
              >
                <Icon className="size-4" />
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 px-2 pt-4">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              HR
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-white">
                HR workspace
              </span>
              <span className="block truncate text-xs text-slate-500">
                Employee management
              </span>
            </span>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center border-b bg-card px-4 lg:px-8">
          <Button
            aria-expanded={open}
            aria-label="Open navigation"
            className="mr-2 lg:hidden"
            onClick={() => setOpen(true)}
            size="icon"
            variant="ghost"
          >
            <Menu className="size-5" />
          </Button>
          <p className="text-sm font-semibold text-slate-700">
            {activeSection === "payroll" ? "Payroll" : "Employee Management"}
          </p>
          <span className="ml-auto grid size-8 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            HR
          </span>
        </header>
        <main className="mx-auto max-w-7xl p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
