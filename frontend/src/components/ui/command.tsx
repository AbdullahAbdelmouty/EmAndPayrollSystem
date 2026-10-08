import { Command as CommandPrimitive } from "cmdk";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Command({ className, ...props }: ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive className={cn("flex h-full w-full flex-col overflow-hidden rounded-md", className)} {...props} />;
}

function CommandInput({ className, ...props }: ComponentProps<typeof CommandPrimitive.Input>) {
  return <CommandPrimitive.Input className={cn("h-10 w-full border-b bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground", className)} {...props} />;
}

function CommandList({ className, ...props }: ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List className={cn("max-h-60 overflow-y-auto overflow-x-hidden p-1", className)} {...props} />;
}

function CommandEmpty({ className, ...props }: ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className={cn("px-3 py-6 text-center text-sm text-muted-foreground", className)} {...props} />;
}

function CommandGroup({ className, ...props }: ComponentProps<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group className={cn("overflow-hidden p-1 text-foreground", className)} {...props} />;
}

function CommandItem({ className, ...props }: ComponentProps<typeof CommandPrimitive.Item>) {
  return <CommandPrimitive.Item className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-muted data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50", className)} {...props} />;
}

export { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList };
