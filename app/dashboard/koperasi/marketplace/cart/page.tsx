"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, ChevronLeft, ShoppingCart, CreditCard, Clock, FileText, Loader2, CheckCircle2, Ticket, Gift, Edit2, Info } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { productService, storeService, productVariantService, inventoryService } from "@/services/apiService"
import { useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import ShippingForm from "@/components/ShippingForm"
import { Badge } from "@/components/ui/badge"
import { getSafeImageSrc } from "@/utils/image"
import { getAccessToken } from "@/utils/auth"
import { useSearchParams } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function CartPage() {
  const router = useRouter()
  const {
    items,
    removeItem,
    removeItems,
    updateQuantity,
    clearCart,
    selectedItems,
    toggleSelectItem,
    selectAll,
    selectedTotalPrice
  } = useCartStore()

  const searchParams = useSearchParams()
  const storeIdParam = searchParams.get("store_id")

  const [coupon, setCoupon] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cartDetails, setCartDetails] = useState<Record<string, any>>({})
  const [storeDetail, setStoreDetail] = useState<any>(null)
  const [storeInfoMap, setStoreInfoMap] = useState<Record<number, any>>({})
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isFetchingStores, setIsFetchingStores] = useState(false)
  const [customerNotes, setCustomerNotes] = useState("")
  const [variantDetailMap, setVariantDetailMap] = useState<Record<string, any[]>>({})
  const [productStockMap, setProductStockMap] = useState<Record<string, number>>({})
  const [checkoutSuccessData, setCheckoutSuccessData] = useState<{ orderId: number, paymentUrl: string | null } | null>(null)

  // Filter items by store
  const filteredItems = useMemo(() => {
    if (!storeIdParam) return items
    return items.filter(it => it.storeId === Number(storeIdParam))
  }, [items, storeIdParam])

  // Fetch store info for ALL unique stores (for multi-store picker)
  useEffect(() => {
    const uniqueStoreIds = [...new Set(items.map(it => Number(it.storeId)).filter(id => id > 0))]
    if (uniqueStoreIds.length === 0) return

    const fetchStoreInfos = async () => {
      setIsFetchingStores(true)
      const token = await getAccessToken()
      const map: Record<number, any> = { ...storeInfoMap }
      let hasChanged = false

      try {
        await Promise.all(
          uniqueStoreIds.map(async (sId) => {
            if (map[sId]) return // Skip if already fetched
            try {
              const res = await storeService.getDetail(token || "", sId)
              if (res.data) {
                map[sId] = res.data
                hasChanged = true
              }
            } catch (e) {
              console.error("Error fetching store:", e)
            }
          })
        )
      } finally {
        setIsFetchingStores(false)
      }

      if (hasChanged) {
        setStoreInfoMap(map)
      }
    }
    fetchStoreInfos()
  }, [items])

  // Payment States
  const [paymentCategory, setPaymentCategory] = useState<"instant" | "piutang">("instant")
  const [debtType, setDebtType] = useState<"tenor" | "po">("tenor")
  const [tenorMonths, setTenorMonths] = useState("3")

  // Shipping States
  const [selectedRate, setSelectedRate] = useState<any>(null)
  const [warehouseId, setWarehouseId] = useState<number | null>(null)
  const [shippingAddress, setShippingAddress] = useState<any>(null)
  const [isAddressLocked, setIsAddressLocked] = useState(false)

  const [itemToRemove, setItemToRemove] = useState<string | null>(null)

  // Fetch product details and store details
  useEffect(() => {
    const fetchData = async () => {
      if (filteredItems.length === 0) return
      setIsLoadingDetails(true)
      const details: Record<string, any> = {}
      const vDetails: Record<string, any[]> = {}
      const pStocks: Record<string, number> = {}
      try {
        const token = await getAccessToken()

        // Fetch Store Detail if we have a storeId
        const activeStoreId = filteredItems[0]?.storeId;
        if (activeStoreId) {
          try {
            const sRes = await storeService.getDetail(token || "", activeStoreId)
            setStoreDetail(sRes.data)
          } catch (err) {
            console.error("Error fetching store detail:", err)
          }
        }

        await Promise.all(
          filteredItems.map(async (item) => {
            try {
              const res = await productService.getProductDetail(item.id, token || undefined)
              details[item.id] = res.data

              if (!vDetails[item.id]) {
                const vRes = await productVariantService.getList(token || "", item.id)
                vDetails[item.id] = vRes.data
              }

              if (!pStocks[item.id]) {
                try {
                  const sRes = await inventoryService.getStockByProduct(token || "", item.id)
                  if (Array.isArray(sRes.data)) {
                    pStocks[item.id] = sRes.data.reduce((acc: number, curr: any) => acc + (curr.stock || 0), 0)
                  } else {
                    pStocks[item.id] = typeof sRes.data === 'number' ? sRes.data : (sRes.data?.total_stock ?? 0)
                  }
                } catch (e) {
                  console.error(`Error fetching product stock ${item.id}:`, e)
                }
              }
            } catch (err) {
              console.error(`Error fetching detail for product ${item.id}:`, err)
            }
          })
        )
        setCartDetails(details)
        setVariantDetailMap(vDetails)
        setProductStockMap(pStocks)
      } finally {
        setIsLoadingDetails(false)
      }
    }
    fetchData()
  }, [filteredItems])

  const totalOriginalPrice = useMemo(() => {
    return filteredItems
      .filter((it) => selectedItems.has(it.id))
      .reduce((sum, it) => {
        const detail = cartDetails[it.id]
        const price = detail?.price ? parseInt(detail.price) : (it.price || 0)
        return sum + price * it.quantity
      }, 0)
  }, [items, selectedItems, cartDetails])

  const totalDiscount = useMemo(() => {
    return filteredItems
      .filter((it) => selectedItems.has(it.id))
      .reduce((sum, it) => {
        const detail = cartDetails[it.id]
        if (detail?.discount_price) {
          const price = parseInt(detail.price)
          const discountPrice = parseInt(detail.discount_price)
          return sum + (price - discountPrice) * it.quantity
        }
        return sum
      }, 0)
  }, [filteredItems, selectedItems, cartDetails])

  const subtotal = totalOriginalPrice - totalDiscount

  const totalCashback = useMemo(() => {
    return filteredItems
      .filter((it) => selectedItems.has(it.id))
      .reduce((sum, it) => {
        const detail = cartDetails[it.id]
        if (detail?.is_cashback) {
          const val = parseInt(detail.cashback_value)
          if (detail.cashback_unit === 'percent') {
            const price = detail.discount_price ? parseInt(detail.discount_price) : parseInt(detail.price)
            return sum + (price * (val / 100)) * it.quantity
          } else {
            return sum + val * it.quantity
          }
        }
        return sum
      }, 0)
  }, [filteredItems, selectedItems, cartDetails])

  const tax = Math.round(subtotal * 0.1)
  const baseShippingCost = selectedRate?.price || 0

  const shippingDiscount = useMemo(() => {
    if (baseShippingCost <= 0) return 0

    // 1. Check Store-wide Free Shipping
    const isStoreGratis = storeDetail?.is_gratis_ongkir === "1" || storeDetail?.is_gratis_ongkir === 1
    const minOrder = Number(storeDetail?.gratis_ongkir_min_order || 0)
    const isStoreThresholdMet = isStoreGratis && subtotal >= minOrder

    // 2. Check Per-product Free Shipping
    const freeShippingItem = filteredItems
      .filter(it => selectedItems.has(it.id))
      .find(it => cartDetails[it.id]?.is_gratis_ongkir)

    if (!isStoreThresholdMet && !freeShippingItem) return 0

    // Determine discount value
    let discountVal = 0
    if (isStoreThresholdMet) {
      // Use store's gratis_ongkir_value
      if (storeDetail?.gratis_ongkir_unit === 'percent') {
        const percent = Number(storeDetail?.gratis_ongkir_value || 0)
        discountVal = baseShippingCost * (percent / 100)
      } else {
        discountVal = Number(storeDetail?.gratis_ongkir_value || baseShippingCost)
      }
    } else if (freeShippingItem) {
      // Use product's gratis_ongkir_value
      const detail = cartDetails[freeShippingItem.id]
      if (detail?.gratis_ongkir_unit === 'percent') {
        const percent = Number(detail?.gratis_ongkir_value || 0)
        discountVal = baseShippingCost * (percent / 100)
      } else {
        discountVal = Number(detail?.gratis_ongkir_value || baseShippingCost)
      }
    }

    return Math.min(baseShippingCost, discountVal || 0)
  }, [filteredItems, selectedItems, cartDetails, storeDetail, baseShippingCost, subtotal])

  const shippingCost = Math.max(0, baseShippingCost - shippingDiscount)
  const total = subtotal + tax + shippingCost

  const isAllSelected = filteredItems.length > 0 && filteredItems.every(it => selectedItems.has(it.id))

  const handleSelectRate = (rate: any, whId: number, addr: any, notes: string) => {
    setSelectedRate(rate)
    setWarehouseId(whId)
    setShippingAddress(addr)
    setCustomerNotes(notes)
    setIsAddressLocked(true)
  }

  const handleResetAddress = () => {
    setIsAddressLocked(false)
    setSelectedRate(null)
    setShippingAddress(null)
  }

  const handleCheckout = async () => {
    if (selectedItems.size === 0) {
      toast.error("Pilih minimal satu item untuk checkout")
      return
    }

    if (!selectedRate || !shippingAddress) {
      toast.error("Mohon lengkapi informasi pengiriman dan pilih kurir")
      return
    }

    setIsSubmitting(true)
    try {
      const selectedCartItems = currentItems.filter(it => selectedItems.has(it.id))
      const firstItemDetail = cartDetails[selectedCartItems[0]?.id]
      const hasFreeShipping = selectedCartItems.some(it => cartDetails[it.id]?.is_gratis_ongkir)

      const orderData = {
        store_id: firstItemDetail?.store_id || selectedCartItems[0]?.storeId || 1,
        shipping_address: {
          name: shippingAddress.name || "User Koperasi",
          email: shippingAddress.email || "user@example.com",
          phone: shippingAddress.phone || "08123456789",
          address: shippingAddress.address_detail || shippingAddress.address,
          province: shippingAddress.province,
          city: shippingAddress.city,
          district: shippingAddress.district,
          subdistrict: shippingAddress.subdistrict,
          zipcode: shippingAddress.zipcode
        },
        items: selectedCartItems.map(item => {
          const detail = cartDetails[item.id]
          return {
            product_id: parseInt(item.id),
            product_variant_id: item.variantId || 0,
            quantity: item.quantity
          }
        }),
        shipping_cost: shippingCost,
        courier_name: selectedRate.courier_name,
        courier_code: selectedRate.courier_code,
        courier_service: selectedRate.courier_service_name,
        warehouse_id: warehouseId,
        customer_notes: customerNotes,
        payment_category: paymentCategory,
        is_gratis_ongkir: hasFreeShipping,
        ...(paymentCategory === "piutang" && {
          debt_type: debtType,
          ...(debtType === "tenor" && { tenor_months: parseInt(tenorMonths) })
        })
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Gagal membuat pesanan")
      }

      toast.success("Pesanan berhasil dibuat!")

      // Remove only selected items from cart
      removeItems(selectedCartItems.map(it => it.id))

      if (paymentCategory === "instant" && result.data?.payment_url) {
        window.open(result.data.payment_url, '_blank')
        setCheckoutSuccessData({
          orderId: result.data?.order?.id || 0,
          paymentUrl: result.data.payment_url
        })
      } else {
        router.push("/dashboard/koperasi/marketplace/pembelian")
      }
    } catch (error: any) {
      console.error("Checkout Error:", error)
      toast.error(error.message || "Terjadi kesalahan saat checkout")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: number | string | undefined) => {
    if (value === undefined || value === null) return "Rp0"
    const numeric = typeof value === 'string' ? parseInt(value) : value
    return `Rp${(numeric || 0).toLocaleString("id-ID")}`
  }

  // Map items by store to show multiple "carts" if no store_id is selected
  const storeGroups = useMemo(() => {
    const groups: Record<number, any[]> = {}
    items.forEach(it => {
      const sId = it.storeId || 0
      if (!groups[sId]) groups[sId] = []
      groups[sId].push(it)
    })
    return groups
  }, [items])

  const currentItems = filteredItems.length > 0 ? filteredItems : items

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/koperasi/marketplace">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Keranjang Belanja Koperasi</h1>
            <p className="text-sm text-gray-500">Lihat dan kelola pesanan Anda</p>
          </div>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">Keranjang Anda kosong</p>
            <Link href="/dashboard/koperasi/marketplace">
              <Button>Mulai Belanja</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!storeIdParam && Object.keys(storeGroups).length > 1) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Keranjang Belanja Koperasi</h1>
        <p className="text-sm text-gray-500">Anda memiliki item dari beberapa toko. Pilih keranjang untuk checkout.</p>

        {isFetchingStores ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
            <p className="text-gray-500">Memuat informasi toko...</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(storeGroups).map(([sId, sItems]) => {
              const info = storeInfoMap[Number(sId)] || {}
              const storeName = info.name || info.store_name || `Toko ${sId}`
              const storeLogo = info.logo_url || info.logo || info.image
              return (
                <Card key={sId} className="hover:border-emerald-500 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/koperasi/marketplace/cart?store_id=${sId}`)}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full bg-gray-100 overflow-hidden shrink-0 border">
                        {storeLogo ? (
                          <Image src={getSafeImageSrc(storeLogo)} alt={storeName} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-emerald-600 font-bold text-sm">
                            {storeName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{storeName}</p>
                        <Badge variant="outline" className="text-xs mt-0.5">{sItems.length} Produk</Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>

                    <Button className="w-full" variant="outline">Lihat Keranjang</Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/koperasi/marketplace">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Keranjang Belanja Koperasi</h1>
          <p className="text-sm text-gray-500">Pilih item yang ingin Anda bayar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-6">
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

          <ShippingForm
            onSelectRate={handleSelectRate}
            onAddressLocked={setIsAddressLocked}
            items={currentItems.filter(it => selectedItems.has(it.id))}
            storeId={cartDetails[currentItems.filter(it => selectedItems.has(it.id))[0]?.id]?.store_id || currentItems[0]?.storeId || 1}
            storeCouriers={storeDetail?.courier}
          />
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Harga ({selectedItems.size} barang)</span>
                <span className="font-semibold">{formatCurrency(totalOriginalPrice)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Diskon Produk</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(totalDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-medium pt-1 border-t border-dashed">
                <span className="text-gray-900">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Pajak (10%)</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Ongkos Kirim</span>
                <span className="font-semibold">{formatCurrency(baseShippingCost)}</span>
              </div>

              {shippingDiscount > 0 && (
                <div className="flex justify-between items-center text-sm text-emerald-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Ticket size={14} /> Potongan Ongkir
                  </span>
                  <span>-{formatCurrency(shippingDiscount)}</span>
                </div>
              )}
              {storeDetail?.is_gratis_ongkir === "1" && subtotal < Number(storeDetail?.gratis_ongkir_min_order || 0) && (
                <div className="p-2 bg-blue-50 rounded border border-blue-100 text-[10px] mt-2 text-blue-700">
                  <p className="flex items-center gap-1 font-medium">
                    <Info size={12} /> Tambah {formatCurrency(Number(storeDetail.gratis_ongkir_min_order) - subtotal)} lagi untuk mendapat gratis ongkir!
                  </p>
                </div>
              )}
              {totalCashback > 0 && (
                <div className="flex items-center justify-between p-2 bg-amber-50 rounded border border-amber-100 text-xs mt-2">
                  <div className="flex items-center gap-2">
                    <Gift size={14} className="text-amber-600" />
                    <span className="text-amber-700 font-medium">Estimasi Cashback</span>
                  </div>
                  <span className="text-amber-700 font-bold">{formatCurrency(totalCashback)}</span>
                </div>
              )}

              <div className="border-t pt-4 space-y-4">
                <label className="text-sm font-bold block">Metode Pembayaran</label>

                <RadioGroup
                  value={paymentCategory}
                  onValueChange={(v) => setPaymentCategory(v as any)}
                  className="grid gap-2"
                >
                  <div className={`flex items-start space-x-3 border p-3 rounded-lg cursor-pointer transition-all ${paymentCategory === "instant" ? "border-emerald-600 bg-emerald-50" : "hover:bg-gray-50"}`}>
                    <RadioGroupItem value="instant" id="instant" className="mt-1" />
                    <Label htmlFor="instant" className="flex-1 cursor-pointer font-medium">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard size={16} className="text-emerald-600" />
                        <span>Pembayaran Instan</span>
                      </div>
                    </Label>
                  </div>

                  <div className={`flex items-start space-x-3 border p-3 rounded-lg cursor-pointer transition-all ${paymentCategory === "piutang" ? "border-emerald-600 bg-emerald-50" : "hover:bg-gray-50"}`}>
                    <RadioGroupItem value="piutang" id="piutang" className="mt-1" />
                    <Label htmlFor="piutang" className="flex-1 cursor-pointer font-medium">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={16} className="text-amber-600" />
                        <span>Sistem Piutang</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentCategory === "piutang" && (
                  <div className="pl-4 pt-2 space-y-4 border-l-2 border-emerald-100">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Jenis Piutang</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={debtType === "tenor" ? "default" : "outline"}
                          size="sm"
                          className="flex-1 gap-2 h-9"
                          onClick={() => setDebtType("tenor")}
                        >
                          <Clock size={14} /> Tenor
                        </Button>
                        <Button
                          type="button"
                          variant={debtType === "po" ? "default" : "outline"}
                          size="sm"
                          className="flex-1 gap-2 h-9"
                          onClick={() => setDebtType("po")}
                        >
                          <FileText size={14} /> PO
                        </Button>
                      </div>
                    </div>

                    {debtType === "tenor" && (
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Jangka Waktu</Label>
                        <Select value={tenorMonths} onValueChange={setTenorMonths}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih tenor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Bulan</SelectItem>
                            <SelectItem value="3">3 Bulan</SelectItem>
                            <SelectItem value="6">6 Bulan</SelectItem>
                            <SelectItem value="12">12 Bulan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold text-lg">Total Tagihan</span>
                <span className="font-bold text-xl text-emerald-600">
                  {formatCurrency(total)}
                </span>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  disabled={isSubmitting || selectedItems.size === 0 || !selectedRate}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-base py-6 gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    paymentCategory === "instant" ? "Bayar Sekarang" : "Ajukan Pesanan"
                  )}
                </Button>

                <p className="text-[10px] text-center text-gray-400">
                  Dengan mengklik tombol di atas, Anda menyetujui syarat dan ketentuan yang berlaku.
                </p>
              </div>

              <Link href="/dashboard/koperasi/marketplace" className="block">
                <Button variant="outline" className="w-full">
                  Lanjut Belanja
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      {checkoutSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md bg-white shadow-xl animate-in zoom-in-95 fade-in-0">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-xl">Pesanan Berhasil!</CardTitle>
              <p className="text-sm text-gray-500 mt-2 hover:underline">
                Silahkan selesaikan pembayaran Instan Anda.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <Button
                onClick={() => {
                  if (checkoutSuccessData.paymentUrl) {
                    window.open(checkoutSuccessData.paymentUrl, '_blank')
                  }
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
              >
                Lanjut Bayar
              </Button>
              <Link href="/dashboard/koperasi/marketplace/pembelian" className="block w-full">
                <Button variant="outline" className="w-full h-11" onClick={() => setCheckoutSuccessData(null)}>
                  Lihat Pesanan
                </Button>
              </Link>
              <Link href="/dashboard/koperasi/marketplace" className="block w-full text-center mt-2">
                <button onClick={() => setCheckoutSuccessData(null)} className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4">
                  Kembali ke Belanja
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Item Removal Confirmation */}
      <Dialog open={!!itemToRemove} onOpenChange={(open) => !open && setItemToRemove(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus dari Keranjang?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus produk ini dari keranjang belanja?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setItemToRemove(null)}
              className="flex-1 sm:flex-none"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (itemToRemove) {
                  removeItem(itemToRemove)
                  setItemToRemove(null)
                  toast.success("Produk dihapus dari keranjang")
                }
              }}
              className="flex-1 sm:flex-none"
            >
              Hapus Produk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
