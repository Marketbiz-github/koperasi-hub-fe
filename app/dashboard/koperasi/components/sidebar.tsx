"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const menus = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Produk", href: "/dashboard/products" },
  { label: "Order", href: "/dashboard/orders" },
];

export function Sidebar() {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-64 border-r bg-white p-4">
        <nav className="space-y-2">
          {menus.map((m) => (
            <Link key={m.href} href={m.href} className="block rounded px-3 py-2 hover:bg-slate-100">
              {m.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden fixed top-4 left-4 z-50">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-4">
          <nav className="space-y-2">
            {menus.map((m) => (
              <Link key={m.href} href={m.href} className="block rounded px-3 py-2 hover:bg-slate-100">
                {m.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
