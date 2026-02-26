'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ShoppingCart,
  Eye,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  XCircle
} from 'lucide-react';
import { IconBuildingStore } from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import { getAccessToken } from '@/utils/auth';
import { orderService, storeService } from '@/services/apiService';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Status color mapping
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

export default function PembelianPage() {
  const { user } = useAuthStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});
  const [cancelling, setCancelling] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<any | null>(null);

  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const token = await getAccessToken();
      const params: any = {
        buyer_id: user.id, // Fetch orders where user is the buyer
        page,
        limit: 10,
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await orderService.getOrders(params, token || '');
      if (res.data) {
        const fetchedOrders = res.data.orders || [];
        setOrders(fetchedOrders);
        setTotalPages(Math.ceil((res.data.total || 0) / (res.data.limit || 10)));
        setTotalOrders(res.data.total || 0);

        // Fetch store details for unique store IDs
        const storeIds = Array.from(new Set(fetchedOrders.map((o: any) => o.store_id).filter(Boolean)));
        const storeMap: Record<string, string> = {};

        await Promise.all(
          storeIds.map(async (storeId) => {
            try {
              const storeRes = await storeService.getDetail(token || '', storeId as string);
              if (storeRes.data) {
                storeMap[storeId as string] = storeRes.data.name;
              }
            } catch (e) {
              console.error(`Failed to fetch store ${storeId}`, e);
            }
          })
        );

        setStoreNames(prev => ({ ...prev, ...storeMap }));
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    const orderId = orderToCancel.id;
    setCancelling(orderId);
    try {
      const token = await getAccessToken();
      await orderService.cancelOrder(orderId, token || ''); // Use dedicated cancel order API
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
      setOrderToCancel(null);
    } catch (err: any) {
      console.error('Failed to cancel order', err);
      alert(err.message || 'Gagal membatalkan pesanan');
    } finally {
      setCancelling(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputValue), 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [user?.id, statusFilter, searchQuery, page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pembelian Koperasi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Riwayat belanja dan pesanan Anda dari Vendor
          </p>
        </div>
        <Link href="/dashboard/koperasi/marketplace">
          <Button className="gradient-green text-white">
            <IconBuildingStore className="w-4 h-4 mr-2" />
            Ke Marketplace
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nomor pesanan..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu Konfirmasi</SelectItem>
              <SelectItem value="waiting_approval">Menunggu Persetujuan</SelectItem>
              <SelectItem value="paid">Dibayar</SelectItem>
              <SelectItem value="processing">Diproses</SelectItem>
              <SelectItem value="shipped">Dikirim</SelectItem>
              <SelectItem value="delivered">Terkirim</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
              <SelectItem value="cancelled">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : orders.length > 0 ? (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead className="w-[180px]">No. Pesanan</TableHead>
                  <TableHead>Toko</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pembayaran</TableHead>
                  <TableHead>Total Belanja</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, index) => (
                  <TableRow key={order.id} className="hover:bg-gray-50/50">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-gray-900">{order.invoice_number || order.order_number || `ORD-${order.id}`}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconBuildingStore size={16} className="text-gray-400" />
                        <span className="text-sm">{storeNames[order.store_id] || order.store?.name || 'Toko Vendor'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'} border-0 shadow-none pointer-events-none`}
                      >
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className={`w-fit shadow-none border ${order.payment_status === 'paid' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-amber-200 text-amber-700 bg-amber-50'}`}>
                          {order.payment_status === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}
                        </Badge>
                        <span className="text-[10px] text-gray-500 uppercase font-medium mt-0.5">{order.payment_category || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-emerald-600">
                        {formatCurrency(order.total_amount)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.payment_category === 'instant' && order.payment_status === 'unpaid' && (order.payment_url || order.ipaymu_payment_url) && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs font-semibold px-3"
                            onClick={() => window.open(order.payment_url || order.ipaymu_payment_url, '_blank')}
                            disabled={order.status === 'cancelled'}
                          >
                            Bayar
                          </Button>
                        )}
                        {order.payment_status !== 'paid' && order.status !== 'cancelled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                            onClick={() => setOrderToCancel(order)}
                            disabled={cancelling === order.id}
                          >
                            {cancelling === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span className="text-[10px] font-bold uppercase">Batalkan</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 gap-1.5 border-gray-200 text-gray-600 hover:text-gray-900"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase">Detail</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Tidak ada pesanan ditemukan</p>
              {statusFilter !== 'all' || searchQuery ? (
                <Button variant="outline" onClick={() => { setStatusFilter('all'); setInputValue(''); }}>Reset Filter</Button>
              ) : (
                <Link href="/dashboard/koperasi/marketplace"><Button>Mulai Belanja</Button></Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">Halaman {page} dari {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedOrder.invoice_number || selectedOrder.order_number || `ORD-${selectedOrder.id}`}</h3>
                  <p className="text-sm text-gray-500">{new Date(selectedOrder.created_at).toLocaleString('id-ID')}</p>
                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                    <IconBuildingStore size={14} /> {storeNames[selectedOrder.store_id] || selectedOrder.store?.name || 'Toko Vendor'}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <Badge className={selectedOrder.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                    {selectedOrder.payment_status === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}
                  </Badge>
                  <div className="block mt-2">
                    <Badge className={`${statusConfig[selectedOrder.status]?.color || 'bg-gray-100 text-gray-800'} border-0`}>
                      {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Daftar Produk</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-12 h-12 bg-gray-100 rounded border overflow-hidden shrink-0">
                        {(() => {
                          const img = item.product?.image ||
                            item.product?.images?.find((i: any) => i.is_primary)?.image_url ||
                            item.product?.images?.[0]?.image_url ||
                            item.product_image ||
                            item.image;
                          return img ? (
                            <Image src={img} alt="Img" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                          );
                        })()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product_name || item.product?.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} x {formatCurrency(item.price)}</p>
                      </div>
                      <div className="font-semibold text-sm">
                        {formatCurrency(item.quantity * item.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(selectedOrder.total_amount - (selectedOrder.shipping_cost || 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ongkos Kirim {selectedOrder.courier_name ? `(${selectedOrder.courier_name} - ${selectedOrder.courier_service})` : ''}</span>
                  <span>{formatCurrency(selectedOrder.shipping_cost || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                  <span>Total Keseluruhan</span>
                  <span className="text-emerald-600">{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Informasi Pengiriman</h4>
                <div className="text-sm space-y-1">
                  {selectedOrder.customer_name ? (
                    <>
                      <p className="font-medium">{selectedOrder.customer_name} ({selectedOrder.customer_phone})</p>
                      <p className="text-gray-600">{selectedOrder.customer_address}</p>
                      <p className="text-gray-600">
                        {selectedOrder.customer_subdistrict && `${selectedOrder.customer_subdistrict}, `}{selectedOrder.customer_district}, {selectedOrder.customer_city}, {selectedOrder.customer_province} {selectedOrder.customer_zipcode}
                      </p>
                    </>
                  ) : selectedOrder.shipping_address ? (
                    <>
                      <p className="font-medium">{selectedOrder.shipping_address.name} ({selectedOrder.shipping_address.phone})</p>
                      <p className="text-gray-600">{selectedOrder.shipping_address.address}</p>
                      <p className="text-gray-600">
                        {selectedOrder.shipping_address.subdistrict && `${selectedOrder.shipping_address.subdistrict}, `}{selectedOrder.shipping_address.district}, {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.province} {selectedOrder.shipping_address.zipcode}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">Informasi pengiriman tidak tersedia</p>
                  )}
                  {selectedOrder.tracking_number && (
                    <p className="mt-2 text-blue-600 font-medium tracking-wide">
                      Resi: {selectedOrder.tracking_number}
                    </p>
                  )}
                </div>
              </div>

              {selectedOrder.payment_category === 'instant' && selectedOrder.payment_status === 'unpaid' && (selectedOrder.payment_url || selectedOrder.ipaymu_payment_url) && (
                <div className="border-t pt-4 flex gap-3">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => window.open(selectedOrder.payment_url || selectedOrder.ipaymu_payment_url, '_blank')}
                    disabled={selectedOrder.status === 'cancelled'}
                  >
                    Lanjut Pembayaran Instan
                  </Button>
                  {selectedOrder.status !== 'cancelled' && (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setOrderToCancel(selectedOrder)}
                      disabled={cancelling === selectedOrder.id}
                    >
                      {cancelling === selectedOrder.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                      Batalkan Pesanan
                    </Button>
                  )}
                </div>
              )}
              {selectedOrder.payment_status === 'unpaid' && selectedOrder.status !== 'cancelled' && selectedOrder.payment_category !== 'instant' && (
                <div className="border-t pt-4">
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setOrderToCancel(selectedOrder)}
                    disabled={cancelling === selectedOrder.id}
                  >
                    {cancelling === selectedOrder.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Batalkan Pesanan
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancellation Confirmation Modal */}
      <Dialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Konfirmasi Pembatalan
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-gray-600">
              Apakah Anda yakin ingin membatalkan pesanan <span className="font-bold text-gray-900">{orderToCancel?.invoice_number || orderToCancel?.order_number || `ORD-${orderToCancel?.id}`}</span>?
            </p>
            <p className="text-sm text-gray-500 bg-red-50 p-3 rounded-md border border-red-100 italic">
              Tindakan ini tidak dapat dibatalkan setelah diproses.
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOrderToCancel(null)}
              disabled={cancelling === orderToCancel?.id}
            >
              Kembali
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCancelOrder}
              disabled={cancelling === orderToCancel?.id}
            >
              {cancelling === orderToCancel?.id && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Ya, Batalkan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
