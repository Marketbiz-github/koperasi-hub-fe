"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar() {
  return (
    <header className="h-14 border-b bg-white px-4 flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
