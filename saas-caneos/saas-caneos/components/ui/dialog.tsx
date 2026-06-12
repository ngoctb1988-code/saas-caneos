"use client";
import * as React from "react";
import * as DP from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const Dialog=DP.Root,DialogTrigger=DP.Trigger,DialogClose=DP.Close;
const DialogOverlay=React.forwardRef<React.ElementRef<typeof DP.Overlay>,React.ComponentPropsWithoutRef<typeof DP.Overlay>>(({className,...props},ref)=>(
  <DP.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",className)} {...props}/>));
DialogOverlay.displayName="DialogOverlay";
const DialogContent=React.forwardRef<React.ElementRef<typeof DP.Content>,React.ComponentPropsWithoutRef<typeof DP.Content>>(({className,children,...props},ref)=>(
  <DP.Portal><DialogOverlay/>
    <DP.Content ref={ref} className={cn("fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",className)} {...props}>
      {children}
      <DP.Close className="absolute right-4 top-4 rounded-md opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"><X className="h-4 w-4"/><span className="sr-only">Đóng</span></DP.Close>
    </DP.Content>
  </DP.Portal>));
DialogContent.displayName="DialogContent";
const DialogHeader=({className,...props}:React.HTMLAttributes<HTMLDivElement>)=><div className={cn("flex flex-col space-y-1.5 text-left",className)} {...props}/>;
const DialogFooter=({className,...props}:React.HTMLAttributes<HTMLDivElement>)=><div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",className)} {...props}/>;
const DialogTitle=React.forwardRef<React.ElementRef<typeof DP.Title>,React.ComponentPropsWithoutRef<typeof DP.Title>>(({className,...props},ref)=>(
  <DP.Title ref={ref} className={cn("text-lg font-semibold",className)} {...props}/>));
DialogTitle.displayName="DialogTitle";
export {Dialog,DialogTrigger,DialogClose,DialogContent,DialogHeader,DialogFooter,DialogTitle};
