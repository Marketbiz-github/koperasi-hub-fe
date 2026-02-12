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
    Truck,
    Loader2,
    AlertCircle
} from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { productService } from "@/services/apiService"
import { getAccessToken } from "@/utils/auth"
import { toast } from "sonner"

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
    store?: {
        id: number
        name: string
        logo: string | null
        description: string | null
    } | null
}

export default function ProductDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [product, setProduct] = useState<ProductDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState<string>("")
    const [quantity, setQuantity] = useState(1)

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

    const handleAddToCart = () => {
        if (!product) return

        addItem({
            id: product.id.toString(),
            name: product.name,
            price: Number(product.price),
            image: selectedImage,
            category: product.product_category?.name || "Uncategorized",
            quantity: quantity,
        })
        toast.success(`${product.name} ditambahkan ke keranjang`)
    }

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(amount));
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
                <p className="text-gray-500 font-medium">Memuat detail produk...</p>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="bg-red-50 p-4 rounded-full">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">Produk Tidak Ditemukan</h2>
                    <p className="text-gray-500">Maaf, produk yang Anda cari tidak tersedia atau telah dihapus.</p>
                </div>
                <Button onClick={() => router.back()} variant="outline" className="gap-2">
                    <ChevronLeft size={18} />
                    Kembali ke Marketplace
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Breadcrumbs / Back button */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/dashboard/koperasi/marketplace" className="hover:text-emerald-600 transition-colors">Marketplace</Link>
                <span>/</span>
                <Link href={`/dashboard/koperasi/marketplace?category=${product.product_category?.name}`} className="hover:text-emerald-600 transition-colors">{product.product_category?.name || "Kategori"}</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Images */}
                <div className="lg:col-span-5 space-y-4">
                    <Card className="overflow-hidden border-gray-200">
                        <div className="relative aspect-square bg-gray-50 group">
                            <Image
                                src={selectedImage}
                                alt={product.name}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Card>

                    {product.images && product.images.length > 1 && (
                        <div className="grid grid-cols-5 gap-2">
                            {product.images.map((img) => (
                                <button
                                    key={img.id}
                                    onClick={() => setSelectedImage(img.image_url)}
                                    className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${selectedImage === img.image_url ? "border-emerald-600 shadow-sm" : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <Image src={img.image_url} alt={product.name} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Center/Right: Details */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-2">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1">
                            {product.product_category?.name || "Umum"}
                        </Badge>
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5"><Package size={14} /> SKU: <span className="text-gray-900 font-medium">{product.sku}</span></span>
                            <span className="flex items-center gap-1.5 border-l pl-4"><Store size={14} /> Vendor: <span className="text-gray-900 font-medium">{product.store?.name || "KoperasiHub Vendor"}</span></span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-1">
                        <p className="text-gray-500 text-sm font-medium">Harga Koperasi</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-emerald-600">{formatCurrency(product.price)}</span>
                        </div>
                    </div>

                    <div className="space-y-4 py-4 border-y border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border rounded-lg overflow-hidden h-11">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 py-2 hover:bg-gray-50 transition border-r font-bold text-gray-600"
                                >-</button>
                                <div className="px-6 py-2 font-semibold min-w-[60px] text-center">{quantity}</div>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-4 py-2 hover:bg-gray-50 transition border-l font-bold text-gray-600"
                                >+</button>
                            </div>
                            <Button
                                onClick={handleAddToCart}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-lg gap-2 shadow-md shadow-emerald-100 transition-all hover:-translate-y-0.5"
                            >
                                <ShoppingCart size={20} />
                                Tambah ke Keranjang
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                            <Truck className="text-blue-600 mt-0.5" size={20} />
                            <div>
                                <p className="text-sm font-bold text-blue-900 leading-none mb-1">Pengiriman Cepat</p>
                                <p className="text-xs text-blue-700 leading-tight">Vendor siap kirim ke seluruh wilayah Indonesia.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50/50 border border-orange-100">
                            <ShieldCheck className="text-orange-600 mt-0.5" size={20} />
                            <div>
                                <p className="text-sm font-bold text-orange-900 leading-none mb-1">Produk Original</p>
                                <p className="text-xs text-orange-700 leading-tight">Jaminan produk 100% asli dari pihak vendor resmi.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Deskripsi Produk</h3>
                        <div className="prose prose-sm prose-emerald max-w-none text-gray-600 leading-relaxed">
                            {product.description ? (
                                <div dangerouslySetInnerHTML={{ __html: product.description }} />
                            ) : (
                                <p className="italic text-gray-400">Tidak ada deskripsi tersedia untuk produk ini.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
