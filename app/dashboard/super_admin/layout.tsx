'use client'

import { AppSidebar } from "../vendor/components/sidebar";
import { SiteHeader } from "../vendor/components/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { AccessDenied } from "@/components/access-denied";
import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const { user, hydrate, isHydrated } = useAuthStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (isHydrated && !user) {
      router.push('/login');
    }
  }, [isHydrated, user, router]);

  // ⏳ Tunggu auth selesai dicek
  if (!isHydrated || !user) return null

  // Jika user ada tapi role tidak sesuai, show access denied
  if (user.role !== 'super_admin') {
    return <AccessDenied allowedRole="super_admin" />
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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
