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
      url: "/dashboard/affiliator",
      icon: IconDashboard,
    },
    {
      title: "Kelola Microsite",
      url: "#",
      icon: IconDeviceLaptop,
      items: [
        {
          title: "Profil",
          url: "/dashboard/affiliator/microsite/profil",
        },
        {
          title: "Laporan",
          url: "/dashboard/affiliator/microsite/laporan",
        },
        {
          title: "Kegiatan",
          url: "/dashboard/affiliator/microsite/kegiatan",
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
          url: "/dashboard/affiliator/marketplace",
        },
        {
          title: "Pembelian",
          url: "/dashboard/affiliator/marketplace/pembelian",
        },
        {
          title: "Vendor",
          url: "/dashboard/affiliator/marketplace/vendor",
        },
        {
          title: "Pembayaran",
          url: "/dashboard/affiliator/marketplace/pembayaran",
        },
        {
          title: "Piutang",
          url: "/dashboard/affiliator/marketplace/piutang",
        },
        {
          title: "Pengiriman",
          url: "/dashboard/affiliator/marketplace/pengiriman",
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
          url: "/dashboard/affiliator/produk/kategori",
        },
        {
          title: "Produk",
          url: "/dashboard/affiliator/produk",
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
          url: "/dashboard/affiliator/wom/campaign",
        },
        {
          title: "Data Transaksi",
          url: "/dashboard/affiliator/wom/data-transaksi",
        },
      ],
    },
    {
      title: "Penjualan",
      url: "/dashboard/affiliator/penjualan",
      icon: IconCashRegister,
    },
    {
      title: "Fitur",
      url: "#",
      icon: IconGift,
      items: [
        {
          title: "Produk Unggulan",
          url: "/dashboard/affiliator/fitur/produk-unggulan",
        },
        {
          title: "Produk Diminati",
          url: "/dashboard/affiliator/fitur/produk-diminati",
        },
        {
          title: "Voucher",
          url: "/dashboard/affiliator/fitur/voucher",
        },
        {
          title: "Manajemen Stok",
          url: "/dashboard/affiliator/fitur/manajemen-stok",
        },
        {
          title: "Flash Sale",
          url: "/dashboard/affiliator/fitur/flash-sale",
        },
      ],
    },
    {
      title: "Pengaturan Toko",
      url: "/dashboard/affiliator/store-settings",
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
