import { ReactNode } from "react";
import type { Metadata } from "next";
import { VendorLayoutClient } from "./vendorLayoutClient";

export const metadata: Metadata = {
  title: "Dashboard Vendor",
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
  return <VendorLayoutClient>{children}</VendorLayoutClient>;
}
