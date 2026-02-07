"use client"

import {
  IconDashboard,
  IconBox,
  IconBuildingCommunity,
  IconGift,
  IconCashRegister,
  IconSettings,
  IconUsers,
  IconInnerShadowTop
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { useAuthStore } from "@/store/authStore"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

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
    title: "Koperasi",
    url: "#",
    icon: IconBuildingCommunity,
    items: [
      {
        title: "Koperasi",
        url: "/dashboard/vendor/koperasi",
      },
      {
        title: "Pengajuan",
        url: "/dashboard/vendor/koperasi/pengajuan",
      },
    ],
  },
  {
    title: "Penjualan",
    url: "/dashboard/vendor/penjualan",
    icon: IconCashRegister,
  },
  {
    title: "Fitur",
    url: "#",
    icon: IconGift,
    items: [
      {
        title: "Produk Unggulan",
        url: "/dashboard/vendor/fitur/produk-unggulan",
      },
      {
        title: "Produk Diminati",
        url: "/dashboard/vendor/fitur/produk-diminati",
      },
      {
        title: "Voucher",
        url: "/dashboard/vendor/fitur/voucher",
      },
      {
        title: "Manajemen Stok",
        url: "/dashboard/vendor/fitur/manajemen-stok",
      },
      {
        title: "Flash Sale",
        url: "/dashboard/vendor/fitur/flash-sale",
      },
    ],
  },
  {
    title: "Pengaturan Toko",
    url: "#",
    icon: IconSettings,
    items: [
      {
        title: "Detail Toko",
        url: "/dashboard/vendor/pengaturan-toko/detail",
      },
      {
        title: "Shipping",
        url: "/dashboard/vendor/pengaturan-toko/shipping",
      },
      {
        title: "Gudang",
        url: "/dashboard/vendor/pengaturan-toko/gudang",
      },
      {
        title: "Pembayaran",
        url: "/dashboard/vendor/pengaturan-toko/pembayaran",
      },
      {
        title: "WMS",
        url: "/dashboard/vendor/pengaturan-toko/wms",
      },
      {
        title: "Pengaturan Lainnya",
        url: "/dashboard/vendor/pengaturan-toko/lainnya",
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, userDetail } = useAuthStore();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
            >
              <a href="/dashboard/vendor">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-green-600 text-white">
                  <IconInnerShadowTop className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-base">{userDetail?.name || user?.name || 'Loading...'}</span>
                  <span className="text-xs text-muted-foreground uppercase">{user?.role || 'VENDOR'}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={vendorNav} />
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
    </Sidebar>
  )
}
