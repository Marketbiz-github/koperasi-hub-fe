"use client"

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
import {
    IconDashboard,
    IconUsers,
    IconInnerShadowTop,
    IconUserHeart,
} from "@tabler/icons-react"

const superAdminNav = [
    {
        title: "Dashboard",
        url: "/dashboard/super_admin",
        icon: IconDashboard,
    },
    {
        title: "Kelola User",
        url: "/dashboard/super_admin/users",
        icon: IconUsers,
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
                            <a href="/dashboard/super_admin">
                                <div className="flex items-center gap-4">
                                    <IconUserHeart className="size-5" />
                                    <div className="flex flex-col gap-0.5 leading-none">
                                        <span className="font-semibold text-base">{userDetail?.name || user?.name || 'Loading...'}</span>
                                        <span className="text-xs text-muted-foreground uppercase">{user?.role}</span>
                                    </div>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={superAdminNav} />
            </SidebarContent>
            <SidebarFooter>
            </SidebarFooter>
        </Sidebar>
    )
}
