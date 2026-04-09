'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, X, CreditCard, Clock, CheckCircle2, Loader2,
  Landmark, ShoppingCart, Trash2, ChevronLeft, Ticket,
  Gift, Info, Truck, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCartStore } from '@/store/cartStore';
import { useMounted } from '@/hooks/useMounted';
import {
  productService, storeService, productVariantService,
  inventoryService, orderService
} from '@/services/apiService';
import { getPublicAccessToken } from '@/utils/auth';
import { getSafeImageSrc } from '@/utils/image';
import ShippingForm from '@/components/ShippingForm';
import CartItem from '../components/CartItem';
import CartHeader from '../components/CartHeader';
import CartFooter from '../components/CartFooter';

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeIdParam = searchParams.get('store_id');
  const mounted = useMounted();

  const {
    items,
    removeItem,
    removeItems,
    updateQuantity,
    selectAll,
    selectedItems,
    toggleSelectItem,
  } = useCartStore();

  const formatCurrency = (amount: number | string) => {
    const value = typeof amount === 'string' ? parseInt(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  // --- States ---
  const [storeInfoMap, setStoreInfoMap] = useState<Record<number, any>>({});
  const [isFetchingStores, setIsFetchingStores] = useState(false);

  const [cartDetails, setCartDetails] = useState<Record<string, any>>({});
  const [variantDetailMap, setVariantDetailMap] = useState<Record<string, any>>({});
  const [productStockMap, setProductStockMap] = useState<Record<string, number>>({});
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [selectedRate, setSelectedRate] = useState<any>(null);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [shippingNotes, setShippingNotes] = useState("");
  const [paymentCategory, setPaymentCategory] = useState<"instant" | "piutang">("instant");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccessData, setCheckoutSuccessData] = useState<{ orderId: number, paymentUrl: string | null } | null>(null);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  // --- Logic ---

  // Group items by store
  const storeGroups = useMemo(() => {
    const groups: Record<number, any[]> = {};
    items.forEach(item => {
      const sId = Number(item.storeId || 1);
      if (!groups[sId]) groups[sId] = [];
      groups[sId].push(item);
    });
    return groups;
  }, [items]);

  // Filtered items based on selected store
  const filteredItems = useMemo(() => {
    if (!storeIdParam) return [];
    return items.filter(it => String(it.storeId) === String(storeIdParam));
  }, [items, storeIdParam]);

  const currentItems = filteredItems;

  const storeDetail = useMemo(() => {
    if (!storeIdParam) return null;
    return storeInfoMap[Number(storeIdParam)];
  }, [storeIdParam, storeInfoMap]);

  // Fetch store info for ALL unique stores (for multi-store picker)
  useEffect(() => {
    const uniqueStoreIds = [...new Set(items.map(it => Number(it.storeId || 1)).filter(id => id > 0))];
    if (uniqueStoreIds.length === 0) return;

    const fetchStoreInfos = async () => {
      setIsFetchingStores(true);
      const token = await getPublicAccessToken();
      const map: Record<number, any> = { ...storeInfoMap };
      let hasChanged = false;

      try {
        await Promise.all(
          uniqueStoreIds.map(async (sId) => {
            if (map[sId]) return;
            try {
              const res = await storeService.getDetail(token || "", sId);
              if (res.data) {
                map[sId] = res.data;
                hasChanged = true;
              }
            } catch (e) {
              console.error("Error fetching store:", e);
            }
          })
        );
      } finally {
        setIsFetchingStores(false);
      }

      if (hasChanged) {
        setStoreInfoMap(map);
      }
    };
    fetchStoreInfos();
  }, [items]);

  // Fetch details, variants, stocks for filtered items
  useEffect(() => {
    if (filteredItems.length === 0) return;

    const fetchData = async () => {
      setIsLoadingDetails(true);
      try {
        const token = await getPublicAccessToken();
        const details: Record<string, any> = { ...cartDetails };
        const vDetails: Record<string, any> = { ...variantDetailMap };
        const pStocks: Record<string, number> = { ...productStockMap };

        await Promise.all(
          filteredItems.map(async (item) => {
            try {
              const res = await productService.getProductDetail(item.id, token || "");
              details[item.id] = res.data;

              if (!vDetails[item.id]) {
                const vRes = await productVariantService.getList(token || "", item.id);
                vDetails[item.id] = vRes.data;
              }

              if (!pStocks[item.id]) {
                const sRes = await inventoryService.getStockByProduct(token || "", item.id);
                if (Array.isArray(sRes.data)) {
                  pStocks[item.id] = sRes.data.reduce((acc: number, curr: any) => acc + (curr.stock || 0), 0);
                } else {
                  pStocks[item.id] = typeof sRes.data === 'number' ? sRes.data : (sRes.data?.total_stock ?? 0);
                }
              }
            } catch (err) {
              console.error(`Error fetching detail ${item.id}:`, err);
            }
          })
        );
        setCartDetails(details);
        setVariantDetailMap(vDetails);
        setProductStockMap(pStocks);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    fetchData();
  }, [filteredItems]);

  // --- Calculations ---
  const totalOriginalPrice = useMemo(() => {
    return filteredItems
      .filter((it) => selectedItems.has(it.id))
      .reduce((sum, it) => {
        const detail = cartDetails[it.id];
        const variants = variantDetailMap[it.id] || [];
        const variantDetail = variants.find((v: any) => String(v.id) === String(it.variantId));

        const price = variantDetail ? Number(variantDetail.price) : (detail?.price ? parseInt(detail.price) : (it.price || 0));
        return sum + price * it.quantity;
      }, 0);
  }, [filteredItems, selectedItems, cartDetails, variantDetailMap]);

  const totalDiscount = useMemo(() => {
    return filteredItems
      .filter((it) => selectedItems.has(it.id))
      .reduce((sum, it) => {
        const detail = cartDetails[it.id];
        if (detail?.discount_price) {
          const price = parseInt(detail.price);
          const discountPrice = parseInt(detail.discount_price);
          return sum + (price - discountPrice) * it.quantity;
        }
        return sum;
      }, 0);
  }, [filteredItems, selectedItems, cartDetails]);

  const subtotal = totalOriginalPrice - totalDiscount;

  const totalCashback = useMemo(() => {
    return filteredItems
      .filter((it) => selectedItems.has(it.id))
      .reduce((sum, it) => {
        const detail = cartDetails[it.id];
        if (detail?.is_cashback) {
          const val = parseInt(detail.cashback_value);
          if (detail.cashback_unit === 'percent') {
            const price = detail.discount_price ? parseInt(detail.discount_price) : parseInt(detail.price);
            return sum + (price * (val / 100)) * it.quantity;
          } else {
            return sum + val * it.quantity;
          }
        }
        return sum;
      }, 0);
  }, [filteredItems, selectedItems, cartDetails]);

  const tax = Math.round(subtotal * 0.1);
  const baseShippingCost = selectedRate?.price || 0;

  const shippingDiscount = useMemo(() => {
    if (baseShippingCost <= 0) return 0;
    const isStoreGratis = storeDetail?.is_gratis_ongkir === "1" || storeDetail?.is_gratis_ongkir === 1;
    const minOrder = Number(storeDetail?.gratis_ongkir_min_order || 0);
    const isStoreThresholdMet = isStoreGratis && subtotal >= minOrder;
    const freeShippingItem = filteredItems
      .filter(it => selectedItems.has(it.id))
      .find(it => cartDetails[it.id]?.is_gratis_ongkir);

    if (!isStoreThresholdMet && !freeShippingItem) return 0;
    return baseShippingCost; // Full discount
  }, [baseShippingCost, storeDetail, subtotal, filteredItems, selectedItems, cartDetails]);

  const finalShippingCost = baseShippingCost - shippingDiscount;
  const finalTotal = subtotal + tax + finalShippingCost;

  const isShippingValid = useMemo(() => {
    if (!shippingAddress) return false;
    return (
      !!shippingAddress.name?.trim() &&
      !!shippingAddress.phone?.trim() &&
      !!shippingAddress.address_detail?.trim() &&
      !!shippingAddress.province &&
      !!shippingAddress.city &&
      !!shippingAddress.district &&
      !!shippingAddress.zipcode
    );
  }, [shippingAddress]);

  const handleCheckout = async () => {
    if (selectedItems.size === 0) {
      toast.error("Pilih minimal satu item untuk checkout");
      return;
    }
    if (!selectedRate || !shippingAddress) {
      toast.error("Mohon lengkapi informasi pengiriman");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getPublicAccessToken();
      const selectedCartItems = filteredItems.filter(it => selectedItems.has(it.id));

      const orderData = {
        store_id: Number(storeIdParam),
        shipping_address: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address: shippingAddress.address_detail,
          province: shippingAddress.province,
          city: shippingAddress.city,
          district: shippingAddress.district,
          subdistrict: shippingAddress.subdistrict,
          zipcode: shippingAddress.zipcode,
        },
        items: selectedCartItems.map(item => ({
          product_id: Number(item.id),
          product_variant_id: Number(item.variantId) || 0,
          quantity: item.quantity
        })),
        shipping_cost: baseShippingCost,
        shipping_discount: shippingDiscount,
        courier_name: selectedRate.courier_name,
        courier_code: selectedRate.courier_code,
        courier_service: selectedRate.courier_service_code,
        warehouse_id: warehouseId,
        customer_notes: shippingNotes,
        payment_category: "instant",
        // Affiliate attribution
        shared_product_id: Number(localStorage.getItem('shared_product_id')) || undefined,
        shared_code: localStorage.getItem('last_share_code') || undefined,
      };

      const returnUrl = `${window.location.origin}/marketplace/thankyou`;
      const orderDataWithReturn = {
        ...orderData,
        return_url: returnUrl
      };

      const res = await orderService.createOrder(orderDataWithReturn, token || "");
      if (res.data) {
        toast.success("Pesanan berhasil dibuat!");
        removeItems(Array.from(selectedItems));

        // Use standard 'url' or 'payment_url' field from response
        const paymentUrl = res.data.url || res.data.payment_url;
        
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }

        setCheckoutSuccessData({
          orderId: res.data.order?.id || res.data.id || 0,
          paymentUrl: paymentUrl || null
        });
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Gagal membuat pesanan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" />
      </div>
    );
  }

  // --- No Items View ---
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <CartHeader />
        <main className="grow flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <Card className="py-12 shadow-sm border-emerald-100">
              <CardContent className="flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <ShoppingCart size={40} className="text-emerald-300" />
                </div>
                <h2 className="text-xl font-bold mb-2">Keranjang Anda Kosong</h2>
                <p className="text-gray-500 mb-8 text-sm">Mulai belanja dan temukan produk terbaik untuk Anda.</p>
                <Link href="/marketplace" className="w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 font-bold shadow-lg shadow-emerald-100">
                    Mulai Belanja
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
        <CartFooter />
      </div>
    );
  }

  // --- Store Picker View ---
  if (!storeIdParam && Object.keys(storeGroups).length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <CartHeader />
        <main className="grow">
          <div className="max-w-6xl mx-auto py-12 px-4 space-y-6">
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">Pilih Keranjang Belanja</h1>
              <p className="text-gray-500 text-sm">Silahkan pilih toko untuk melanjutkan pembayaran.</p>
            </div>

            {isFetchingStores ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-emerald-200">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
                <p className="text-gray-500 font-medium text-sm">Memuat info toko...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(storeGroups).map(([sId, sItems]) => {
                  const info = storeInfoMap[Number(sId)] || {};
                  const name = info.name || `Toko ${sId}`;
                  const logo = info.logo_url || info.logo || info.image;
                  return (
                    <Card
                      key={sId}
                      className="hover:border-emerald-500 transition-all cursor-pointer shadow-sm hover:shadow-md border-transparent"
                      onClick={() => router.push(`/marketplace/cart?store_id=${sId}`)}
                    >
                      <CardHeader className="pb-3 px-4">
                        <CardTitle className="text-lg flex items-center gap-4">
                          <div className="relative h-14 w-14 rounded-full bg-emerald-50 overflow-hidden shrink-0 border border-emerald-100 flex items-center justify-center">
                            {logo ? (
                              <Image src={getSafeImageSrc(logo)} alt={name} fill className="object-cover" />
                            ) : (
                              <span className="text-emerald-600 font-bold text-xl">
                                {name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="line-clamp-1 text-base font-bold text-gray-900">{name}</span>
                            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1.5">
                              <ShoppingCart size={14} /> {sItems.length} Produk dalam keranjang
                            </p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
        <CartFooter />
      </div>
    );
  }

  // --- Main Cart View (Selected Store) ---
  const isAllSelected = filteredItems.length > 0 && filteredItems.every(it => selectedItems.has(it.id));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CartHeader />
      <main className="grow">
        <div className="max-w-7xl mx-auto py-8 px-4">
          {/* Success Modal */}
          {checkoutSuccessData && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <Card className="w-full max-w-md bg-white shadow-2xl animate-in zoom-in-95 duration-300">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 shadow-sm" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Checkout Berhasil!</CardTitle>
                  <div className="text-sm text-gray-500 mt-2 px-6">
                    {checkoutSuccessData.paymentUrl ? (
                      <p>Pesanan Anda telah dicatat. Silahkan lanjut ke laman pembayaran.</p>
                    ) : (
                      <p>Pesanan Anda sedang dalam proses.</p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-6 px-8 pb-8">
                  {checkoutSuccessData.paymentUrl && (
                    <Button
                      onClick={() => window.open(checkoutSuccessData.paymentUrl!, '_blank')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-bold shadow-lg"
                    >
                      Lanjut Bayar Sekarang
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base font-semibold"
                    onClick={() => {
                      setCheckoutSuccessData(null);
                      router.push('/marketplace');
                    }}
                  >
                    Kembali Belanja
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <Link href="/marketplace/cart" className="hover:text-emerald-600 transition-colors">Keranjang</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">{storeDetail?.name || 'Loading...'}</span>
              </div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <ShoppingCart className="text-emerald-600" />
                Keranjang Belanja {storeDetail?.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Pilih item yang ingin Anda bayar</p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: Items & Shipping */}
            <div className="lg:col-span-8 space-y-6">
              {/* Item Selection Header */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Item Keranjang ({currentItems.length})</CardTitle>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={isAllSelected}
                      onChange={(e) => selectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                    />
                    <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                      Pilih Semua
                    </Label>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentItems.map((item) => {
                    const detail = cartDetails[item.id]
                    const variants = variantDetailMap[item.id] || []

                    let totalStock: number | undefined = undefined;
                    if (item.variantId) {
                      const matchedVariant = variants.find((v: any) => v.id === item.variantId)
                      totalStock = matchedVariant ? matchedVariant.total_stock : undefined
                    } else {
                      totalStock = productStockMap[item.id]
                    }

                    const isInsufficientStock = totalStock !== undefined && totalStock < item.quantity

                    return (
                      <div
                        key={item.id}
                        className={`flex gap-4 pb-4 border-b last:border-b-0 last:pb-0 transition-opacity ${selectedItems.has(item.id) ? "opacity-100" : "opacity-60"
                          }`}
                      >
                        <div className="flex flex-col items-center pt-1 gap-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={() => toggleSelectItem(item.id)}
                            disabled={isInsufficientStock}
                            className={`h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer ${isInsufficientStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                        </div>

                        {/* Product Image */}
                        <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {(() => {
                            const primaryImg = detail?.images?.find((img: any) => img.is_primary)?.image_url ||
                              detail?.images?.[0]?.image_url ||
                              detail?.image ||
                              item.image;
                            return primaryImg ? (
                              <Image
                                src={primaryImg}
                                alt={detail?.name || item.name || "Product"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                {isLoadingDetails ? <Loader2 className="animate-spin" /> : "No Image"}
                              </div>
                            )
                          })()}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-0.5 truncate">
                            {detail?.name || item.name || (isLoadingDetails ? "Memuat..." : "Produk")}
                          </h3>
                          <p className="text-xs text-gray-500 mb-1.5">
                            {detail?.product_category?.name || detail?.category_name || detail?.category || item.category || ""}
                          </p>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {detail?.is_gratis_ongkir && (
                              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 text-[10px] px-1.5 py-0">
                                Free Shipping
                              </Badge>
                            )}
                            {detail?.is_cashback && (
                              <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-100 text-[10px] px-1.5 py-0">
                                Cashback {detail.cashback_value}{detail.cashback_unit === 'percent' ? '%' : ''}
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-0.5">
                            {detail?.discount_price && (
                              <p className="text-xs text-gray-400 line-through">
                                {formatCurrency(detail.price)}
                              </p>
                            )}
                            <p className="font-bold text-emerald-600">
                              {formatCurrency(detail?.discount_price || detail?.price || item.price)}
                            </p>
                          </div>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="flex flex-col justify-between items-end">
                          <button
                            onClick={() => setItemToRemove(item.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          >
                            <Trash2 size={18} />
                          </button>

                          <div className="flex items-center border rounded-lg bg-gray-50">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              className="px-2 py-1 text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              −
                            </button>
                            <span className="px-3 py-1 text-sm font-semibold min-w-[30px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={totalStock !== undefined && item.quantity >= totalStock}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex flex-col gap-1 items-end mt-1 shrink-0">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency((detail?.discount_price ? parseInt(detail.discount_price) : (detail?.price ? parseInt(detail.price) : (item.price || 0))) * item.quantity)}
                            </p>
                            {totalStock !== undefined ? (
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${isInsufficientStock ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-200 text-gray-500'}`}>
                                Stok: {totalStock}
                              </Badge>
                            ) : null}
                            {isInsufficientStock && <span className="text-[10px] text-red-500 font-medium">Stok tidak cukup</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Shipping Form */}
              <ShippingForm
                items={filteredItems.filter(it => selectedItems.has(it.id))}
                storeId={Number(storeIdParam)}
                storeCouriers={storeDetail?.courier}
                onSelectRate={(rate, whId, addr, notes) => {
                  setSelectedRate(rate);
                  setWarehouseId(whId);
                  setShippingAddress(addr);
                  setShippingNotes(notes);
                }}
              />
            </div>

            {/* RIGHT COLUMN: Summary */}
            <div className="lg:col-span-4">
              <Card className="sticky top-8 shadow-sm border-emerald-100 overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    Ringkasan Belanja
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cost Breakdown */}
                  <div className="space-y-3 text-sm border-b pb-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Total Harga ({selectedItems.size} barang)</span>
                      <span>Rp{totalOriginalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span className="flex items-center gap-1"><Ticket size={14} className="text-rose-500" /> Total Diskon Produk</span>
                        <span className="text-rose-600 font-medium">-Rp{totalDiscount.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>PPN (10%)</span>
                      <span>Rp{tax.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="flex items-center gap-1"><Truck size={14} /> Biaya Ongkir</span>
                      <span>{selectedRate ? `Rp${baseShippingCost.toLocaleString('id-ID')}` : '-'}</span>
                    </div>
                    {shippingDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">
                        <span className="flex items-center gap-1"><Gift size={14} /> Gratis Ongkir</span>
                        <span>-Rp{shippingDiscount.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>

                  {/* Benefits */}
                  {totalCashback > 0 && (
                    <div className="bg-amber-50 p-2 rounded border border-amber-100 flex items-center gap-2">
                      <Info size={16} className="text-amber-600 shrink-0" />
                      <p className="text-[11px] text-amber-800">
                        Kamu akan mendapatkan cashback sebesar <strong>Rp{totalCashback.toLocaleString('id-ID')}</strong> setelah pesanan selesai.
                      </p>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between items-center py-2">
                    <span className="font-bold text-gray-900">Total Tagihan</span>
                    <span className="font-extrabold text-xl text-emerald-600">Rp{finalTotal.toLocaleString('id-ID')}</span>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-lg shadow-emerald-200"
                    disabled={selectedItems.size === 0 || !selectedRate || !isShippingValid || isSubmitting}
                    onClick={handleCheckout}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses...</>
                    ) : (
                      "Bayar Sekarang"
                    )}
                  </Button>

                  {!isShippingValid && selectedRate && (
                    <div className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 animate-pulse">
                      <Info size={12} />
                      <p>Lengkapi Nama, No. HP, dan Alamat Detail di Info Pengiriman.</p>
                    </div>
                  )}

                  <p className="text-[10px] text-gray-400 text-center">
                    Dengan mengklik tombol belanja, Anda menyetujui <span className="underline">Syarat & Ketentuan</span> kami.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!itemToRemove} onOpenChange={() => setItemToRemove(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Barang?</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus barang ini dari keranjang belanja?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setItemToRemove(null)}>Batal</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (itemToRemove) {
                    removeItem(itemToRemove);
                    setItemToRemove(null);
                    toast.success("Barang berhasil dihapus");
                  }
                }}
              >
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <CartFooter />
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600 h-10 w-10" />
      </div>
    }>
      <CartContent />
    </Suspense>
  );
}
