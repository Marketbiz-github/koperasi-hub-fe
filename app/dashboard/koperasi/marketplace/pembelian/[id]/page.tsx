'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useAuthStore } from '@/store/authStore';
import { getAccessToken } from '@/utils/auth';
import { orderService, productService, debtService, storeService } from '@/services/apiService';
import { ORDER_STATUS_CONFIG, getOrderStatusLabel } from '@/utils/constants';
import { Loader2, ArrowLeft, Package, Truck, User, Wallet, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { IconBuildingStore } from '@tabler/icons-react';

const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseInt(value) : value;
    return `Rp${(num || 0).toLocaleString('id-ID')}`;
};

const getSettlementStatus = (order: any, debt: any) => {
    if (order.payment_category === 'piutang') {
        const d = debt || order.debt;
        const installments = d?.installments || [];
        if (installments.length > 0) {
            const allPaid = installments.every((i: any) => i.status === 'paid');
            const somePaid = installments.some((i: any) => i.status === 'paid');
            if (allPaid) return 'LUNAS';
            if (somePaid) return 'DIBAYAR SEBAGIAN';
            return 'BELUM LUNAS';
        }
        return d?.status === 'paid' ? 'LUNAS' : 'BELUM LUNAS';
    }
    return order.payment_status === 'paid' ? 'LUNAS' : 'BELUM LUNAS';
};

export default function KoperasiPurchasesDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [debt, setDebt] = useState<any>(null);
    const [loadingDebt, setLoadingDebt] = useState(false);
    const [storeName, setStoreName] = useState('');
    const [productDetails, setProductDetails] = useState<Record<string, any>>({});
    const [fetchingDetails, setFetchingDetails] = useState(false);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const token = await getAccessToken();
            const res = await orderService.getOrderDetail(params.id as string, token || '');
            if (res.data) {
                setOrder(res.data);

                // Fetch store name
                if (res.data.store_id) {
                    try {
                        const storeRes = await storeService.getDetail(token || '', res.data.store_id);
                        if (storeRes.data) setStoreName(storeRes.data.name);
                    } catch (e) { }
                }

                if (res.data.payment_category === 'piutang') {
                    fetchDebtInfo();
                }
            }
        } catch (err) {
            console.error('Failed to fetch order details', err);
            toast.error('Gagal memuat detail pesanan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchDetails = async () => {
            if (!order?.items?.length) return;
            setFetchingDetails(true);
            try {
                const token = await getAccessToken();
                const detailsMap: Record<string, any> = {};
                await Promise.all(
                    order.items.map(async (item: any) => {
                        const pid = item.product_id || item.product?.id;
                        if (pid && !detailsMap[pid]) {
                            try {
                                const res = await productService.getProductDetail(pid, token || '');
                                detailsMap[pid] = res.data;
                            } catch (e) {
                                console.error(`Error fetching product ${pid}:`, e);
                            }
                        }
                    })
                );
                setProductDetails(detailsMap);
            } catch (err) {
                console.error('Error in fetchDetails:', err);
            } finally {
                setFetchingDetails(false);
            }
        };

        if (order?.items) {
            fetchDetails();
        }
    }, [order?.items]);

    const fetchDebtInfo = async () => {
        setLoadingDebt(true);
        try {
            const token = await getAccessToken();
            const res = await orderService.getOrderDebt(params.id as string, token || '');
            if (res.data) {
                setDebt(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch debt info', err);
        } finally {
            setLoadingDebt(false);
        }
    };

    const handlePay = async (customId?: string | number, customType?: 'po' | 'installment') => {
        if (!order) return;

        if (order.payment_category === 'instant') {
            const url = order.payment_url || order.ipaymu_payment_url;
            if (url) window.open(url, '_blank');
            return;
        }

        if (order.payment_category === 'piutang') {
            setPaying(true);
            try {
                const token = await getAccessToken();
                let targetId = customId || debt?.id || order.debt?.id;
                let type: 'po' | 'installment' = customType || 'po';

                if (!customId && !customType) {
                    const d = debt || order.debt;
                    if (d?.type === 'tenor') {
                        const firstUnpaid = d.installments?.find((i: any) => i.status === 'unpaid');
                        if (firstUnpaid) {
                            targetId = firstUnpaid.id;
                            type = 'installment';
                        }
                    }
                }

                if (!targetId) throw new Error('Debt ID tidak ditemukan');

                const returnUrl = `${window.location.origin}/dashboard/koperasi/thankyou?type=po&ref=${order.order_number || order.id}`;
                const res = await debtService.getPaymentUrl(targetId, type, token || '', returnUrl);
                
                const paymentUrl = res.data?.url || res.data?.payment_url;
                if (paymentUrl) {
                    window.location.href = paymentUrl;
                } else {
                    throw new Error('Gagal mendapatkan URL pembayaran');
                }
            } catch (err: any) {
                console.error('Payment failed', err);
                toast.error(err.message || 'Gagal memproses pembayaran');
            } finally {
                setPaying(false);
            }
        }
    };

    useEffect(() => {
        if (params.id) fetchOrder();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
                <p className="text-gray-500">Memuat detail pesanan...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500 mb-4">Pesanan tidak ditemukan.</p>
                <Button onClick={() => router.back()}>Kembali</Button>
            </div>
        );
    }

    const settlementStatus = getSettlementStatus(order, debt);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Detail Pembelian</h1>
                    <p className="text-sm text-gray-500">{order.invoice_number || order.order_number || `ORD-${order.id}`}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Information */}
                    <Card>
                        <CardHeader className="border-b bg-gray-50/50 pb-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Package className="h-5 w-5 text-emerald-600" />
                                    Informasi Transaksi
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className={`shadow-none border ${settlementStatus === 'LUNAS'
                                        ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                                        : settlementStatus === 'DIBAYAR SEBAGIAN'
                                            ? 'border-blue-200 text-blue-700 bg-blue-50'
                                            : 'border-amber-200 text-amber-700 bg-amber-50'
                                        }`}>
                                        {settlementStatus}
                                    </Badge>
                                    <Badge className={`${ORDER_STATUS_CONFIG[order.status]?.color || 'bg-gray-100 text-gray-800'} border-0`}>
                                        {getOrderStatusLabel(order.status, order.payment_category, order.paid_at)}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1">Tanggal</p>
                                    <p className="font-medium">{new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Toko Vendor</p>
                                    <div className="flex items-center gap-1 font-medium">
                                        <IconBuildingStore size={14} className="text-gray-400" />
                                        <span>{storeName || order.store?.name || 'Vendor'}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Metode</p>
                                    <p className="font-medium uppercase">{order.payment_category || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Total</p>
                                    <p className="font-bold text-emerald-600">{formatCurrency(order.total_amount)}</p>
                                </div>
                            </div>

                            {/* Products Table */}
                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="text-xs">Produk</TableHead>
                                            <TableHead className="text-xs text-center">Jumlah</TableHead>
                                            <TableHead className="text-xs text-right">Harga</TableHead>
                                            <TableHead className="text-xs text-right">Subtotal</TableHead>
                                            <TableHead className="text-xs text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items?.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-10 h-10 rounded border overflow-hidden shrink-0">
                                                            {(() => {
                                                                const pid = item.product_id || item.product?.id;
                                                                const detail = pid ? productDetails[pid] : null;
                                                                const img = detail?.images?.find((i: any) => i.is_primary)?.image_url ||
                                                                    (Array.isArray(detail?.images) ? detail?.images?.[0]?.image_url : null) ||
                                                                    detail?.image ||
                                                                    item.product?.image ||
                                                                    item.product_image;
                                                                return img ? (
                                                                    <Image src={img} alt="P" fill className="object-cover" />
                                                                ) : (
                                                                    <div className="bg-gray-100 w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                                                        {fetchingDetails ? <Loader2 className="h-3 w-3 animate-spin" /> : "No Img"}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                        <span className="font-medium text-xs line-clamp-1">{item.product_name || item.product?.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center text-xs">{item.quantity}</TableCell>
                                                <TableCell className="text-right text-xs">{formatCurrency(item.price)}</TableCell>
                                                <TableCell className="text-right text-xs font-bold">{formatCurrency(item.quantity * item.price)}</TableCell>
                                                <TableCell className="text-right">
                                                    {settlementStatus === 'LUNAS' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1"
                                                            onClick={() => {
                                                                const pid = item.product_id || item.product?.id;
                                                                if (pid) {
                                                                    window.location.href = `/dashboard/koperasi/produk/tambah?duplicate=${pid}`;
                                                                } else {
                                                                    toast.error("ID Produk tidak ditemukan");
                                                                }
                                                            }}
                                                        >
                                                            <Package className="h-3.5 w-3.5" />
                                                            <span>Jual Lagi</span>
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Summary */}
                            <div className="space-y-2 text-sm border-t pt-4">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal Produk</span>
                                    <span>{formatCurrency(order.total_amount - (order.shipping_cost || 0))}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Ongkos Kirim</span>
                                    <span>{formatCurrency(order.shipping_cost || 0)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                                    <span>Total Bayar</span>
                                    <span className="text-emerald-600">{formatCurrency(order.total_amount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Credit Information (Piutang) */}
                    {order.payment_category === 'piutang' && (
                        <Card>
                            <CardHeader className="border-b bg-gray-50/50 pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-amber-600" />
                                    Informasi Tagihan Piutang
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {loadingDebt ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                                    </div>
                                ) : debt ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 mb-1 text-xs">Tipe</p>
                                                <Badge variant="outline" className="capitalize">{debt.type}</Badge>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1 text-xs">Tenor</p>
                                                <p className="font-medium">{debt.tenor_months ? `${debt.tenor_months} Bulan` : '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1 text-xs">Total Pinjaman</p>
                                                <p className="font-bold text-amber-600">{formatCurrency(debt.amount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1 text-xs">Status Pelunasan</p>
                                                <Badge className={debt.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                                                    {debt.status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                                                </Badge>
                                            </div>
                                        </div>

                                        {debt.installments && debt.installments.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jadwal Cicilan</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {debt.installments.map((inst: any, idx: number) => (
                                                        <div key={inst.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-500">Cicilan {idx + 1}</p>
                                                                <p className="text-[10px] text-gray-400">Tempo: {inst.due_date ? new Date(inst.due_date).toLocaleDateString('id-ID') : '-'}</p>
                                                            </div>
                                                            <div className="flex gap-4 items-center">
                                                                <div className="text-right">
                                                                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(inst.amount)}</p>
                                                                    <Badge variant="outline" className={`text-[9px] h-4 ${inst.status === 'paid' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'text-gray-400'}`}>
                                                                        {inst.status === 'paid' ? 'Paid' : 'Unpaid'}
                                                                    </Badge>
                                                                </div>
                                                                {inst.status !== 'paid' && order.status === 'paid' && (
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700"
                                                                        onClick={() => handlePay(inst.id, 'installment')}
                                                                        disabled={paying}
                                                                    >
                                                                        Bayar
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-center text-sm text-gray-500 italic">Data piutang tidak ditemukan.</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Payment Summary & Action */}
                    <Card className="border-emerald-100 bg-emerald-50/20">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base flex items-center gap-2 text-emerald-800">
                                <CreditCard className="h-4 w-4" />
                                Pembayaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border border-emerald-100 space-y-2">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Status Tagihan</span>
                                    <span className="font-bold text-emerald-700">{settlementStatus}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Metode</span>
                                    <span className="font-bold uppercase tracking-wide">{order.payment_category}</span>
                                </div>
                            </div>

                            {settlementStatus !== 'LUNAS' && order.status !== 'cancelled' &&
                                (order.payment_category !== 'piutang' || order.status === 'paid') && (
                                    <Button
                                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold"
                                        onClick={() => handlePay()}
                                        disabled={paying}
                                    >
                                        {paying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Bayar Sekarang
                                    </Button>
                                )}

                            {order.status === 'pending' && (
                                <p className="text-[10px] text-center text-amber-600 font-medium italic">
                                    * Pesanan Anda sedang diproses oleh vendor.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Shipping & Recipient */}
                    <Card>
                        <CardHeader className="border-b bg-gray-50/50 pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Truck className="h-4 w-4 text-blue-600" />
                                Pengiriman
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 font-bold uppercase">Penerima</p>
                                <p className="text-sm font-semibold">{order.customer_name || 'Customer'}</p>
                                <p className="text-sm text-gray-600">{order.customer_phone}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 font-bold uppercase">Alamat</p>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {order.customer_address}, {order.customer_subdistrict && `${order.customer_subdistrict}, `}{order.customer_district}, {order.customer_city}, {order.customer_province} {order.customer_zipcode}
                                </p>
                            </div>
                            {order.tracking_number && (
                                <div className="pt-2 border-t mt-2">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Nomor Resi</p>
                                    <p className="text-sm font-mono font-bold text-blue-600">{order.tracking_number}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
