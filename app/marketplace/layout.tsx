import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Marketplace Koperasi",
  description: "Marketplace produk koperasi terpercaya dari seluruh Indonesia.",
};

export default function MarketplaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
