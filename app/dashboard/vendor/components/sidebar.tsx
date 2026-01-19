"use client"

import * as React from "react"
import {
  IconDashboard,
  IconInnerShadowTop,
  IconSettings,
  IconShoppingCart,
  IconBuildingCommunity,
  IconGift,
  IconBox,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
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
      icon: IconShoppingCart,
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
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
    </Sidebar>
  )
}
