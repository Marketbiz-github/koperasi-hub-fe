"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { ShoppingCart, Star, Loader2, Search, Package, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { productService, storeService, userService, debtService, orderService, affiliationService } from "@/services/apiService"
import { getAccessToken } from "@/utils/auth"
import { toast } from "sonner"
import { getSafeImageSrc } from "@/utils/image"
import { useAuthStore } from "@/store/authStore"
import { SearchableSelect } from "@/components/ui/searchable-select"
import InfiniteScrollTrigger from "@/components/ui/InfiniteScrollTrigger"
import ScrollToTop from "@/components/ui/ScrollToTop"

interface Product {
  id: number
  name: string
  slug: string
  sku: string
  price: string | number
  status: string
  images?: { image_url: string; is_primary: boolean }[] | null
  product_category?: { name: string } | null
  product_variants?: any[] | null
  variants?: any[] | null
  store?: {
    id: number | string;
    subdomain: string;
    domain?: string | null;
  };
}

interface Vendor {
  id: number
  name: string
  logo: string | null
  description: string | null
}

function ProductCardComponent({ product }: { product: Product }) {
  const router = useRouter()
  const addItem = useCartStore((s: any) => s.addItem)
  const currentUser = useAuthStore((s) => s.user)
  const { token } = useAuthStore()
  const [isValidating, setIsValidating] = useState(false)
  const [showAffiliateDialog, setShowAffiliateDialog] = useState(false)
  const [isRequestingAffiliation, setIsRequestingAffiliation] = useState(false)
  const [isAffiliated, setIsAffiliated] = useState(false)

  const handleRequestAffiliation = async () => {
    if (!token) {
      toast.error("Anda harus login terlebih dahulu")
      return
    }

    const storeId = (product as any).store_id || product.store?.id || 1
    setIsRequestingAffiliation(true)
    try {
      const storeRes = await storeService.getDetail(token, storeId)
      const parentId = storeRes.data?.user_id

      if (!parentId) {
        toast.error("Data vendor tidak ditemukan")
        return
      }

      await affiliationService.create(token, {
        parent_id: parentId,
        type: 'reseller_koperasi' // Note: Reseller usually affiliates with Koperasi
      })
      toast.success("Permintaan afiliasi berhasil dikirim. Silakan tunggu persetujuan.")
      setShowAffiliateDialog(false)
    } catch (error: any) {
      toast.error(error.message || "Gagal mengajukan afiliasi")
    } finally {
      setIsRequestingAffiliation(false)
    }
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const hasVariants = (product.product_variants && product.product_variants.length > 0) ||
      (product.variants && product.variants.length > 0)

    if (hasVariants) {
      router.push(`/dashboard/reseller/marketplace/${product.id}`)
      return
    }

    setIsValidating(true)
    try {
      const currentToken = token || await getAccessToken()
      if (!currentToken) return

      const storeId = (product as any).store_id || product.store?.id || 1

      // 1. Get vendor's user_id from store detail
      const storeRes = await storeService.getDetail(currentToken, storeId)
      const parentId = storeRes.data?.user_id

      // 2. Check Affiliation (Re-verify)
      let affiliated = isAffiliated
      if (parentId && currentUser?.id) {
        const affRes = await userService.checkAffiliation(currentToken, parentId, currentUser.id)
        affiliated = affRes.data?.is_affiliated === true
        setIsAffiliated(affiliated)
      }

      if (!affiliated) {
        setShowAffiliateDialog(true)
        return
      }

      // 3. Check unpaid POs / Debts for this specific product
      const debtRes = await debtService.getDebts({ buyer_id: currentUser?.id ? Number(currentUser.id) : undefined, user_id: parentId ? Number(parentId) : undefined, status: 'unpaid' }, currentToken)
      const debts = Array.isArray(debtRes.data?.debts) ? debtRes.data.debts : (Array.isArray(debtRes.data) ? debtRes.data : [])

      let isProductInUnpaidPO = false;
      for (const debt of debts) {
        if (debt.type === 'po' && debt.order_id) {
          try {
            const orderRes = await orderService.getOrderDetail(debt.order_id, currentToken)
            const orderItems = orderRes.data?.items || []
            if (orderItems.some((item: any) => item.product_id === Number(product.id))) {
              isProductInUnpaidPO = true;
              break;
            }
          } catch (err) {
            console.error("Error fetching order details for debt", err)
          }
        }
      }

      if (isProductInUnpaidPO) {
        toast.error("Anda masih memiliki pesanan/PO yang belum lunas untuk produk ini di vendor ini.")
        return
      }

      const rawImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url
      const primaryImage = getSafeImageSrc(rawImage)

      addItem({
        id: product.id.toString(),
        name: product.name,
        price: Number(product.price),
        image: primaryImage,
        category: product.product_category?.name || "Uncategorized",
        quantity: 1,
        storeId: Number(storeId),
        variantId: 0,
      })
      toast.success(`${product.name} ditambahkan ke keranjang`)
    } catch (error) {
      console.error("Validation error:", error)
      toast.error("Terjadi kesalahan saat memvalidasi. Silakan coba lagi.")
    } finally {
      setIsValidating(false)
    }
  }

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  }

  const rawImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url
  const primaryImage = getSafeImageSrc(rawImage)

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col group">
      <Link href={`/dashboard/reseller/marketplace/${product.id}`} className="block">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      </Link>

      <div className="p-3 flex-1 flex flex-col">
        <p className="text-xs text-gray-500 mb-1">{product.product_category?.name || "Uncategorized"}</p>
        <Link href={`/dashboard/reseller/marketplace/${product.id}`} className="hover:text-emerald-600 transition-colors">
          <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
            {product.name}
          </h3>
        </Link>
        <p className="text-base font-bold text-emerald-600 mb-3">
          {formatCurrency(product.price)}
        </p>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={isValidating}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sedang memvalidasi...</>
            ) : ((product.product_variants && product.product_variants.length > 0) || (product.variants && product.variants.length > 0)) ? (
              <>Lihat Detail</>
            ) : (
              <><ShoppingCart size={14} /> Tambah</>
            )}
          </button>
        </div>
      </div>
      
      <Dialog open={showAffiliateDialog} onOpenChange={setShowAffiliateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajukan Afiliasi ke Vendor</DialogTitle>
            <DialogDescription>
              Anda harus terafiliasi dengan vendor ini sebelum dapat membeli produk mereka. Apakah Anda ingin mengirimkan permintaan afiliasi?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowAffiliateDialog(false)}>Batal</Button>
            <Button onClick={handleRequestAffiliation} disabled={isRequestingAffiliation} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isRequestingAffiliation ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Ajukan Afiliasi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function MarketplaceResellerPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedVendor, setSelectedVendor] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isVendorsLoading, setIsVendorsLoading] = useState(true)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const limit = 12

  const cartItems = useCartStore((s: any) => s.items)

  const fetchVendors = useCallback(async () => {
    try {
      const { token } = useAuthStore.getState()
      const res = await storeService.getStores(token as string, { limit: 100 })
      if (res.data) {
        if (Array.isArray(res.data)) {
          setVendors(res.data)
        } else if (res.data.data && Array.isArray(res.data.data)) {
          setVendors(res.data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      toast.error('Gagal memuat daftar vendor')
    } finally {
      setIsVendorsLoading(false)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    if (currentPage === 1) {
      setIsLoading(true)
    } else {
      setIsFetchingMore(true)
    }
    try {
      const token = await getAccessToken()
      const params: any = {
        page: currentPage,
        limit: limit,
        target_customer: 'reseller',
        status: 'active'
      }

      if (selectedVendor !== "all") {
        params.store_id = Number(selectedVendor)
      }

      if (searchQuery) {
        params.name = searchQuery
      }

      const hasFilters = searchQuery !== "" || selectedVendor !== "all";

      const res = hasFilters 
        ? await productService.searchProducts(params, token || undefined)
        : await productService.getProducts(params, token || undefined)
      
      if (res.data) {
        const fetchedProducts = res.data.data || (Array.isArray(res.data) ? res.data : [])
        setProducts(prev => currentPage === 1 ? fetchedProducts : [...prev, ...fetchedProducts])
        setTotalPages(Math.ceil((res.data.meta?.total || 0) / limit))
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Gagal memuat produk')
    } finally {
      setIsLoading(false)
      setIsFetchingMore(false)
    }
  }, [currentPage, selectedVendor, searchQuery])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProducts()
  }

  const selectedVendorData = Array.isArray(vendors) ? vendors.find(v => v.id.toString() === selectedVendor) : undefined

  return (
    <div className="space-y-6">
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Marketplace Pembelian</h1>
            <p className="text-sm text-gray-500 mt-1">Dashboard Reseller - Belanja Produk dari Koperasi</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <aside className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cari Produk</label>
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    placeholder="Nama produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                  <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
                    <Search size={18} />
                  </button>
                </form>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Toko</label>
                <SearchableSelect
                  options={[{ id: 'all', name: 'Semua Toko' }, ...vendors]}
                  value={selectedVendor}
                  onValueChange={(val) => {
                    setSelectedVendor(val)
                    setCurrentPage(1)
                  }}
                  placeholder="Pilih Toko"
                  searchPlaceholder="Cari toko..."
                />
              </div>

              {selectedVendorData && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border flex-shrink-0 relative">
                      {selectedVendorData.logo ? (
                        <Image src={getSafeImageSrc(selectedVendorData.logo)} alt={selectedVendorData.name} fill className="object-cover" />
                      ) : (
                        <Package className="m-auto text-gray-300 mt-3" size={24} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{selectedVendorData.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">Toko Terverifikasi</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
              <p className="text-gray-500">Memuat produk untuk Anda...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => {
                  return (
                    <ProductCardComponent 
                      key={p.id} 
                      product={p} 
                    />
                  )
                })}
              </div>

              <InfiniteScrollTrigger
                onIntersect={() => setCurrentPage(prev => prev + 1)}
                isLoading={isFetchingMore}
                hasMore={currentPage < totalPages}
                loadingText="Memuat lebih banyak produk..."
              />
            </div>
          ) : (
            <Card>
              <CardContent className="py-20 text-center space-y-4">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <Package className="text-gray-300" size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Produk Tidak Ditemukan</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">
                    {searchQuery
                      ? `Maaf, kami tidak menemukan produk "${searchQuery}". Coba kata kunci lain.`
                      : "Maaf, belum ada produk tersedia di kategori atau vendor ini."}
                  </p>
                </div>
                {(searchQuery || selectedVendor !== "all") && (
                  <Button
                    variant="link"
                    className="text-emerald-600"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedVendor("all")
                      setCurrentPage(1)
                    }}
                  >
                    Reset Filter
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <ScrollToTop />
    </div>
  )
}
