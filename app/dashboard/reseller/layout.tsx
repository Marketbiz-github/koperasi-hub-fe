import { ReactNode } from "react";
import type { Metadata } from "next";
import { ResellerLayoutClient } from "./resellerLayoutClient";

export const metadata: Metadata = {
  title: "Dashboard Reseller",
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
  return <ResellerLayoutClient>{children}</ResellerLayoutClient>;
}
