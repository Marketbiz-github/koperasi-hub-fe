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
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Info, ShoppingCart, Star, Loader2, Search, Package, ChevronLeft, ChevronRight, Calculator, AlertCircle } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { productService, storeService, userService, debtService, orderService } from "@/services/apiService"
import { getAccessToken } from "@/utils/auth"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { SearchableSelect } from "@/components/ui/searchable-select"

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
}

interface Vendor {
    id: number
    name: string
    logo: string | null
    description: string | null
}

function ProductCardComponent({ product }: { product: Product }) {
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
            router.push(`/dashboard/koperasi/marketplace/${product.id}`)
            return
        }

        setIsValidating(true)
        try {
            const token = await getAccessToken()
            if (!token) return

            const storeId = (product as any).store_id || (product as any).store?.id || 1

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

            // 3. Check unpaid POs / Debts for this specific vendor (new system)
            const poStatusRes = await debtService.checkPo(token, storeId)
            if (poStatusRes.data?.has_active_po) {
                toast.error("Anda memiliki Purchase Order (PO) yang belum lunas dengan vendor ini. Mohon selesaikan pembayaran terlebih dahulu.")
                return
            }

            const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url || "/images/placeholder.png"

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

    const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url || "/images/placeholder.png"

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col group">
            <Link href={`/dashboard/koperasi/marketplace/${product.id}`} className="block">
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
                <Link href={`/dashboard/koperasi/marketplace/${product.id}`} className="hover:text-emerald-600 transition-colors">
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
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
    )
}

export default function MarketplaceVendorPage() {
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [selectedVendor, setSelectedVendor] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [isVendorsLoading, setIsVendorsLoading] = useState(true)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const limit = 12

    const [poStatus, setPoStatus] = useState<any>(null)
    const [isPoLoading, setIsPoLoading] = useState(false)

    const cartItems = useCartStore((s) => s.items)

    const fetchPoStatus = useCallback(async (storeId: string | number) => {
        setIsPoLoading(true)
        try {
            const token = await getAccessToken()
            if (!token) return
            const res = await debtService.checkPo(token, storeId)
            setPoStatus(res.data)
        } catch (error) {
            console.error('Error checking PO status:', error)
        } finally {
            setIsPoLoading(false)
        }
    }, [])

    useEffect(() => {
        if (selectedVendor !== "all") {
            fetchPoStatus(selectedVendor)
        } else {
            setPoStatus(null)
        }
    }, [selectedVendor, fetchPoStatus])

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
            toast.error('Gagal memuat daftar vendor')
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
                target_customer: 'koperasi',
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

    const selectedVendorData = Array.isArray(vendors) ? vendors.find(v => v.id.toString() === selectedVendor) : undefined

    // Simulation for Featured (extracting from current products)
    const featuredProducts = Array.isArray(products) ? products.slice(0, 3) : []

    return (
        <div className="space-y-6">
            <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Marketplace Pembelian</h1>
                        <p className="text-sm text-gray-500 mt-1">Dashboard Koperasi - Belanja Produk dari Vendor</p>
                    </div>
                    <Link href="/dashboard/koperasi/marketplace/cart">
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
                                <label className="text-sm font-medium">Vendor</label>
                                <SearchableSelect
                                    options={[{ id: 'all', name: 'Semua Vendor' }, ...vendors]}
                                    value={selectedVendor}
                                    onValueChange={(val) => {
                                        setSelectedVendor(val)
                                        setCurrentPage(1)
                                    }}
                                    placeholder="Pilih Vendor"
                                    searchPlaceholder="Cari vendor..."
                                />
                            </div>

                            {selectedVendorData && (
                                <div className="pt-4 border-t">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border flex-shrink-0 relative">
                                            {selectedVendorData.logo ? (
                                                <Image src={selectedVendorData.logo} alt={selectedVendorData.name} fill className="object-cover" />
                                            ) : (
                                                <Package className="m-auto text-gray-300 mt-3" size={24} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm truncate">{selectedVendorData.name}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">Vendor Terverifikasi</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </aside>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* PO/Debt Alert */}
                    {isPoLoading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100 animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Memeriksa status PO...</span>
                        </div>
                    ) : poStatus?.has_active_po && (
                        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900 shadow-sm">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            <AlertTitle className="font-bold text-amber-800 flex items-center gap-2">
                                Perhatian: Hutang PO Aktif
                                <Badge variant="outline" className="ml-2 bg-amber-100 border-amber-300 text-amber-700">PENTING</Badge>
                            </AlertTitle>
                            <AlertDescription className="text-amber-700 mt-2">
                                <p className="font-medium">Anda memiliki Purchase Order (PO) yang belum lunas dengan vendor ini.</p>
                                {poStatus.debt && (
                                    <div className="mt-3 p-4 bg-white/60 rounded-xl border border-amber-200 shadow-inner text-sm space-y-2">
                                        <div className="flex justify-between items-center pb-2 border-b border-amber-100">
                                            <span className="text-xs uppercase font-bold tracking-wider text-amber-600">Status Pembayaran:</span>
                                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white">BELUM LUNAS</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-1">
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Total Hutang</span>
                                                <p className="font-bold text-base text-gray-900">
                                                    Rp {Number(poStatus.debt.total_debt || 0).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Sisa Hutang</span>
                                                <p className="font-black text-base text-red-600 animate-pulse">
                                                    Rp {Number(poStatus.debt.remaining_debt || 0).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-3 flex items-start gap-2 text-xs text-amber-800/80 bg-amber-200/20 p-2 rounded-lg italic">
                                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <p>Mohon segera selesaikan pelunasan PO Anda sebelum melanjutkan transaksi baru dengan vendor ini untuk menghindari kendala pengiriman.</p>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border">
                            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
                            <p className="text-gray-500">Memuat produk untuk Anda...</p>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCardComponent key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                    >
                                        <ChevronLeft size={18} />
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum = currentPage;
                                            if (currentPage <= 3) pageNum = i + 1;
                                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                            else pageNum = currentPage - 2 + i;

                                            if (pageNum <= 0 || pageNum > totalPages) return null;

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    className={currentPage === pageNum ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                >
                                                    {pageNum}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                    >
                                        <ChevronRight size={18} />
                                    </Button>
                                </div>
                            )}
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
        </div>
    )
}
