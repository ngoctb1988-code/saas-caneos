"use client";
import { ThemeProvider as NTP } from "next-themes";
export function ThemeProvider({children,...props}:React.ComponentProps<typeof NTP>){return <NTP {...props}>{children}</NTP>;}
