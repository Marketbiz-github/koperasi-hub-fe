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
      url: "#",
      icon: IconBuildingStore,
      items: [
        {
          title: "Marketplace",
          url: "/dashboard/koperasi/marketplace",
        },
        {
          title: "Pembelian",
          url: "/dashboard/koperasi/marketplace/pembelian",
        },
        {
          title: "Vendor",
          url: "/dashboard/koperasi/marketplace/vendor",
        },
        {
          title: "Pembayaran",
          url: "/dashboard/koperasi/marketplace/pembayaran",
        },
        {
          title: "Piutang",
          url: "/dashboard/koperasi/marketplace/piutang",
        },
        {
          title: "Pengiriman",
          url: "/dashboard/koperasi/marketplace/pengiriman",
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
      url: "/dashboard/koperasi/store-settings",
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
              <a href="/dashboard/koperasi">
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
