"use client"

import {
  IconDashboard,
  IconBox,
  IconBuildingCommunity,
  IconGift,
  IconCashRegister,
  IconFileInvoice,
  IconSettings,
  IconUsers,
  IconInnerShadowTop,
  IconUsersGroup
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { useAuthStore } from "@/store/authStore"
import { useNotificationStore } from "@/store/notificationStore"
import { getAccessToken } from "@/utils/auth"
import { useEffect, useMemo } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import Link from "next/link"

const vendorNav = [
  {
    title: "Dashboard",
    url: "/dashboard/vendor",
    icon: IconDashboard,
  },
  {
    title: "Produk",
    url: "#",
    icon: IconBox,
    items: [
      {
        title: "Kategori Produk",
        url: "/dashboard/vendor/produk/kategori",
      },
      {
        title: "Produk",
        url: "/dashboard/vendor/produk",
      },
    ],
  },
  {
    title: "Gudang",
    url: "/dashboard/vendor/gudang",
    icon: IconBuildingCommunity,
  },
  {
    title: "Afiliasi",
    url: "#",
    icon: IconUsersGroup,
    items: [
      {
        title: "Permintaan Masuk",
        url: "/dashboard/vendor/afiliasi/masuk",
      },
    ],
  },
  {
    title: "Pesanan Masuk",
    url: "#",
    icon: IconFileInvoice,
    items: [
      {
        title: "Semua Pesanan",
        url: "/dashboard/vendor/pesanan",
      },
      {
        title: "Daftar Piutang",
        url: "/dashboard/vendor/piutang",
      },
    ],
  },
  // {
  //   title: "Penjualan",
  //   url: "/dashboard/vendor/penjualan",
  //   icon: IconCashRegister,
  // },
  // {
  //   title: "Fitur",
  //   url: "#",
  //   icon: IconGift,
  //   items: [
  //     {
  //       title: "Produk Unggulan",
  //       url: "/dashboard/vendor/fitur/produk-unggulan",
  //     },
  //     {
  //       title: "Produk Diminati",
  //       url: "/dashboard/vendor/fitur/produk-diminati",
  //     },
  //     {
  //       title: "Voucher",
  //       url: "/dashboard/vendor/fitur/voucher",
  //     },
  //     {
  //       title: "Manajemen Stok",
  //       url: "/dashboard/vendor/fitur/manajemen-stok",
  //     },
  //     {
  //       title: "Flash Sale",
  //       url: "/dashboard/vendor/fitur/flash-sale",
  //     },
  //   ],
  // },
  {
    title: "Pengaturan Toko",
    url: "/dashboard/vendor/store-settings",
    icon: IconSettings,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, store } = useAuthStore();
  const { unreadOrderCounts, fetchUnreadCounts } = useNotificationStore();

  useEffect(() => {
    const fetch = async () => {
      const token = await getAccessToken();
      if (token && store?.id) {
        fetchUnreadCounts('vendor', { store_id: store.id }, token);
      }
    };
    fetch();
    const interval = setInterval(fetch, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [store?.id]);

  const navigation = useMemo(() => {
    return vendorNav.map(item => {
      if (item.title === "Pesanan Masuk") {
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
              <Link href="/dashboard/vendor">
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
                  <span className="text-xs text-muted-foreground uppercase">{user?.role || 'VENDOR'}</span>
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
