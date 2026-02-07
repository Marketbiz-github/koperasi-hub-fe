import { ReactNode } from "react";
import type { Metadata } from "next";
import { AdminLayoutClient } from "./adminLayoutClient";

export const metadata: Metadata = {
  title: "Dashboard Super Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
