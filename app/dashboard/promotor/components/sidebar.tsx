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
      url: "/dashboard/promotor",
      icon: IconDashboard,
    },
    {
      title: "Kelola Microsite",
      url: "#",
      icon: IconDeviceLaptop,
      items: [
        {
          title: "Profil",
          url: "/dashboard/promotor/microsite/profil",
        },
        {
          title: "Laporan",
          url: "/dashboard/promotor/microsite/laporan",
        },
        {
          title: "Kegiatan",
          url: "/dashboard/promotor/microsite/kegiatan",
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
          url: "/dashboard/promotor/marketplace",
        },
        {
          title: "Pembelian",
          url: "/dashboard/promotor/marketplace/pembelian",
        },
        {
          title: "Vendor",
          url: "/dashboard/promotor/marketplace/vendor",
        },
        {
          title: "Pembayaran",
          url: "/dashboard/promotor/marketplace/pembayaran",
        },
        {
          title: "Piutang",
          url: "/dashboard/promotor/marketplace/piutang",
        },
        {
          title: "Pengiriman",
          url: "/dashboard/promotor/marketplace/pengiriman",
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
          url: "/dashboard/promotor/produk/kategori",
        },
        {
          title: "Produk",
          url: "/dashboard/promotor/produk",
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
          url: "/dashboard/promotor/wom/campaign",
        },
        {
          title: "Data Transaksi",
          url: "/dashboard/promotor/wom/data-transaksi",
        },
      ],
    },
    {
      title: "Penjualan",
      url: "/dashboard/promotor/penjualan",
      icon: IconCashRegister,
    },
    {
      title: "Fitur",
      url: "#",
      icon: IconGift,
      items: [
        {
          title: "Produk Unggulan",
          url: "/dashboard/promotor/fitur/produk-unggulan",
        },
        {
          title: "Produk Diminati",
          url: "/dashboard/promotor/fitur/produk-diminati",
        },
        {
          title: "Voucher",
          url: "/dashboard/promotor/fitur/voucher",
        },
        {
          title: "Manajemen Stok",
          url: "/dashboard/promotor/fitur/manajemen-stok",
        },
        {
          title: "Flash Sale",
          url: "/dashboard/promotor/fitur/flash-sale",
        },
      ],
    },
    {
      title: "Pengaturan Toko",
      url: "/dashboard/promotor/store-settings",
      icon: IconSettings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, store } = useAuthStore();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
            >
              <Link href="/dashboard/promotor">
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
                  <span className="text-xs text-muted-foreground uppercase">{user?.role === 'affiliator' ? 'PROMOTOR' : (user?.role || 'VENDOR')}</span>
                </div>
              </Link>
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
