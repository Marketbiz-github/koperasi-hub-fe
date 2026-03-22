"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Star, Loader2, Search, Package, ChevronLeft, ChevronRight, Share2 } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { productService, storeService, userService, debtService, orderService } from "@/services/apiService"
import { getAccessToken } from "@/utils/auth"
import { toast } from "sonner"
import { getSafeImageSrc } from "@/utils/image"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import LoginShareCommission from "@/app/marketplace/components/LoginShareCommission"

interface Product {
  id: number
  name: string
  sku: string
  price: string | number
  status: string
  images?: { image_url: string; is_primary: boolean }[] | null
  product_category?: { name: string } | null
  product_variants?: any[] | null
  variants?: any[] | null
  store_id?: number
  slug?: string
}

interface Vendor {
  id: number
  name: string
  logo: string | null
  description: string | null
}

function ProductCardComponent({ product, onShare }: { product: Product, onShare: (p: Product) => void }) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const currentUser = useAuthStore((s) => s.user)
  const [isValidating, setIsValidating] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const hasVariants = (product.product_variants && product.product_variants.length > 0) ||
      (product.variants && product.variants.length > 0)

    if (hasVariants) {
      router.push(`/dashboard/promotor/marketplace/${product.id}`)
      return
    }

    setIsValidating(true)
    try {
      const token = await getAccessToken()
      if (!token) return

      const storeId = product.store_id || (product as any).store?.id || 1

      // 1. Get vendor's user_id from store detail
      const storeRes = await storeService.getDetail(token, storeId)
      const parentId = storeRes.data?.user_id

      // 2. Check Affiliation
      let affiliated = false
      if (parentId && currentUser?.id) {
        const userRes = await userService.getUserDetail(token, currentUser.id)
        const affiliations = userRes.data?.parent_affiliations || []
        affiliated = affiliations.some((a: any) => a.user?.id === parentId)
      }

      if (!affiliated) {
        toast.error("Anda belum terafiliasi dengan vendor ini atau afiliasi belum disetujui.")
        return
      }

      // 3. Check unpaid POs / Debts
      const debtRes = await debtService.getDebts({ buyer_id: currentUser?.id ? Number(currentUser.id) : undefined, user_id: parentId ? Number(parentId) : undefined, status: 'unpaid' }, token)
      const debts = Array.isArray(debtRes.data?.debts) ? debtRes.data.debts : (Array.isArray(debtRes.data) ? debtRes.data : [])

      let isProductInUnpaidPO = false;
      for (const debt of debts) {
        if (debt.type === 'po' && debt.order_id) {
          try {
            const orderRes = await orderService.getOrderDetail(debt.order_id, token)
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
        toast.error("Anda masih memiliki pesanan/PO yang belum lunas untuk produk ini.")
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
      toast.error("Terjadi kesalahan saat memvalidasi.")
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
      <Link href={`/dashboard/promotor/marketplace/${product.id}`} className="block">
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
        <Link href={`/dashboard/promotor/marketplace/${product.id}`} className="hover:text-emerald-600 transition-colors">
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
              <><Loader2 className="w-4 h-4 animate-spin" /> ...</>
            ) : ((product.product_variants && product.product_variants.length > 0) || (product.variants && product.variants.length > 0)) ? (
              <>Detail</>
            ) : (
              <><ShoppingCart size={14} /> Tambah</>
            )}
          </button>
          <button
            onClick={() => onShare(product)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-emerald-200 hover:text-emerald-600 transition-all duration-300 shadow-sm"
            aria-label="Share"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MarketplacePromotorPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedVendor, setSelectedVendor] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isVendorsLoading, setIsVendorsLoading] = useState(true)

  // Share Modal States
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [selectedProductForShare, setSelectedProductForShare] = useState<Product | null>(null)
  const [generatedShareLink, setGeneratedShareLink] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 12

  const cartItems = useCartStore((s) => s.items)

  const fetchVendors = useCallback(async () => {
    try {
      const token = await getAccessToken()
      if (!token) return
      const res = await storeService.getStores(token, { limit: 100 })
      if (res.data) {
        if (Array.isArray(res.data)) {
          setVendors(res.data)
        } else if (res.data.data && Array.isArray(res.data.data)) {
          setVendors(res.data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setIsVendorsLoading(false)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = await getAccessToken()
      const params: any = {
        page: currentPage,
        limit: limit,
        // target_customer: 'reseller', // Show all products for promotors or filter as needed
        status: 'active'
      }

      if (selectedVendor !== "all") {
        params.store_id = selectedVendor
      }

      if (searchQuery) {
        params.name = searchQuery
      }

      const res = await productService.getProducts(params, token || undefined)
      if (res.data) {
        setProducts(res.data.data || [])
        setTotalPages(Math.ceil((res.data.meta?.total || 0) / limit))
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Gagal memuat produk')
    } finally {
      setIsLoading(false)
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

  const handleShareClick = (product: Product) => {
    setSelectedProductForShare(product)
    setIsShareOpen(true)
  }

  const handleShareSuccess = (link: string) => {
    setGeneratedShareLink(link)
    // You could show another dialog with the link, or just prompt the user
    navigator.clipboard.writeText(link)
    toast.success("Link share berhasil dibuat dan disalin ke clipboard!")
  }

  const selectedVendorData = Array.isArray(vendors) ? vendors.find(v => v.id.toString() === selectedVendor) : undefined

  return (
    <div className="space-y-6">
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Marketplace Promotor</h1>
            <p className="text-sm text-gray-500 mt-1">Cari produk menarik dan bagikan untuk mendapatkan komisi</p>
          </div>
          <Link href="/dashboard/promotor/marketplace/cart" className="hidden"> {/* Cart hidden for now if not needed */}
            <Button variant="outline" className="relative">
              <ShoppingCart size={18} />
              <span className="ml-2">Keranjang</span>
              {cartItems.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500">
                  {cartItems.length}
                </Badge>
              )}
            </Button>
          </Link>
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
                <Select value={selectedVendor} onValueChange={(val) => {
                  setSelectedVendor(val)
                  setCurrentPage(1)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Toko" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Toko</SelectItem>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id.toString()}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
              <p className="text-gray-500">Memuat produk...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCardComponent 
                    key={product.id} 
                    product={product} 
                    onShare={handleShareClick}
                  />
                ))}
              </div>

              {/* Pagination omitted for brevity, but same as reseller */}
            </div>
          ) : (
            <Card>
              <CardContent className="py-20 text-center space-y-4">
                <Package className="text-gray-300 mx-auto" size={40} />
                <h3 className="text-lg font-semibold">Produk Tidak Ditemukan</h3>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {selectedProductForShare && (
        <LoginShareCommission
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
          onLoginSuccess={handleShareSuccess}
          productId={selectedProductForShare.id}
          productSlug={selectedProductForShare.slug || selectedProductForShare.name.toLowerCase().replace(/ /g, '-')}
          // We need to fetch store details to get subdomain/domain if not present in product
          // For simplicity, we assume the modal handles it or we pass what we have
        />
      )}
    </div>
  )
}
