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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
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
import { productService, inventoryService, productVariantService, storeService, userService, debtService, orderService, affiliationService } from "@/services/apiService"
import { getAccessToken } from "@/utils/auth"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"

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
    short_description?: string | null
    long_description?: string | null
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
    is_gratis_ongkir?: boolean
    is_cashback?: boolean
    cashback_unit?: string
    cashback_value?: number
    is_discount?: boolean
    discount_type?: string
    discount_value?: number
    discount_price?: string | number
}

export default function ProductDetailPage() {
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
    const [isAffiliated, setIsAffiliated] = useState(true) // Default true to prevent flash
    const [hasUnpaidPO, setHasUnpaidPO] = useState(false)
    const [validationMessage, setValidationMessage] = useState("")
    const [affiliationStatus, setAffiliationStatus] = useState<string>("affiliated")
    const [showAffiliateDialog, setShowAffiliateDialog] = useState(false)
    const [isRequestingAffiliation, setIsRequestingAffiliation] = useState(false)

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

                // Fetch Stock and Variants
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

            // 1. Get vendor's user_id from store detail
            const storeRes = await storeService.getDetail(token, storeId)
            const parentId = storeRes.data?.user_id

            // 2. Check Affiliation
            let affiliated = false
            if (parentId && currentUser?.id) {
                const affRes = await userService.checkAffiliation(token, parentId, currentUser.id)
                affiliated = affRes.data?.is_affiliated === true;
            }
            setIsAffiliated(affiliated)

            if (!affiliated) {
                // Check if request already sent
                if (parentId) {
                   const childReqs = await affiliationService.getChild(token, { parent_id: parentId });
                   const reqList = childReqs.data || [];
                   const pendingReq = reqList.find((r:any) => r.status === 'pending');
                   const rejectedReq = reqList.find((r:any) => r.status === 'rejected');
                   if (pendingReq) {
                       setValidationMessage("Status afiliasi Anda dengan vendor ini masih menunggu persetujuan.");
                       setAffiliationStatus('pending');
                   } else if (rejectedReq) {
                       setValidationMessage("Pengajuan afiliasi Anda ke vendor ini telah ditolak.");
                       setAffiliationStatus('rejected');
                   } else {
                       setValidationMessage("Anda belum terafiliasi dengan vendor ini. Silakan ajukan terlebih dahulu.");
                       setAffiliationStatus('unaffiliated');
                   }
                }
            } else {
                setAffiliationStatus('affiliated');
                // 3. Check unpaid POs / Debts for this specific vendor (new system)
                const poStatusRes = await debtService.checkPo(token, storeId)
                const activePo = poStatusRes.data?.has_active_po

                setHasUnpaidPO(activePo)

                if (activePo) {
                    setValidationMessage("Anda memiliki pesanan/PO yang belum lunas di vendor ini. Mohon selesaikan pembayaran terlebih dahulu.")
                } else {
                    setValidationMessage("")
                }
            }
        } catch (error) {
            console.error("Validation error:", error)
        } finally {
            setIsValidating(false)
        }
    }, [])

    useEffect(() => {
        if (product?.store?.id) {
            validatePurchase(product.store.id)
        }
    }, [product?.store?.id, validatePurchase])

    const handleRequestAffiliation = async () => {
        if (!product?.store?.id) return;
        setIsRequestingAffiliation(true);
        try {
            const token = await getAccessToken();
            const storeRes = await storeService.getDetail(token || '', product.store.id);
            const parentId = storeRes.data?.user_id;

            if (parentId) {
                await affiliationService.create(token || '', { parent_id: parentId, type: 'koperasi_vendor' });
                toast.success('Permintaan afiliasi berhasil dikirim!');
                setShowAffiliateDialog(false);
                setAffiliationStatus('pending');
                setValidationMessage("Status afiliasi Anda dengan vendor ini masih menunggu persetujuan.");
            }
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengajukan afiliasi');
        } finally {
            setIsRequestingAffiliation(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return

        if (!isAffiliated || hasUnpaidPO) {
            if (affiliationStatus === 'unaffiliated') {
                setShowAffiliateDialog(true);
            } else {
                toast.error(validationMessage || "Anda tidak dapat membeli produk ini.")
            }
            return
        }

        if (variants.length > 0 && !selectedVariant) {
            toast.error("Silakan pilih varian terlebih dahulu")
            return
        }

        addItem({
            id: product.id.toString(),
            name: product.name,
            price: selectedVariant ? Number(selectedVariant.price) : Number(product.price),
            image: selectedVariant?.image || selectedImage,
            category: product.product_category?.name || "Uncategorized",
            quantity: quantity,
            storeId: Number(product.store?.id || (product as any).store_id || 0),
            variantId: selectedVariant?.id || 0,
            variantName: selectedVariant?.option_values?.map((ov: any) => ov.value).join(' - ')
        })
        toast.success(`${product.name}${selectedVariant ? ` (${selectedVariant.option_values?.map((ov: any) => ov.value).join(' - ')})` : ''} ditambahkan ke keranjang`)
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
        <div className="space-y-6">
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
                            {product.is_discount ? (
                                <>
                                    <span className="text-4xl font-extrabold text-emerald-600">{formatCurrency(product.discount_price || 0)}</span>
                                    <span className="text-lg text-gray-400 line-through decoration-gray-300">{formatCurrency(product.price)}</span>
                                </>
                            ) : (
                                <span className="text-4xl font-extrabold text-emerald-600">{formatCurrency(product.price)}</span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {(selectedVariant ? selectedVariant.total_stock : totalStock) !== null && (
                                <Badge variant="outline" className={`px-2 py-0.5 text-xs font-semibold ${(selectedVariant ? selectedVariant.total_stock : totalStock) > 0 ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                                    Stok: {(selectedVariant ? selectedVariant.total_stock : totalStock) > 0 ? (selectedVariant ? selectedVariant.total_stock : totalStock) : 'Habis'}
                                </Badge>
                            )}
                            {product.is_discount && (
                                <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none px-2 py-0.5 text-xs font-semibold">
                                    Diskon {product.discount_type === 'percent' ? `${product.discount_value}%` : formatCurrency(product.discount_value || 0)}
                                </Badge>
                            )}
                            {product.is_gratis_ongkir && (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 text-xs font-semibold">
                                    <Truck size={12} className="mr-1 inline" /> Gratis Ongkir
                                </Badge>
                            )}
                            {product.is_cashback && (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0.5 text-xs font-semibold">
                                    Cashback {product.cashback_unit === 'percent' ? `${product.cashback_value}%` : formatCurrency(product.cashback_value || 0)}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {variants.length > 0 && (
                        <div className="space-y-3">
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
                                                if (v.image) setSelectedImage(v.image);
                                            }}
                                            disabled={v.total_stock === 0}
                                            className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-semibold flex items-center gap-2 ${isSelected
                                                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                                : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                                                } ${v.total_stock === 0 ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                                        >
                                            {variantLabel}
                                            {isSelected && <Badge className="bg-emerald-600 text-white p-0.5 rounded-full"><ShieldCheck size={10} /></Badge>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 py-4 border-y border-gray-100">
                        {validationMessage && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-start gap-2 text-sm border border-red-100">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Pembelian diblokir</p>
                                    <p>{validationMessage}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border rounded-lg overflow-hidden h-11">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 py-2 hover:bg-gray-50 transition border-r font-bold text-gray-600"
                                >-</button>
                                <div className="px-6 py-2 font-semibold min-w-[60px] text-center">{quantity}</div>
                                <button
                                    onClick={() => {
                                        if (totalStock !== null && quantity >= totalStock) {
                                            toast.error(`Kuantitas melebihi stok yang tersedia (${totalStock})`)
                                            return
                                        }
                                        setQuantity(quantity + 1)
                                    }}
                                    className="px-4 py-2 hover:bg-gray-50 transition border-l font-bold text-gray-600"
                                >+</button>
                            </div>
                            <Button
                                onClick={
                                    (!isAffiliated && affiliationStatus === 'unaffiliated') 
                                        ? () => setShowAffiliateDialog(true) 
                                        : handleAddToCart
                                }
                                disabled={(totalStock !== null && totalStock === 0) || isValidating || (affiliationStatus !== 'unaffiliated' ? (!isAffiliated || hasUnpaidPO) : false)}
                                className="w-fit bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-lg gap-2 shadow-md shadow-emerald-100 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isValidating ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Sedang memvalidasi...</>
                                ) : (!isAffiliated && affiliationStatus === 'unaffiliated') ? (
                                    <>Ajukan Afiliasi</>
                                ) : (
                                    <>
                                        <ShoppingCart size={20} />
                                        {totalStock !== null && totalStock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>



                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Deskripsi Produk</h3>
                        <div className="prose prose-sm prose-emerald max-w-none text-gray-600 leading-relaxed">
                            {product.long_description || product.short_description || product.description ? (
                                <div dangerouslySetInnerHTML={{ __html: product.long_description || product.short_description || product.description || '' }} />
                            ) : (
                                <p className="italic text-gray-400">Tidak ada deskripsi tersedia untuk produk ini.</p>
                            )}
                        </div>
                    </div>
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
