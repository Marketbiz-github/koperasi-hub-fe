'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { getAccessToken } from '@/utils/auth';
import { orderService, productService } from '@/services/apiService';
import { useNotificationStore } from '@/store/notificationStore';
import { ORDER_STATUS_CONFIG, getOrderStatusLabel } from '@/utils/constants';
import { Loader2, ArrowLeft, Package, Truck, CheckCircle2, History, User, Wallet } from 'lucide-react';
import { toast } from 'sonner';

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

export default function VendorPesananDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const { markAsRead } = useNotificationStore();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [savingStatus, setSavingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    const [savingTracking, setSavingTracking] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');

    const [adminNotes, setAdminNotes] = useState('');

    const [productDetails, setProductDetails] = useState<Record<string, any>>({});
    const [fetchingDetails, setFetchingDetails] = useState(false);

    const [debt, setDebt] = useState<any>(null);
    const [loadingDebt, setLoadingDebt] = useState(false);
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);


    const fetchOrder = async () => {
        setLoading(true);
        try {
            const token = await getAccessToken();
            const res = await orderService.getOrderDetail(params.id as string, token || '');
            if (res.data) {
                setOrder(res.data);
                setNewStatus(res.data.status);
                setTrackingNumber(res.data.tracking_number || '');
                setAdminNotes(res.data.admin_notes || '');

                if (res.data.payment_category === 'piutang') {
                    fetchDebtInfo();
                }
                markAsRead(params.id as string);
            }

        } catch (err) {
            console.error('Failed to fetch order details', err);
            toast.error('Gagal memuat detail pesanan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) fetchOrder();
    }, [params.id]);

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

    const handleUpdateStatus = async () => {
        if (!newStatus || newStatus === order.status) return;
        setSavingStatus(true);
        try {
            const token = await getAccessToken();
            await orderService.updateOrderStatus(order.id, {
                status: newStatus,
                admin_notes: adminNotes
            }, token || '');
            toast.success('Status pesanan berhasil diperbarui');
            fetchOrder(); // refresh data
        } catch (err: any) {
            toast.error(err.message || 'Gagal memperbarui status');
        } finally {
            setSavingStatus(false);
        }
    };

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

    const handleApprovePiutang = async () => {
        setApproving(true);
        try {
            const token = await getAccessToken();
            await orderService.approvePiutang(order.id, token || '');
            toast.success('Pinjaman berhasil disetujui');
            fetchOrder();
        } catch (err: any) {
            toast.error(err.message || 'Gagal menyetujui pinjaman');
        } finally {
            setApproving(false);
        }
    };

    const handleRejectPiutang = async () => {
        if (!rejectReason) {
            toast.error('Harap masukkan alasan penolakan');
            return;
        }
        setRejecting(true);
        try {
            const token = await getAccessToken();
            await orderService.rejectPiutang(order.id, { reason: rejectReason }, token || '');
            toast.success('Pinjaman berhasil ditolak');
            setShowRejectInput(false);
            fetchOrder();
        } catch (err: any) {
            toast.error(err.message || 'Gagal menolak pinjaman');
        } finally {
            setRejecting(false);
        }
    };

    const handleUpdateTracking = async () => {

        if (!trackingNumber) return;
        setSavingTracking(true);
        try {
            const token = await getAccessToken();
            await orderService.updateOrderTracking(order.id, { tracking_number: trackingNumber }, token || '');
            toast.success('Nomor resi berhasil diperbarui');
            fetchOrder(); // refresh
        } catch (err: any) {
            toast.error(err.message || 'Gagal memperbarui nomor resi');
        } finally {
            setSavingTracking(false);
        }
    };

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan Masuk</h1>
                    <p className="text-sm text-gray-500">{order.invoice_number || order.order_number || `ORD-${order.id}`}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Left, 2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Info */}
                    <Card>
                        <CardHeader className="border-b bg-gray-50/50 pb-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Package className="h-5 w-5 text-emerald-600" />
                                        Informasi Pesanan
                                    </CardTitle>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className={`shadow-none border ${getSettlementStatus(order, debt) === 'LUNAS'
                                        ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                                        : getSettlementStatus(order, debt) === 'DIBAYAR SEBAGIAN'
                                            ? 'border-blue-200 text-blue-700 bg-blue-50'
                                            : 'border-amber-200 text-amber-700 bg-amber-50'
                                        }`}>
                                        {getSettlementStatus(order, debt)}
                                    </Badge>
                                    <Badge className={`${ORDER_STATUS_CONFIG[order.status]?.color || 'bg-gray-100 text-gray-800'} border-0`}>
                                        {getOrderStatusLabel(order.status, order.payment_category, order.paid_at)}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1">Tanggal</p>
                                    <p className="font-medium text-gray-900">
                                        {order.created_at ? new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Pembeli</p>
                                    <p className="font-medium text-gray-900 flex items-center gap-1">
                                        <User className="h-4 w-4 text-gray-400" />
                                        {order.customer_name || 'Customer'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Metode Pembayaran</p>
                                    <p className="font-medium text-gray-900 uppercase">{order.payment_category || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Total</p>
                                    <p className="font-bold text-emerald-600">{formatCurrency(order.total_amount)}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2">Produk Pesanan</h4>
                                <div className="space-y-4">
                                    {order.items?.filter((i: any) => i !== null).map((item: any) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="relative w-16 h-16 bg-gray-100 rounded-md border shrink-0 overflow-hidden">
                                                {(() => {
                                                    const pid = item.product_id || item.product?.id;
                                                    const detail = pid ? productDetails[pid] : null;
                                                    const img = detail?.images?.find((i: any) => i.is_primary)?.image_url ||
                                                        (Array.isArray(detail?.images) ? detail?.images?.[0]?.image_url : null) ||
                                                        detail?.image ||
                                                        item.product?.image ||
                                                        item.product_image ||
                                                        item.image;
                                                    return img ? (
                                                        <Image src={img} alt={item.product_name || 'Img'} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                                            {fetchingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : "No Img"}
                                                        </div>
                                                    )
                                                })()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-900 truncate">{item.product_name || item.product?.name || 'Produk'}</p>
                                                <p className="text-sm text-gray-500">{item.quantity || 0} x {formatCurrency(item.price || 0)}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-semibold text-gray-900">{formatCurrency((item.quantity || 0) * (item.price || 0))}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Details */}
                            <div className="border-t pt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal Produk</span>
                                    <span>{formatCurrency(order.total_amount - (order.shipping_cost || 0))}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Ongkos Kirim {order.courier_name ? `(${order.courier_name.toUpperCase()} - ${order.courier_service})` : ''}</span>
                                    <span>{formatCurrency(order.shipping_cost || 0)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t mt-2">
                                    <span>Total Transaksi</span>
                                    <span className="text-emerald-600">{formatCurrency(order.total_amount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Debt Info */}
                    {order.payment_category === 'piutang' && (
                        <Card>
                            <CardHeader className="border-b bg-gray-50/50 pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-amber-600" />
                                    Informasi Piutang
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {loadingDebt ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                                    </div>
                                ) : debt ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 mb-1 text-xs">Tipe Piutang</p>
                                                <Badge variant="outline" className="uppercase font-bold text-[10px]">{debt.type}</Badge>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1 text-xs">Total Pinjaman</p>
                                                <p className="font-bold text-amber-600">{formatCurrency(debt.amount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1 text-xs">Tenor</p>
                                                <p className="font-medium text-gray-900">{debt.tenor_months ? `${debt.tenor_months} Bulan` : '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1 text-xs">Status Piutang</p>
                                                <Badge className={`text-[10px] ${debt.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                    {debt.status === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}
                                                </Badge>
                                            </div>
                                        </div>

                                        {debt.installments && debt.installments.length > 0 && (
                                            <div className="border rounded-md overflow-hidden">
                                                <Table>
                                                    <TableHeader className="bg-gray-50/50">
                                                        <TableRow>
                                                            <TableHead className="py-2 text-[11px] h-8">Cicilan</TableHead>
                                                            <TableHead className="py-2 text-[11px] h-8">Jumlah</TableHead>
                                                            <TableHead className="py-2 text-[11px] h-8">Jatuh Tempo</TableHead>
                                                            <TableHead className="py-2 text-[11px] h-8 text-right">Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {debt.installments.map((inst: any, idx: number) => (
                                                            <TableRow key={inst.id} className="h-10">
                                                                <TableCell className="py-2 font-medium text-gray-900 text-xs">Ke-{idx + 1}</TableCell>
                                                                <TableCell className="py-2 text-gray-900 text-xs">{formatCurrency(inst.amount)}</TableCell>
                                                                <TableCell className="py-2 text-[10px] text-gray-600">
                                                                    {inst.due_date ? new Date(inst.due_date).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                                                                </TableCell>
                                                                <TableCell className="py-2 text-right">
                                                                    <Badge variant="outline" className={`text-[9px] h-5 ${inst.status === 'paid' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-gray-200 text-gray-600'}`}>
                                                                        {inst.status === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic text-sm text-center py-4">Informasi piutang belum tersedia.</p>
                                )}
                            </CardContent>
                        </Card>
                    )}


                    {/* Shipping Info */}
                    <Card>
                        <CardHeader className="border-b bg-gray-50/50 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Truck className="h-5 w-5 text-blue-600" />
                                Informasi Pengiriman
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="">
                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <p className="font-semibold text-gray-900 mb-2">Alamat Tujuan</p>
                                    {order.customer_name ? (
                                        <div className="text-gray-600 p-3 bg-gray-50 rounded-md border space-y-1">
                                            <p className="font-bold text-gray-900">{order.customer_name}</p>
                                            <p>{order.customer_phone}</p>
                                            <p className="mt-2">{order.customer_address}</p>
                                            <p>{order.customer_subdistrict && `${order.customer_subdistrict}, `}{order.customer_district}, {order.customer_city}</p>
                                            <p>{order.customer_province} {order.customer_zipcode}</p>
                                        </div>
                                    ) : order.shipping_address ? (
                                        <div className="text-gray-600 p-3 bg-gray-50 rounded-md border space-y-1">
                                            <p className="font-bold text-gray-900">{order.shipping_address.name}</p>
                                            <p>{order.shipping_address.phone}</p>
                                            <p className="mt-2">{order.shipping_address.address}</p>
                                            <p>{order.shipping_address.subdistrict && `${order.shipping_address.subdistrict}, `}{order.shipping_address.district}, {order.shipping_address.city}</p>
                                            <p>{order.shipping_address.province} {order.shipping_address.zipcode}</p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">Informasi alamat tidak tersedia.</p>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="font-semibold text-gray-900 mb-1">Kurir / Layanan</p>
                                        <p className="text-gray-600 uppercase">
                                            {order.courier_name ? `${order.courier_name} (${order.courier_service})` : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 mb-1">Nomor Resi</p>
                                        {order.tracking_number ? (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="font-mono text-sm bg-blue-50 text-blue-700 border-blue-200 py-1">
                                                    {order.tracking_number}
                                                </Badge>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">Belum ada resi</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Sidebar (Right, 1 column) */}
                <div className="space-y-6">
                    {/* Piutang Approval Actions */}
                    {order.payment_category === 'piutang' && order.status === 'waiting_approval' && (
                        <Card className="border-amber-200 bg-amber-50/30">
                            <CardHeader className="pb-2 border-b border-amber-100">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-700">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Persetujuan Piutang
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <p className="text-xs text-amber-600 leading-relaxed font-medium">
                                    Pesanan ini menunggu persetujuan piutang. Harap tinjau rincian pesanan dan status pembeli sebelum menyetujui.
                                </p>

                                {!showRejectInput ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="destructive"
                                            className="w-full h-9 text-xs"
                                            onClick={() => setShowRejectInput(true)}
                                            disabled={approving}
                                        >
                                            Tolak
                                        </Button>
                                        <Button
                                            className="w-full h-9 text-xs bg-emerald-600 hover:bg-emerald-700"
                                            onClick={handleApprovePiutang}
                                            disabled={approving}
                                        >
                                            {approving ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <CheckCircle2 className="h-3 w-3 mr-2" />}
                                            Setujui
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Label className="text-xs">Alasan Penolakan</Label>
                                        <Textarea
                                            placeholder="Masukkan alasan penolakan..."
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            className="text-xs min-h-[80px]"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowRejectInput(false)}
                                                disabled={rejecting}
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={handleRejectPiutang}
                                                disabled={rejecting || !rejectReason}
                                            >
                                                {rejecting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : "Kirim Penolakan"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Status Update Form */}
                    <Card>
                        <CardHeader className="border-b bg-gray-50/50 pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <History className="h-4 w-4 text-orange-600" />
                                Update Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Ubah Status Pesanan</Label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['processing', 'shipped', 'delivered', 'completed', 'cancelled'].map((key) => {
                                            const config = ORDER_STATUS_CONFIG[key];
                                            const isCancelled = key === 'cancelled';
                                            const isDisabled = isCancelled && order.payment_status === 'paid';

                                            // Only show 'cancelled' if not paid, per user requirement
                                            if (isCancelled && order.payment_status === 'paid') return null;

                                            return (
                                                <SelectItem key={key} value={key} disabled={isDisabled}>
                                                    {config?.label || key}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Catatan Admin (Internal)</Label>
                                <Textarea
                                    placeholder="Masukkan catatan untuk pembeli..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="min-h-[100px]"
                                />
                                <p className="text-[10px] text-gray-400 italic">Catatan ini akan terlihat oleh pembeli.</p>
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleUpdateStatus}
                                disabled={savingStatus || (newStatus === order.status && adminNotes === (order.admin_notes || ''))}
                            >
                                {savingStatus && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Simpan Status
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Tracking Number Form */}
                    <Card>
                        <CardHeader className="border-b bg-gray-50/50 pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Truck className="h-4 w-4 text-blue-600" />
                                Input Resi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nomor Resi Pengiriman</Label>
                                <Input
                                    placeholder="Masukkan nomor resi..."
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={handleUpdateTracking}
                                disabled={savingTracking || !trackingNumber || trackingNumber === order.tracking_number}
                            >
                                {savingTracking && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Update Resi
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
