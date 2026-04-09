"use client"

import * as React from "react"
import {
  IconDashboard,
  IconInnerShadowTop,
  IconSettings,
  IconGift,
  IconBox,
  IconMessageHeart,
  IconDeviceLaptop,
  IconCashRegister,
  IconBuildingStore,
  IconUsersGroup,
  IconBuildingCommunity,
  IconShoppingCart,
  IconFileInvoice,
  IconCash,
  IconCrown,
} from "@tabler/icons-react"
import { useNotificationStore } from "@/store/notificationStore"
import { getAccessToken } from "@/utils/auth"
import { useEffect, useMemo } from "react"

import { NavMain } from "@/components/nav-main"
import { useAuthStore } from "@/store/authStore"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/reseller",
      icon: IconDashboard,
    },
    {
      title: "Marketplace",
      url: "/dashboard/reseller/marketplace",
      icon: IconBuildingStore,
    },
    {
      title: "Afiliasi",
      url: "#",
      icon: IconUsersGroup,
      items: [
        {
          title: "Request Koperasi",
          url: "/dashboard/reseller/afiliasi/request",
        },
      ],
    },
    {
      title: "Pembelian",
      url: "/dashboard/reseller/marketplace/pembelian",
      icon: IconShoppingCart,
    },
    {
      title: "Gudang",
      url: "/dashboard/reseller/gudang",
      icon: IconBuildingCommunity,
    },
    {
      title: "Produk",
      url: "#",
      icon: IconBox,
      items: [
        {
          title: "Kategori Produk",
          url: "/dashboard/reseller/produk/kategori",
        },
        {
          title: "Produk",
          url: "/dashboard/reseller/produk",
        },
      ],
    },
    {
      title: "Pesanan",
      url: "/dashboard/reseller/marketplace/pesanan",
      icon: IconFileInvoice,
    },
    {
      title: "Campaign",
      url: "#",
      icon: IconGift,
      items: [
        {
          title: "Daftar Campaign",
          url: "/dashboard/reseller/campaign",
        },
        {
          title: "Topup Saldo",
          url: "/dashboard/reseller/campaign/topup",
        },
      ],
    },
    {
      title: "Langganan",
      url: "/dashboard/reseller/langganan",
      icon: IconCrown,
    },
    {
      title: "Pengaturan Toko",
      url: "/dashboard/reseller/store-settings",
      icon: IconSettings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, store } = useAuthStore();
  const { unreadOrderCounts, fetchUnreadCounts } = useNotificationStore();

  useEffect(() => {
    const fetch = async () => {
      const token = await getAccessToken();
      if (token && store?.id) {
        fetchUnreadCounts('reseller', { store_id: store.id }, token);
      }
    };
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, [store?.id]);

  const navigation = useMemo(() => {
    return data.navMain.map(item => {
      if (item.title === "Pesanan") {
        return { ...item, badge: unreadOrderCounts };
      }
      return item;
    });
  }, [unreadOrderCounts]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
            >
              <Link href="/dashboard/reseller">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden border bg-background">
                  {store?.logo ? (
                    <img src={store.logo} alt={store.name} className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-green-600 text-white">
                      <IconInnerShadowTop className="size-5" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 leading-none overflow-hidden">
                  <span className="font-semibold text-base truncate">
                    {store?.name || 'Loading...'}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase">{user?.role || 'RESELLER'}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation} />
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
    </Sidebar>
  )
}
