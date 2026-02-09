'use client';

import { ReactNode, useEffect } from "react";
import { AppSidebar } from "./components/sidebar";
import { SiteHeader } from "./components/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AccessDenied } from "@/components/access-denied";

export function ResellerLayoutClient({ children }: { children: ReactNode }) {
  const { user, store, hydrate, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (store?.logo) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = store.logo;
    }
  }, [store?.logo]);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push('/login');
    }
  }, [isHydrated, user, router]);

  // ⏳ Tunggu auth selesai dicek
  if (!isHydrated || !user) return null;

  // Jika user ada tapi role tidak sesuai, show access denied
  if (user.role !== 'reseller') {
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
