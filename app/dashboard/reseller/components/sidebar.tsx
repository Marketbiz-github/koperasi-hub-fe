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
      url: "/dashboard/reseller",
      icon: IconDashboard,
    },
    {
      title: "Kelola Microsite",
      url: "#",
      icon: IconDeviceLaptop,
      items: [
        {
          title: "Profil",
          url: "/dashboard/reseller/microsite/profil",
        },
        {
          title: "Laporan",
          url: "/dashboard/reseller/microsite/laporan",
        },
        {
          title: "Kegiatan",
          url: "/dashboard/reseller/microsite/kegiatan",
        }
      ],
    },
    {
      title: "Marketplace",
      url: "#",
      icon: IconBuildingStore,
      items: [
        {
          title: "Marketplace",
          url: "/dashboard/reseller/marketplace",
        },
        {
          title: "Pembelian",
          url: "/dashboard/reseller/marketplace/pembelian",
        },
        {
          title: "Vendor",
          url: "/dashboard/reseller/marketplace/vendor",
        },
        {
          title: "Pembayaran",
          url: "/dashboard/reseller/marketplace/pembayaran",
        },
        {
          title: "Piutang",
          url: "/dashboard/reseller/marketplace/piutang",
        },
        {
          title: "Pengiriman",
          url: "/dashboard/reseller/marketplace/pengiriman",
        },
      ],
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
      title: "Word-of-mouth",
      url: "#",
      icon: IconMessageHeart,
      items: [
        {
          title: "Campaign",
          url: "/dashboard/reseller/wom/campaign",
        },
        {
          title: "Data Transaksi",
          url: "/dashboard/reseller/wom/data-transaksi",
        },
      ],
    },
    {
      title: "Penjualan",
      url: "/dashboard/reseller/penjualan",
      icon: IconCashRegister,
    },
    {
      title: "Fitur",
      url: "#",
      icon: IconGift,
      items: [
        {
          title: "Produk Unggulan",
          url: "/dashboard/reseller/fitur/produk-unggulan",
        },
        {
          title: "Produk Diminati",
          url: "/dashboard/reseller/fitur/produk-diminati",
        },
        {
          title: "Voucher",
          url: "/dashboard/reseller/fitur/voucher",
        },
        {
          title: "Manajemen Stok",
          url: "/dashboard/reseller/fitur/manajemen-stok",
        },
        {
          title: "Flash Sale",
          url: "/dashboard/reseller/fitur/flash-sale",
        },
      ],
    },
    {
      title: "Pengaturan Toko",
      url: "/dashboard/reseller/store-settings",
      icon: IconSettings,
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
