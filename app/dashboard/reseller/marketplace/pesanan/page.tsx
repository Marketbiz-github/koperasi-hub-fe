'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
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
  User
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getAccessToken } from '@/utils/auth';
import { orderService } from '@/services/apiService';
import { ORDER_STATUS_CONFIG, getOrderStatusLabel } from '@/utils/constants';
import { useNotificationStore } from '@/store/notificationStore';
import { Input } from '@/components/ui/input';

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseInt(value) : value;
  return `Rp${(num || 0).toLocaleString('id-ID')}`;
};

export default function PesananPage() {
  const { user } = useAuthStore();
  const { readOrderIds } = useNotificationStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const token = await getAccessToken();
      const params: any = {
        user_id: user.id, // Fetch orders where user is the merchant/seller
        page,
        limit: 10,
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await orderService.getOrders(params, token || '');
      if (res.data) {
        setOrders(res.data.orders || []);
        setTotalPages(Math.ceil((res.data.total || 0) / (res.data.limit || 10)));
        setTotalOrders(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-2xl font-semibold">Pesanan Masuk</h1>
        <p className="text-sm text-gray-500 mt-1">
          Daftar pesanan dari Kustomer untuk Toko Reseller Anda
        </p>
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="waiting_approval">Waiting Approval</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
                  <TableHead>Pembeli</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Info Pembayaran</TableHead>
                  <TableHead>Total Transaksi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, index) => {
                  const isUnread = !readOrderIds.includes(order.id.toString());
                  return (
                    <TableRow key={order.id} className={`transition-colors ${isUnread ? 'bg-gray-100' : ''}`}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900">{order.invoice_number || order.order_number || `ORD-${order.id}`}</div>
                          {isUnread && (
                            <Badge className="bg-emerald-500 text-white text-[10px] h-4 px-1 border-0">NEW</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-medium text-sm">
                            <User size={14} className="text-gray-400" />
                            <span>{order.customer_name || 'Pembeli'}</span>
                          </div>
                          <span className="text-xs text-gray-500 pl-5">{order.customer_phone || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${ORDER_STATUS_CONFIG[order.status]?.color || 'bg-gray-100 text-gray-800'} border-0 shadow-none pointer-events-none`}
                        >
                          {getOrderStatusLabel(order.status, order.payment_category, order.paid_at)}
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
                        <Link href={`/dashboard/reseller/marketplace/pesanan/${order.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 gap-1.5 border-gray-200 text-gray-600 hover:text-gray-900"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Detail
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Belum ada pesanan masuk</p>
              {statusFilter !== 'all' || searchQuery ? (
                <Button variant="outline" onClick={() => { setStatusFilter('all'); setInputValue(''); }}>Reset Filter</Button>
              ) : null}
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
    </div>
  );
}
