'use client';

import { useState } from 'react';
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
  ShoppingCart,
  Eye,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { IconBuildingStore } from '@tabler/icons-react';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  orderNo: string;
  vendorName: string;
  vendorImage: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'credit';
  createdAt: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNo: 'ORD-2025-001',
    vendorName: 'Vendor Beras Premium',
    vendorImage: '/images/products/beras.png',
    status: 'confirmed',
    items: [
      {
        id: '1',
        productName: 'Beras Premium 5kg',
        quantity: 10,
        price: 150000,
        total: 1500000,
      },
      {
        id: '2',
        productName: 'Beras Organik 10kg',
        quantity: 5,
        price: 250000,
        total: 1250000,
      },
    ],
    subtotal: 2750000,
    tax: 275000,
    total: 3025000,
    paymentMethod: 'credit',
    createdAt: '2025-01-24',
  },
  {
    id: '2',
    orderNo: 'ORD-2025-002',
    vendorName: 'Vendor Sayuran Segar',
    vendorImage: '/images/products/beras.png',
    status: 'pending',
    items: [
      {
        id: '3',
        productName: 'Kangkung Segar 1kg',
        quantity: 20,
        price: 15000,
        total: 300000,
      },
    ],
    subtotal: 300000,
    tax: 30000,
    total: 330000,
    paymentMethod: 'cash',
    createdAt: '2025-01-25',
  },
];

const statusConfig = {
  pending: { label: 'Menunggu Konfirmasi', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Dikirim', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Diterima', color: 'bg-green-100 text-green-800' },
};

export default function PembelianPage() {
  const [orders] = useState<Order[]>(mockOrders);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const formatCurrency = (value: number) => {
    return `Rp${value.toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pembelian</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola pesanan pembelian produk dari vendor
          </p>
        </div>
        <Link href="/dashboard/koperasi/marketplace">
          <Button className="gradient-green text-white">
            <IconBuildingStore className="w-4 h-4 mr-2" />
            Ke Marketplace
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pesanan</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalOrders}
                </p>
              </div>
              <div className="w-12 h-12 gradient-green rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pesanan Menunggu</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {pendingOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu Konfirmasi</SelectItem>
              <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
              <SelectItem value="shipped">Dikirim</SelectItem>
              <SelectItem value="delivered">Diterima</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-4 flex-1">
                      <Image
                        src={order.vendorImage}
                        alt={order.vendorName}
                        width={60}
                        height={60}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.orderNo}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.vendorName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {order.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={`${
                          statusConfig[order.status].color
                        } border-0`}
                      >
                        {statusConfig[order.status].label}
                      </Badge>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-700">
                          {item.productName} x {item.quantity}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">
                        {formatCurrency(order.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pajak</span>
                      <span className="font-semibold">
                        {formatCurrency(order.tax)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Payment & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <Badge
                        variant="outline"
                        className={
                          order.paymentMethod === 'cash'
                            ? 'bg-green-50 border-green-300'
                            : 'bg-blue-50 border-blue-300'
                        }
                      >
                        {order.paymentMethod === 'cash'
                          ? '💰 Tunai'
                          : '🏦 Kredit'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Detail
                      </Button>
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          className="gradient-green text-white"
                        >
                          Konfirmasi
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada pesanan</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
