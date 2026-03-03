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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { getAccessToken } from '@/utils/auth';
import { orderService, productService } from '@/services/apiService';
import { useNotificationStore } from '@/store/notificationStore';
import { Loader2, ArrowLeft, Package, Truck, CheckCircle2, History } from 'lucide-react';
import { IconBuildingStore } from '@tabler/icons-react';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string, color: string }> = {
    pending: { label: 'Menunggu Konfirmasi', color: 'bg-yellow-100 text-yellow-800' },
    waiting_approval: { label: 'Menunggu Persetujuan', color: 'bg-orange-100 text-orange-800' },
    paid: { label: 'Dibayar', color: 'bg-emerald-100 text-emerald-800' },
    processing: { label: 'Diproses', color: 'bg-blue-100 text-blue-800' },
    shipped: { label: 'Dikirim', color: 'bg-purple-100 text-purple-800' },
    delivered: { label: 'Terkirim', color: 'bg-indigo-100 text-indigo-800' },
    completed: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' },
    refunded: { label: 'Dikembalikan', color: 'bg-rose-100 text-rose-800' },
    failed: { label: 'Gagal', color: 'bg-red-100 text-red-800' },
    expired: { label: 'Kedaluwarsa', color: 'bg-gray-100 text-gray-800' },
};

const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseInt(value) : value;
    return `Rp${(num || 0).toLocaleString('id-ID')}`;
};

export default function PesananDetailPage() {
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
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan</h1>
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
                                    <Badge className={order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                                        {order.payment_status === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}
                                    </Badge>
                                    <Badge className={`${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'} border-0`}>
                                        {statusConfig[order.status]?.label || order.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1">Tanggal</p>
                                    <p className="font-medium text-gray-900">
                                        {order.created_at ? new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Toko</p>
                                    <p className="font-medium text-gray-900 flex items-center gap-1">
                                        <IconBuildingStore className="h-4 w-4 text-gray-400" />
                                        {order.store?.name || 'Toko Vendor'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Tipe Pembayaran</p>
                                    <p className="font-medium text-gray-900 uppercase">{order.payment_category || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Total</p>
                                    <p className="font-bold text-emerald-600">{formatCurrency(order.total_amount)}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2">Produk Dibeli</h4>
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
                                    <span>Total Keseluruhan</span>
                                    <span className="text-emerald-600">{formatCurrency(order.total_amount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Info */}
                    <Card>
                        <CardHeader className="border-b bg-gray-50/50 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Truck className="h-5 w-5 text-blue-600" />
                                Informasi Pengiriman
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
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
                    {/* Status Update Form */}
                    <Card>
                        <CardHeader className="border-b bg-gray-50/50 pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <History className="h-4 w-4 text-orange-600" />
                                Update Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Ubah Status Pesanan</Label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['processing', 'shipped', 'delivered', 'completed', 'cancelled'].map((key) => {
                                            const config = statusConfig[key];
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
                        <CardContent className="pt-6 space-y-4">
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

                    {/* Instant Payment Button (if applicable) */}
                    {order.payment_category === 'instant' && order.payment_status === 'unpaid' && (order.payment_url || order.ipaymu_payment_url) && (
                        <Card className="border-emerald-200 bg-emerald-50/50">
                            <CardContent className="pt-6">
                                <div className="text-center mb-4">
                                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                                    <h3 className="font-medium text-gray-900">Menunggu Pembayaran</h3>
                                    <p className="text-sm text-gray-600 mt-1">Selesaikan pembayaran untuk memproses pesanan ini.</p>
                                </div>
                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => window.open(order.payment_url || order.ipaymu_payment_url, '_blank')}
                                >
                                    Bayar Sekarang
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
