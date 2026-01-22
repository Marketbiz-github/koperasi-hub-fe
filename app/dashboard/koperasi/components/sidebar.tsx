"use client"

import * as React from "react"
import {
  IconDashboard,
  IconInnerShadowTop,
  IconSettings,
  IconShoppingCart,
  IconGift,
  IconBox,
  IconMessageHeart,
  IconDeviceLaptop,
  IconCashRegister,
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
      url: "/dashboard/koperasi",
      icon: IconDashboard,
    },
    {
      title: "Kelola Microsite",
      url: "#",
      icon: IconDeviceLaptop,
      items: [
        {
          title: "Profil",
          url: "/dashboard/koperasi/microsite/profil",
        },
        {
          title: "Laporan",
          url: "/dashboard/koperasi/microsite/laporan",
        },
        {
          title: "Kegiatan",
          url: "/dashboard/koperasi/microsite/kegiatan",
        }
      ],
    },
    {
      title: "Marketplace",
      url: "/dashboard/koperasi/marketplace",
      icon: IconShoppingCart,
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
      title: "Word-of-mouth",
      url: "#",
      icon: IconMessageHeart,
      items: [
        {
          title: "Campaign",
          url: "/dashboard/koperasi/wom/campaign",
        },
        {
          title: "Data Transaksi",
          url: "/dashboard/koperasi/wom/data-transaksi",
        },
      ],
    },
    {
      title: "Penjualan",
      url: "/dashboard/koperasi/penjualan",
      icon: IconCashRegister,
    },
    {
      title: "Fitur",
      url: "#",
      icon: IconGift,
      items: [
        {
          title: "Produk Unggulan",
          url: "/dashboard/koperasi/fitur/produk-unggulan",
        },
        {
          title: "Produk Diminati",
          url: "/dashboard/koperasi/fitur/produk-diminati",
        },
        {
          title: "Voucher",
          url: "/dashboard/koperasi/fitur/voucher",
        },
        {
          title: "Manajemen Stok",
          url: "/dashboard/koperasi/fitur/manajemen-stok",
        },
        {
          title: "Flash Sale",
          url: "/dashboard/koperasi/fitur/flash-sale",
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
          url: "/dashboard/koperasi/pengaturan-toko/detail",
        },
        {
          title: "Shipping",
          url: "/dashboard/koperasi/pengaturan-toko/shipping",
        },
        {
          title: "Gudang",
          url: "/dashboard/koperasi/pengaturan-toko/gudang",
        },
        {
          title: "Pembayaran",
          url: "/dashboard/koperasi/pengaturan-toko/pembayaran",
        },
        {
          title: "WMS",
          url: "/dashboard/koperasi/pengaturan-toko/wms",
        },
        {
          title: "Pengaturan Lainnya",
          url: "/dashboard/koperasi/pengaturan-toko/lainnya",
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
