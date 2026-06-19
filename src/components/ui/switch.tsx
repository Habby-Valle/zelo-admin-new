"use client";

import { Switch } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

function SwitchComponent({ className, ...props }: Switch.Root.Props) {
  return (
    <Switch.Root
      data-slot="switch"
      className={cn(
        "peer group/switch relative inline-flex h-[18.4px] w-[32px] shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 data-unchecked:bg-input dark:data-unchecked:bg-input/80",
        className
      )}
      {...props}
    >
      <Switch.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform data-checked:translate-x-[calc(100%-2px)] data-unchecked:translate-x-0 dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground"
      />
    </Switch.Root>
  );
}

export { SwitchComponent as Switch };
