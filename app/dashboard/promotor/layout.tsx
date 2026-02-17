import { ReactNode } from "react";
import type { Metadata } from "next";
import { PromotorLayoutClient } from "./promotorLayoutClient";

export const metadata: Metadata = {
  title: "Dashboard Promotor",
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
  return <PromotorLayoutClient>{children}</PromotorLayoutClient>;
}
