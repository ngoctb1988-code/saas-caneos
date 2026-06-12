"use client";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
type P=React.ComponentProps<typeof Sonner>;
export function Toaster(props:P){
  const{theme="system"}=useTheme();
  return <Sonner theme={theme as P["theme"]} className="toaster group" position="top-center"
    toastOptions={{classNames:{toast:"group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",description:"group-[.toast]:text-muted-foreground"}}} {...props}/>;
}
