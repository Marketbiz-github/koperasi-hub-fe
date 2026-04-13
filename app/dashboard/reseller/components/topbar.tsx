'use client'

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, StoreIcon, ShoppingCart } from "lucide-react"
import { IconUser } from "@tabler/icons-react"
import { useAuthStore } from "@/store/authStore"
import { useCartStore } from "@/store/cartStore"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function SiteHeader() {
  const { user, store, logout } = useAuthStore()
  const cartItems = useCartStore((s: any) => s.items)

  const handleLogout = async () => {
    await logout()
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || 'koperasihub.com'
  const storeUrl = store?.domain
    ? `https://${store.domain}`
    : store?.subdomain
      ? `https://${store.subdomain}.${appUrl}`
      : null

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {storeUrl && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 rounded-full px-3 text-xs font-medium"
            onClick={() => window.open(storeUrl, '_blank')}
          >
            <StoreIcon className="size-3.5" />
            <span className="hidden md:inline">Lihat Toko</span>
          </Button>
        )}


        <div className="ml-auto flex items-center gap-2">
          <Link href="/dashboard/reseller/marketplace/cart">
            <Button variant="outline" size="sm" className="relative rounded-full px-2 h-8 w-8 sm:h-9 sm:w-9">
              <ShoppingCart className="size-4" />
              {cartItems.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 bg-red-500 text-[10px] text-white border-none">
                  {cartItems.length}
                </Badge>
              )}
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2 rounded-full px-2"
              >
                <IconUser className="size-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-semibold">
                {user?.name || 'My Account'}
              </DropdownMenuLabel>
              <div className="px-2 py-1.5 text-xs text-gray-600">
                {user?.email}
              </div>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/dashboard/reseller/profile" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/reseller/settings" className="flex items-center w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
