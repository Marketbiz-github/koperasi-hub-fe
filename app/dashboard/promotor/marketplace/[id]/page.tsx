"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ShoppingCart,
    ChevronLeft,
    Store,
    Package,
    ShieldCheck,
    Loader2,
    AlertCircle,
    Share2
} from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { productService, inventoryService, productVariantService, storeService, userService, debtService, orderService } from "@/services/apiService"
import { getAccessToken } from "@/utils/auth"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import LoginShareCommission from "@/app/marketplace/components/LoginShareCommission"

interface ProductImage {
    id: number
    image_url: string
    is_primary: boolean
}

interface ProductDetail {
    id: number
    name: string
    sku: string
    price: string | number
    description: string | null
    status: string
    stock?: number
    images: ProductImage[]
    product_category?: { name: string } | null
    product_variants?: any[] | null
    store?: {
        id: number
        name: string
        logo: string | null
        description: string | null
    } | null
    slug?: string
}

export default function PromotorProductDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const currentUser = useAuthStore((s) => s.user)
    const [product, setProduct] = useState<ProductDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [totalStock, setTotalStock] = useState<number | null>(null)
    const [variants, setVariants] = useState<any[]>([])
    const [selectedVariant, setSelectedVariant] = useState<any>(null)
    const [selectedImage, setSelectedImage] = useState<string>("")
    const [quantity, setQuantity] = useState(1)
    const [isValidating, setIsValidating] = useState(false)
    const [isAffiliated, setIsAffiliated] = useState(true)
    const [hasUnpaidPO, setHasUnpaidPO] = useState(false)
    const [validationMessage, setValidationMessage] = useState("")

    const [isShareOpen, setIsShareOpen] = useState(false)

    const addItem = useCartStore((s) => s.addItem)

    const fetchProductDetail = useCallback(async () => {
        setIsLoading(true)
        try {
            const token = await getAccessToken()
            const res = await productService.getProductDetail(id as string, token || undefined)
            if (res.data) {
                setProduct(res.data)
                const primaryImg = res.data.images?.find((img: ProductImage) => img.is_primary)?.image_url || res.data.images?.[0]?.image_url || "/images/placeholder.png"
                setSelectedImage(primaryImg)

                try {
                    const vRes = await productVariantService.getList(token || "", id as string)
                    if (vRes.data && vRes.data.length > 0) {
                        setVariants(vRes.data)
                        const sumStock = vRes.data.reduce((acc: number, curr: any) => acc + (curr.total_stock || 0), 0)
                        setTotalStock(sumStock)
                    } else {
                        const sRes = await inventoryService.getStockByProduct(token || "", id as string)
                        if (Array.isArray(sRes.data)) {
                            setTotalStock(sRes.data.reduce((acc: number, curr: any) => acc + (curr.stock || 0), 0))
                        } else {
                            setTotalStock(typeof sRes.data === 'number' ? sRes.data : (sRes.data?.total_stock ?? 0))
                        }
                    }
                } catch (stockErr) {
                    console.error('Error fetching stock:', stockErr)
                }

            } else {
                toast.error("Produk tidak ditemukan")
            }
        } catch (error) {
            console.error('Error fetching product detail:', error)
            toast.error("Gagal memuat detail produk")
        } finally {
            setIsLoading(false)
        }
    }, [id])

    useEffect(() => {
        if (id) {
            fetchProductDetail()
        }
    }, [id, fetchProductDetail])

    const validatePurchase = useCallback(async (storeId: number) => {
        setIsValidating(true)
        try {
            const token = await getAccessToken()
            if (!token) return
            const storeRes = await storeService.getDetail(token, storeId)
            const parentId = storeRes.data?.user_id

            let affiliated = false
            if (parentId && currentUser?.id) {
                const userRes = await userService.getUserDetail(token, currentUser.id)
                const affiliations = userRes.data?.parent_affiliations || []
                affiliated = affiliations.some((a: any) => a.user?.id === parentId)
            }
            setIsAffiliated(affiliated)

            if (!affiliated) {
                setValidationMessage("Anda belum terafiliasi dengan vendor ini.")
            } else {
                const debtRes = await debtService.getDebts({ buyer_id: currentUser?.id ? Number(currentUser.id) : undefined, user_id: parentId ? Number(parentId) : undefined, status: 'unpaid' }, token)
                const debts = Array.isArray(debtRes.data?.debts) ? debtRes.data.debts : (Array.isArray(debtRes.data) ? debtRes.data : [])

                let isProductInUnpaidPO = false
                for (const debt of debts) {
                    if (debt.type === 'po' && debt.order_id) {
                        try {
                            const orderRes = await orderService.getOrderDetail(debt.order_id, token)
                            if (orderRes.data?.items?.some((item: any) => item.product_id === Number(id))) {
                                isProductInUnpaidPO = true
                                break
                            }
                        } catch (err) {}
                    }
                }
                setHasUnpaidPO(isProductInUnpaidPO)
                if (isProductInUnpaidPO) setValidationMessage("Anda memiliki PO belum lunas untuk produk ini.")
                else setValidationMessage("")
            }
        } catch (error) {
            console.error("Validation error:", error)
        } finally {
            setIsValidating(false)
        }
    }, [id, currentUser?.id])

    useEffect(() => {
        if (product?.store?.id) {
            validatePurchase(product.store.id)
        }
    }, [product?.store?.id, validatePurchase])

    const handleAddToCart = () => {
        if (!product) return
        if (!isAffiliated || hasUnpaidPO) {
            toast.error(validationMessage || "Tidak dapat membeli produk ini.")
            return
        }
        addItem({
            id: product.id.toString(),
            name: product.name,
            price: selectedVariant ? Number(selectedVariant.price) : Number(product.price),
            image: selectedVariant?.image || selectedImage,
            category: product.product_category?.name || "Uncategorized",
            quantity: quantity,
            storeId: Number(product.store?.id || 0),
            variantId: selectedVariant?.id || 0,
        })
        toast.success("Ditambahkan ke keranjang")
    }

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(amount));
    }

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" /></div>

    if (!product) return <div className="text-center py-20">Produk tidak ditemukan</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/dashboard/promotor/marketplace" className="hover:text-emerald-600">Marketplace</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-4">
                    <Card className="overflow-hidden border-gray-200">
                        <div className="relative aspect-square bg-gray-50">
                            <Image src={selectedImage} alt={product.name} fill className="object-contain" priority />
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-2">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">{product.product_category?.name || "Umum"}</Badge>
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <p className="text-sm text-gray-500 flex items-center gap-4">
                            <span>SKU: {product.sku}</span>
                            <span>Vendor: {product.store?.name}</span>
                        </p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <p className="text-4xl font-extrabold text-emerald-600">{formatCurrency(product.price)}</p>
                    </div>

                    <div className="flex items-center gap-4 py-4 border-y border-gray-100">
                        <Button
                            onClick={handleAddToCart}
                            variant="outline"
                            className="h-11 gap-2"
                            disabled={!isAffiliated || hasUnpaidPO}
                        >
                            <ShoppingCart size={20} /> Tambah ke Keranjang
                        </Button>
                        <Button
                            onClick={() => setIsShareOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 gap-2"
                        >
                            <Share2 size={20} /> Share Sekarang
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Deskripsi</h3>
                        <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: product.description || "" }} />
                    </div>
                </div>
            </div>

            {product && (
                <LoginShareCommission
                    open={isShareOpen}
                    onOpenChange={setIsShareOpen}
                    onLoginSuccess={(link) => {
                        navigator.clipboard.writeText(link)
                        toast.success("Link disalin!")
                    }}
                    productId={product.id}
                    productSlug={product.slug || product.name.toLowerCase().replace(/ /g, '-')}
                />
            )}
        </div>
    )
}
