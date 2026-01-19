'use client'

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useLayoutEffect } from "react";
import { AccessDenied } from "@/components/access-denied";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useLayoutEffect(() => {
    // Jika tidak ada user, redirect ke login
    if (!user) {
      router.replace('/login');
      return;
    }

    // Jika user ada tapi role tidak sesuai, tidak perlu redirect
    // layout akan show access denied
  }, [user, router]);

  // Jika tidak ada user, redirect dilakukan via useLayoutEffect
  if (!user) {
    return null;
  }

  // Jika user ada tapi role tidak sesuai, show access denied
  if (user.role !== 'koperasi') {
    return <AccessDenied />;
  }

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
