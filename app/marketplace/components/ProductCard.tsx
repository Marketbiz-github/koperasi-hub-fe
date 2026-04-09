"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Share2, ShoppingCart, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import LoginShareCommission from './LoginShareCommission';
import ShareCommission from './ShareCommission';
import { toast } from 'sonner';

interface Product {
  id: number | string;
  name: string;
  sku?: string;
  price: string | number;
  status?: string;
  badge?: string;
  image?: string;
  category?: string;
  slug?: string;
  store?: {
    id: number | string;
    subdomain: string;
    domain?: string | null;
  };
  images?: { image_url: string; is_primary: boolean }[] | null;
  product_category?: { name: string } | null;
  product_variants?: any[] | null;
  variants?: any[] | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState('');

  // Initialize from product if available
  const [subdomain, setSubdomain] = React.useState<string>(product.store?.subdomain || (product as any).store_subdomain || '');
  const [customDomain, setCustomDomain] = React.useState<string>(product.store?.domain || (product as any).store_domain || '');

  React.useEffect(() => {
    const fetchStoreInfo = async () => {
      if (!subdomain || !customDomain) {
        const storeId = (product as any).store_id || product.store?.id;
        if (storeId) {
          try {
            const { storeService } = await import('@/services/apiService');
            const { getPublicAccessToken } = await import('@/utils/auth');
            const token = await getPublicAccessToken();
            const res = await storeService.getDetail(token || '', storeId);
            if (res.data) {
              if (res.data.subdomain) setSubdomain(res.data.subdomain);
              if (res.data.domain) setCustomDomain(res.data.domain);
            }
          } catch (err) {
            console.error('Failed to fetch store info:', err);
          }
        }
      }
    };
    fetchStoreInfo();
  }, [product, subdomain, customDomain]);

  const hasVariants = (product.product_variants && product.product_variants.length > 0) ||
    (product.variants && product.variants.length > 0);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants) {
      window.location.href = `/marketplace/${product.id}`;
      return;
    }

    const primaryImage = product.images?.find(img => img.is_primary)?.image_url
      || product.images?.[0]?.image_url
      || product.image
      || "/images/placeholder.png";
    const storeId = (product as any).store_id || (product as any).store?.id || 1;
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: typeof product.price === 'string' ? Number(product.price.replace(/\D/g, '')) : Number(product.price),
      image: primaryImage,
      category: product.product_category?.name || product.category || "Uncategorized",
      quantity: 1,
      storeId: Number(storeId),
      variantId: 0,
    });
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  const productSlug = product.slug || product.id.toString();

  const baseAppDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || (typeof window !== 'undefined' ? window.location.host.split('.').slice(-2).join('.') : 'koperasihub.com');
  
  const currentSubdomain = subdomain || product.store?.subdomain || (product as any).store_subdomain;
  const currentCustomDomain = customDomain || product.store?.domain || (product as any).store_domain;

  // Optimize link selection - keeping slug-based routing as requested
  const internalProductLink = currentCustomDomain
    ? `https://${currentCustomDomain}/produk/${productSlug}`
    : currentSubdomain 
      ? `https://${currentSubdomain}.${baseAppDomain}/produk/${productSlug}`
      : `/marketplace/${productSlug}`; 

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoggedIn) {
      setIsValidating(true);
      try {
        const token = localStorage.getItem('affiliate_token');
        if (token) {
          const { affiliatorService } = await import('@/services/apiService');
          const parentShareCode = localStorage.getItem('last_share_code') || undefined;
          const res = await affiliatorService.generateShareLink(product.id, token, parentShareCode);

          if (res.data) {
            localStorage.setItem('shared_product_id', res.data.id.toString());
            localStorage.setItem('share_code', res.data.share_code);
          }

          setShareUrl(`${internalProductLink}?sh=${res.data.share_code}`);
          setIsShareOpen(true);
        }
      } catch (err) {
        toast.error('Gagal generate link share');
      } finally {
        setIsValidating(false);
      }
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleLoginSuccess = (generatedUrl: string) => {
    setIsLoggedIn(true);
    setIsLoginOpen(false);
    setShareUrl(generatedUrl);
    setIsShareOpen(true);
  };

  const formatCurrency = (amount: string | number) => {
    const numericAmount = typeof amount === 'string' ? Number(amount.replace(/\D/g, '')) : Number(amount);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numericAmount);
  };

  const primaryImage = product.images?.find(img => img.is_primary)?.image_url
    || product.images?.[0]?.image_url
    || product.image
    || "/images/placeholder.png";

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full border border-gray-100">
      <Link href={internalProductLink} className="flex-1">
        <div className="relative cursor-pointer overflow-hidden aspect-square md:aspect-auto md:h-56">
          <Image
            src={primaryImage}
            alt={product.name}
            width={500}
            height={500}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {(product.status === 'promo' || product.badge) && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-sm">
              {product.badge || 'PROMO'}
            </span>
          )}
        </div>

        <div className="p-4">
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">
            {product.product_category?.name || product.category || "Uncategorized"}
          </p>
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 min-h-[40px] text-sm md:text-base group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-emerald-600 font-extrabold text-lg">
            {formatCurrency(product.price)}
          </p>
        </div>
      </Link>

      {/* ACTION BUTTON */}
      <div className="flex gap-2 p-4 pt-0">
        <button
          onClick={handleAdd}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md"
        >
          {isValidating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</>
          ) : hasVariants ? (
            <span>Lihat Detail</span>
          ) : (
            <>
              <ShoppingCart size={16} />
              <span>Tambah ke Keranjang</span>
            </>
          )}
        </button>

        <button
          onClick={handleShareClick}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-emerald-200 hover:text-emerald-600 transition-all duration-300 shadow-sm"
          aria-label="Share"
        >
          <Share2 size={18} />
        </button>

        <LoginShareCommission
          open={isLoginOpen}
          onOpenChange={setIsLoginOpen}
          onLoginSuccess={handleLoginSuccess}
          productId={product.id}
          productSlug={productSlug}
          storeSubdomain={subdomain}
          storeDomain={customDomain}
        />

        <ShareCommission
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
          productName={product.name}
          shareUrl={shareUrl}
        />
      </div>
    </div>
  );
}
