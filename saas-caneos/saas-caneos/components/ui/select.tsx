"use client";
import * as React from "react";
import * as SP from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
const Select=SP.Root,SelectGroup=SP.Group,SelectValue=SP.Value;
const SelectTrigger=React.forwardRef<React.ElementRef<typeof SP.Trigger>,React.ComponentPropsWithoutRef<typeof SP.Trigger>>(({className,children,...props},ref)=>(
  <SP.Trigger ref={ref} className={cn("flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 [&>span]:line-clamp-1",className)} {...props}>
    {children}<SP.Icon asChild><ChevronDown className="h-4 w-4 opacity-60"/></SP.Icon>
  </SP.Trigger>));
SelectTrigger.displayName="SelectTrigger";
const SelectContent=React.forwardRef<React.ElementRef<typeof SP.Content>,React.ComponentPropsWithoutRef<typeof SP.Content>>(({className,children,position="popper",...props},ref)=>(
  <SP.Portal><SP.Content ref={ref} position={position} className={cn("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",position==="popper"&&"data-[side=bottom]:translate-y-1",className)} {...props}>
    <SP.Viewport className={cn("p-1",position==="popper"&&"w-full min-w-[var(--radix-select-trigger-width)]")}>{children}</SP.Viewport>
  </SP.Content></SP.Portal>));
SelectContent.displayName="SelectContent";
const SelectItem=React.forwardRef<React.ElementRef<typeof SP.Item>,React.ComponentPropsWithoutRef<typeof SP.Item>>(({className,children,...props},ref)=>(
  <SP.Item ref={ref} className={cn("relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"><SP.ItemIndicator><Check className="h-4 w-4"/></SP.ItemIndicator></span>
    <SP.ItemText>{children}</SP.ItemText>
  </SP.Item>));
SelectItem.displayName="SelectItem";
export {Select,SelectGroup,SelectValue,SelectTrigger,SelectContent,SelectItem};
