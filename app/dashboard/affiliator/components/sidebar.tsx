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
              <Link href="/dashboard/affiliator">
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
                  <span className="text-xs text-muted-foreground uppercase">{user?.role || 'AFFILIATOR'}</span>
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
