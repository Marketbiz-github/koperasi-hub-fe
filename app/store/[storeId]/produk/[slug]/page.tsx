import { productService, storeService, authService } from '@/services/apiService';
import type { Metadata } from 'next';
import ProductPageClient from './ProductPageClient';

async function getGuestToken() {
    try {
        const res = await authService.login('adminsuper@example.com', 'password123');
        return res.data?.token || null;
    } catch (error) {
        return null;
    }
}

type PageProps = {
    params: Promise<{
        storeId: string;
        slug: string;
    }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { storeId, slug } = await params;
    const token = await getGuestToken();
    
    try {
        // Fetch Product
        const prodRes = await productService.getProductDetailBySlug(slug, token || '');
        let product: any = null;
        if (prodRes.data) {
            const searchList = prodRes.data.data || (Array.isArray(prodRes.data) ? prodRes.data : []);
            product = searchList.find((p: any) => p.slug === slug || String(p.id) === String(slug)) || searchList[0];
        }

        // Fetch Store
        const storeRes = await storeService.lookup(token || '', storeId);
        const store = storeRes.data;

        if (!product && !store) return {};

        const title = product?.seo_title || (product ? `${product.name} | ${store?.name || 'KoperasiHub'}` : store?.seo_title || store?.name);
        const description = product?.seo_description || product?.short_description || store?.seo_description || store?.description || 'Beli produk berkualitas di KoperasiHub.';
        const keywords = product?.seo_keywords || store?.seo_keywords || `koperasi, ${product?.name || ''}, marketplace`;

        return {
            title,
            description,
            keywords,
            openGraph: {
                title,
                description,
                images: product?.images?.[0]?.image_url ? [product.images[0].image_url] : (store?.logo ? [store.logo] : []),
            },
            icons: {
                icon: store?.logo || "/images/favicon.png",
                shortcut: store?.logo || "/images/favicon.png",
                apple: store?.logo || "/images/favicon.png",
            },
        };
    } catch (error) {
        console.error("Error generating product metadata:", error);
        return {};
    }
}

export default async function StoreProductDetailPage({ params }: PageProps) {
    const { storeId, slug } = await params;
    return <ProductPageClient storeId={storeId} slug={slug} />;
}
