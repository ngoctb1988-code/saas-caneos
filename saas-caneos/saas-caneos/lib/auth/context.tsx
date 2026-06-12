"use client";
import * as React from "react";
import type { StoreRole } from "@/lib/types";
import { can, type Permission } from "./permissions";

interface StoreContextValue {
  storeId: string;
  storeName: string;
  role: StoreRole;
  userId: string;
}

const StoreCtx = React.createContext<StoreContextValue | null>(null);

export function StoreProvider({
  children, storeId, storeName, role, userId,
}: StoreContextValue & { children: React.ReactNode }) {
  return (
    <StoreCtx.Provider value={{ storeId, storeName, role, userId }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = React.useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}

export function useCan(permission: Permission): boolean {
  const { role } = useStore();
  return can(role, permission);
}
