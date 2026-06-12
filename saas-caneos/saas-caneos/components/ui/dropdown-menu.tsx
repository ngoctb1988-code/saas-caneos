"use client";
import * as React from "react";
import * as DMP from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
const DropdownMenu=DMP.Root,DropdownMenuTrigger=DMP.Trigger;
const DropdownMenuContent=React.forwardRef<React.ElementRef<typeof DMP.Content>,React.ComponentPropsWithoutRef<typeof DMP.Content>>(({className,sideOffset=4,...props},ref)=>(
  <DMP.Portal><DMP.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 min-w-[10rem] overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",className)} {...props}/></DMP.Portal>));
DropdownMenuContent.displayName="DropdownMenuContent";
const DropdownMenuItem=React.forwardRef<React.ElementRef<typeof DMP.Item>,React.ComponentPropsWithoutRef<typeof DMP.Item>&{inset?:boolean}>(({className,inset,...props},ref)=>(
  <DMP.Item ref={ref} className={cn("relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4",inset&&"pl-8",className)} {...props}/>));
DropdownMenuItem.displayName="DropdownMenuItem";
const DropdownMenuLabel=React.forwardRef<React.ElementRef<typeof DMP.Label>,React.ComponentPropsWithoutRef<typeof DMP.Label>>(({className,...props},ref)=>(
  <DMP.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold",className)} {...props}/>));
DropdownMenuLabel.displayName="DropdownMenuLabel";
const DropdownMenuSeparator=React.forwardRef<React.ElementRef<typeof DMP.Separator>,React.ComponentPropsWithoutRef<typeof DMP.Separator>>(({className,...props},ref)=>(
  <DMP.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border",className)} {...props}/>));
DropdownMenuSeparator.displayName="DropdownMenuSeparator";
export {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator};
