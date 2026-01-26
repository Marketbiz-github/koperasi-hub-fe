'use client';

import { ReactNode, useEffect } from "react";
import { AppSidebar } from "./components/sidebar";
import { SiteHeader } from "./components/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { AccessDenied } from "@/components/access-denied";

export function KoperasiLayoutClient({ children }: { children: ReactNode }) {
  const { user, hydrate, isHydrated } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // ⏳ Tunggu auth selesai dicek
  if (!isHydrated) return null;

  // Jika tidak ada user, redirect dilakukan via useLayoutEffect
  if (!user) {
    return null;
  }

  // Jika user ada tapi role tidak sesuai, show access denied
  if (user.role !== 'koperasi') {
    return <AccessDenied />;
  }

  // Role sesuai, render dashboard
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
