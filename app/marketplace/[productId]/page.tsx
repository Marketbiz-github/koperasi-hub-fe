'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Share2, ShoppingCart, ArrowLeft, Store as StoreIcon, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { productService, inventoryService, productVariantService } from '@/services/apiService';
import { getPublicAccessToken } from '@/utils/auth';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import LoginShareCommission from '../components/LoginShareCommission';

type PageProps = {
  params: Promise<{
    productId: string;
  }>;
};

interface ProductDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: string;
  rating?: number;
  reviews_count?: number;
  sold_count?: number;
  images?: { image_url: string; is_primary: boolean }[];
  product_category?: { name: string };
  store?: {
    id: string;
    name: string;
    image_url: string;
    address: string;
    is_verified: boolean;
  };
  is_gratis_ongkir?: boolean;
  is_cashback?: boolean;
  cashback_unit?: string;
  cashback_value?: number;
  is_discount?: boolean;
  discount_type?: string;
  discount_value?: number;
  discount_price?: string | number;
  product_variants?: any[] | null;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { productId } = React.use(params);
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = React.useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [totalStock, setTotalStock] = React.useState<number | null>(null);
  const [variants, setVariants] = React.useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = React.useState<any>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);

  const handleShareSuccess = (shareUrl: string) => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link share telah disalin ke clipboard');
  };

  const fetchProductDetail = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getPublicAccessToken();
      const res = await productService.getProductDetail(productId, token || '');
      if (res.data) {
        setProduct(res.data);

        // Fetch Stock and Variants
        try {
          const vRes = await productVariantService.getList(token || "", productId);
          if (vRes.data && vRes.data.length > 0) {
            setVariants(vRes.data);
            const sumStock = vRes.data.reduce((acc: number, curr: any) => acc + (curr.total_stock || 0), 0);
            setTotalStock(sumStock);
          } else {
            const sRes = await inventoryService.getStockByProduct(token || "", productId);
            if (Array.isArray(sRes.data)) {
              setTotalStock(sRes.data.reduce((acc: number, curr: any) => acc + (curr.stock || 0), 0));
            } else {
              setTotalStock(typeof sRes.data === 'number' ? sRes.data : (sRes.data?.total_stock ?? 0));
            }
          }
        } catch (stockErr) {
          console.error('Error fetching stock:', stockErr);
        }
      }
    } catch (err) {
      console.error('Error fetching product detail:', err);
      toast.error('Gagal memuat detail produk');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail]);

  const handleAddToCart = () => {
    if (!product) return;

    if (variants.length > 0 && !selectedVariant) {
      toast.error("Silakan pilih varian terlebih dahulu");
      return;
    }

    addItem({
      id: String(product.id),
      name: product.name,
      price: selectedVariant ? Number(selectedVariant.price) : product.price,
      image: selectedVariant?.image || product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url || '/images/placeholder.png',
      category: product.product_category?.name || 'Produk',
      quantity: quantity,
      storeId: Number(product.store?.id || (product as any).store_id || 1),
      variantId: selectedVariant?.id || 0,
      variantName: selectedVariant?.option_values?.map((ov: any) => ov.value).join(' - ')
    });
    toast.success('Berhasil ditambahkan ke keranjang');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produk Tidak Ditemukan</h2>
          <Link href="/marketplace" className="text-emerald-600 font-medium hover:underline">
            Kembali ke Marketplace
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url || '/images/placeholder.png';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto w-full px-4 py-8">
          {/* Back Button */}
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-[#2F5755] hover:text-[#10b981] mb-6">
            <ArrowLeft size={20} />
            Kembali ke Marketplace
          </Link>

          {/* Product Detail */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="flex flex-col gap-4">
                <div className="relative">
                  {product.status === 'promo' && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded z-10 shadow-md">
                      PROMO
                    </span>
                  )}
                  <Image
                    src={primaryImage}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="w-full h-96 md:h-[500px] object-cover rounded-lg bg-gray-100 shadow-sm"
                  />
                </div>

                {/* Wishlist & Share */}
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition font-medium ${isWishlisted
                      ? 'bg-red-50 border-red-300 text-red-600'
                      : 'border-gray-300 text-gray-600 hover:border-red-300'
                      }`}
                  >
                    <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                    {isWishlisted ? 'Tersimpan' : 'Simpan'}
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-300 text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition font-medium"
                    aria-label="Share"
                  >
                    <Share2 size={20} />
                    Bagikan
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col gap-6">
                {/* Product Name & Price */}
                <div>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-2">
                    {product.product_category?.name || 'Uncategorized'}
                  </p>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>

                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={i < Math.floor(product.rating || 4.5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 font-medium">
                      {product.rating || 4.5} ({(product.reviews_count || 0).toLocaleString('id-ID')} ulasan)
                    </span>
                    <span className="text-gray-400 ml-auto text-sm">
                      {(product.sold_count || 0).toLocaleString('id-ID')} terjual
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-2">
                    {product.is_discount ? (
                      <>
                        <p className="text-4xl font-extrabold text-[#10b981]">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(selectedVariant ? selectedVariant.price : (product.discount_price || 0)))}
                        </p>
                        <p className="text-lg text-gray-400 line-through decoration-gray-300">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                        </p>
                      </>
                    ) : (
                      <p className="text-4xl font-extrabold text-[#10b981]">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(selectedVariant ? selectedVariant.price : product.price))}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {(selectedVariant ? selectedVariant.total_stock : totalStock) !== null && (
                      <Badge variant="outline" className={`px-2 py-0.5 text-xs font-semibold ${(selectedVariant ? selectedVariant.total_stock : totalStock) > 0 ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                        Stok: {(selectedVariant ? selectedVariant.total_stock : totalStock) > 0 ? (selectedVariant ? selectedVariant.total_stock : totalStock) : 'Habis'}
                      </Badge>
                    )}
                    {product.is_discount && (
                      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none px-2 py-0.5 text-xs font-semibold">
                        Diskon {product.discount_type === 'percent' ? `${product.discount_value}%` : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.discount_value || 0)}
                      </Badge>
                    )}
                    {product.is_gratis_ongkir && (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 text-xs font-semibold">
                        Gratis Ongkir
                      </Badge>
                    )}
                    {product.is_cashback && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0.5 text-xs font-semibold">
                        Cashback {product.cashback_unit === 'percent' ? `${product.cashback_value}%` : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.cashback_value || 0)}
                      </Badge>
                    )}
                  </div>

                  <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed mb-6">
                    {product.description || 'Tidak ada deskripsi produk.'}
                  </div>

                  {variants.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Pilih Varian:</h3>
                      <div className="flex flex-wrap gap-2">
                        {variants.map((v) => {
                          const variantLabel = v.option_values?.map((ov: any) => ov.value).join(' - ') || `Varian ${v.id}`;
                          const isSelected = selectedVariant?.id === v.id;
                          return (
                            <button
                              key={v.id}
                              onClick={() => {
                                setSelectedVariant(isSelected ? null : v);
                              }}
                              disabled={v.total_stock === 0}
                              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-semibold flex items-center gap-2 ${isSelected
                                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                                } ${v.total_stock === 0 ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                            >
                              {variantLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Store Info */}
                {product.store && (
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-100">
                    <div className="relative">
                      <Image
                        src={product.store.image_url || '/images/placeholder.png'}
                        alt={product.store.name}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      {product.store.is_verified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-white">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{product.store.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{product.store.address || 'Alamat tidak tersedia'}</p>
                    </div>
                    <Link
                      href={`/store/${product.store.id}`}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:border-emerald-400 hover:text-emerald-600 transition"
                    >
                      Kunjungi Toko
                    </Link>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="flex flex-col gap-3 pt-4 border-t">
                  <span className="text-gray-700 font-semibold">Tentukan Jumlah:</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg border-gray-300 bg-white">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition font-bold"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center border-x border-gray-300 outline-none py-3 font-bold text-emerald-600"
                      />
                      <button
                        onClick={() => {
                          if (totalStock !== null && quantity >= totalStock) {
                            toast.error(`Kuantitas melebihi stok yang tersedia (${totalStock})`);
                            return;
                          }
                          setQuantity(quantity + 1);
                        }}
                        className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={totalStock !== null && totalStock === 0}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart size={20} />
                      {isValidating ? (
                        "Sedang memvalidasi..."
                      ) : totalStock !== null && totalStock === 0 ? (
                        'Stok Habis'
                      ) : (
                        'Tambah ke Keranjang'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <LoginShareCommission
        open={showShareModal}
        onOpenChange={setShowShareModal}
        productId={productId}
        onLoginSuccess={handleShareSuccess}
      />
    </div>
  );
}
