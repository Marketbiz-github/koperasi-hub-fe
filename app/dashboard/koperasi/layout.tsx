import { ReactNode } from "react";
import type { Metadata } from "next";
import { KoperasiLayoutClient } from "./koperasiLayoutClient";

export const metadata: Metadata = {
  title: "Dashboard Koperasi",
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
  return <KoperasiLayoutClient>{children}</KoperasiLayoutClient>;
}
