import type { Metadata } from "next";
import { ReactNode } from "react";
import { storeService } from "@/services/apiService";
import { authService } from "@/services/apiService";

type Props = {
  params: Promise<{ storeId: string }>;
  children: ReactNode;
};

async function getGuestToken() {
  try {
    const res = await authService.login('adminsuper@example.com', 'password123');
    return res.data?.token || null;
  } catch (error) {
    console.error('Metadata guest auth fallback error:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeId } = await params;
  
  try {
    const token = await getGuestToken();
    const res = await storeService.lookup(token || '', storeId);
    const store = res.data;

    if (store) {
      return {
        icons: {
          icon: store.logo || "/images/favicon.png",
          shortcut: store.logo || "/images/favicon.png",
          apple: store.logo || "/images/favicon.png",
        },
      };
    }
  } catch (error) {
    console.error("Error generating store layout metadata:", error);
  }

  return {
    icons: {
      icon: "/images/favicon.png",
      shortcut: "/images/favicon.png",
      apple: "/images/favicon.png",
    },
  };
}

export default function MarketplaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
