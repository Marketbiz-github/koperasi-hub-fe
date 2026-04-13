import { storeService, authService } from '@/services/apiService';
import type { Metadata } from 'next';
import StorePageClient from './StorePageClient';

async function getGuestToken() {
  try {
    const res = await authService.login('adminsuper@example.com', 'password123');
    return res.data?.token || null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ storeId: string }> }): Promise<Metadata> {
  const { storeId } = await params;
  const token = await getGuestToken();
  const res = await storeService.lookup(token || '', storeId);
  const store = res.data;

  if (!store) return {};

  const title = store.seo_title || `${store.name} - Official Store`;
  const description = store.seo_description || store.description || `Selamat datang di official store ${store.name}. Temukan produk terbaik kami.`;
  const keywords = store.seo_keywords || `${store.name}, koperasi, marketplace, belanja online`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [store.logo || store.cover].filter(Boolean) as string[],
    },
    icons: {
        icon: store.logo || "/images/favicon.png",
        shortcut: store.logo || "/images/favicon.png",
        apple: store.logo || "/images/favicon.png",
    },
  };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params;
  return <StorePageClient storeId={storeId} />;
}
