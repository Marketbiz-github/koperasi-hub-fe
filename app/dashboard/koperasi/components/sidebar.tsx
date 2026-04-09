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
} from "@tabler/icons-react"
import { useNotificationStore } from "@/store/notificationStore"
import { useAffiliationNotificationStore } from "@/store/affiliationNotificationStore"
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
      url: "/dashboard/koperasi",
      icon: IconDashboard,
    },
    {
      title: "Profil Koperasi",
      url: "/dashboard/koperasi/profile",
      icon: IconBuildingCommunity,
    },
    {
      title: "Marketplace",
      url: "/dashboard/koperasi/marketplace",
      icon: IconBuildingStore,
    },
    {
      title: "Afiliasi",
      url: "#",
      icon: IconUsersGroup,
      items: [
        {
          title: "Request Vendor",
          url: "/dashboard/koperasi/afiliasi/request",
        },
        {
          title: "Permintaan Masuk",
          url: "/dashboard/koperasi/afiliasi/masuk",
        },
      ],
    },
    {
      title: "Pembelian",
      url: "#",
      icon: IconShoppingCart,
      items: [
        {
          title: "Daftar Pembelian",
          url: "/dashboard/koperasi/marketplace/pembelian",
        },
        {
          title: "Daftar Piutang",
          url: "/dashboard/koperasi/marketplace/piutang",
        },
      ]
    },
    {
      title: "Gudang",
      url: "/dashboard/koperasi/gudang",
      icon: IconBuildingCommunity,
    },
    {
      title: "Produk",
      url: "#",
      icon: IconBox,
      items: [
        {
          title: "Kategori Produk",
          url: "/dashboard/koperasi/produk/kategori",
        },
        {
          title: "Produk",
          url: "/dashboard/koperasi/produk",
        },
      ],
    },
    {
      title: "Pesanan Masuk",
      url: "/dashboard/koperasi/marketplace/pesanan",
      icon: IconFileInvoice,
    },
    {
      title: "Campaign",
      url: "#",
      icon: IconGift,
      items: [
        {
          title: "Daftar Campaign",
          url: "/dashboard/koperasi/campaign",
        },
        {
          title: "Topup Saldo",
          url: "/dashboard/koperasi/campaign/topup",
        },
      ],
    },
    {
      title: "Pengaturan Toko",
      url: "/dashboard/koperasi/store-settings",
      icon: IconSettings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, store } = useAuthStore();
  const { unreadOrderCounts, fetchUnreadCounts } = useNotificationStore();
  const { unreadAffiliationCounts, fetchUnreadCounts: fetchUnreadAffiliationCounts } = useAffiliationNotificationStore();

  useEffect(() => {
    const fetch = async () => {
      const token = await getAccessToken();
      if (token && store?.id) {
        fetchUnreadCounts('koperasi', { store_id: store.id }, token);
        fetchUnreadAffiliationCounts(token, ['reseller_koperasi']);
      }
    };
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, [store?.id]);

  const navigation = useMemo(() => {
    return data.navMain.map(item => {
      if (item.title === "Pesanan Masuk") {
        return { ...item, badge: unreadOrderCounts };
      }
      if (item.title === "Afiliasi") {
        return {
          ...item,
          badge: unreadAffiliationCounts,
          items: item.items?.map(subItem => {
            if (subItem.title === "Permintaan Masuk") {
              return { ...subItem, badge: unreadAffiliationCounts };
            }
            return subItem;
          })
        };
      }
      return item;
    });
  }, [unreadOrderCounts, unreadAffiliationCounts]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
            >
              <Link href="/dashboard/koperasi">
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
                  <span className="text-xs text-muted-foreground uppercase">{user?.role || 'KOPERASI'}</span>
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
