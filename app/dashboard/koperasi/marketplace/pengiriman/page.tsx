'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Truck,
  Package,
  CheckCircle,
  Eye,
  Copy,
  MapPin,
  Calendar,
} from 'lucide-react';

interface ShippingItem {
  id: string;
  productName: string;
  quantity: number;
  sku: string;
}

interface ShippingRecord {
  id: string;
  orderNo: string;
  vendorName: string;
  vendorImage: string;
  resi?: string;
  courier: 'vendor' | 'jne' | 'jnt' | 'tiki';
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered';
  items: ShippingItem[];
  shippingDate?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  quantity: number;
}

const mockShippings: ShippingRecord[] = [
  {
    id: '1',
    orderNo: 'ORD-2025-001',
    vendorName: 'Vendor Beras Premium',
    vendorImage: '/images/products/beras.png',
    resi: 'JNE-12345-6789',
    courier: 'jne',
    status: 'in_transit',
    items: [
      {
        id: '1',
        productName: 'Beras Premium 5kg',
        quantity: 10,
        sku: 'BERAS-001',
      },
      {
        id: '2',
        productName: 'Beras Organik 10kg',
        quantity: 5,
        sku: 'BERAS-002',
      },
    ],
    shippingDate: '2025-01-24',
    estimatedArrival: '2025-01-27',
    quantity: 15,
  },
  {
    id: '2',
    orderNo: 'ORD-2025-002',
    vendorName: 'Vendor Sayuran Segar',
    vendorImage: '/images/products/beras.png',
    courier: 'vendor',
    status: 'pending',
    items: [
      {
        id: '3',
        productName: 'Kangkung Segar 1kg',
        quantity: 20,
        sku: 'SAYUR-001',
      },
    ],
    quantity: 20,
  },
  {
    id: '3',
    orderNo: 'ORD-2025-003',
    vendorName: 'Vendor Buah Organik',
    vendorImage: '/images/products/beras.png',
    resi: 'JMEX-9876-5432',
    courier: 'jnt',
    status: 'delivered',
    items: [
      {
        id: '4',
        productName: 'Jeruk Nipis 2kg',
        quantity: 15,
        sku: 'BUAH-001',
      },
    ],
    shippingDate: '2025-01-20',
    estimatedArrival: '2025-01-23',
    actualArrival: '2025-01-22',
    quantity: 15,
  },
];

const statusConfig = {
  pending: {
    label: 'Menunggu Pengiriman',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Package,
  },
  shipped: {
    label: 'Sudah Dikirim',
    color: 'bg-blue-100 text-blue-800',
    icon: Truck,
  },
  in_transit: {
    label: 'Dalam Perjalanan',
    color: 'bg-purple-100 text-purple-800',
    icon: MapPin,
  },
  delivered: {
    label: 'Diterima',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
};

const courierConfig = {
  vendor: { label: 'Vendor Logistics', color: 'bg-gray-100' },
  jne: { label: 'JNE', color: 'bg-blue-100' },
  jnt: { label: 'J&T', color: 'bg-red-100' },
  tiki: { label: 'TIKI', color: 'bg-green-100' },
};

export default function PengirimanPage() {
  const [shippings] = useState<ShippingRecord[]>(mockShippings);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resiFilter, setResiFilter] = useState<string>('');

  const filteredShippings = shippings.filter((shipping) => {
    const matchStatus = statusFilter === 'all' || shipping.status === statusFilter;
    const matchResi = !resiFilter || shipping.resi?.includes(resiFilter);
    return matchStatus && matchResi;
  });

  const totalShipments = shippings.length;
  const deliveredShipments = shippings.filter(
    (s) => s.status === 'delivered'
  ).length;
  const inTransitShipments = shippings.filter(
    (s) => s.status === 'in_transit'
  ).length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysInTransit = (shippingDate?: string) => {
    if (!shippingDate) return null;
    const shipped = new Date(shippingDate);
    const today = new Date();
    return Math.ceil(
      (today.getTime() - shipped.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Pengiriman</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola pengiriman dan tracking nomor resi
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pengiriman</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalShipments}
                </p>
              </div>
              <div className="w-12 h-12 gradient-green rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dalam Perjalanan</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {inTransitShipments}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sudah Diterima</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {deliveredShipments}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Pengiriman</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu Pengiriman</SelectItem>
                  <SelectItem value="shipped">Sudah Dikirim</SelectItem>
                  <SelectItem value="in_transit">Dalam Perjalanan</SelectItem>
                  <SelectItem value="delivered">Diterima</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Cari Nomor Resi
              </label>
              <Input
                placeholder="Masukkan nomor resi..."
                value={resiFilter}
                onChange={(e) => setResiFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Records */}
      <div className="space-y-4">
        {filteredShippings.length > 0 ? (
          filteredShippings.map((shipping) => {
            // const StatusIcon = statusConfig[shipping.status].icon;
            const daysInTransit = getDaysInTransit(shipping.shippingDate);

            return (
              <Card key={shipping.id} className="hover:shadow-lg transition">
                <CardContent className="pt-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between pb-4 border-b">
                    <div className="flex items-center gap-4 flex-1">
                      <Image
                        src={shipping.vendorImage}
                        alt={shipping.vendorName}
                        width={60}
                        height={60}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {shipping.orderNo}
                        </p>
                        <p className="text-sm text-gray-600">
                          {shipping.vendorName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {shipping.quantity} item
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`${statusConfig[shipping.status].color} border-0`}
                    >
                      {statusConfig[shipping.status].label}
                    </Badge>
                  </div>

                  {/* Resi & Courier */}
                  {shipping.resi ? (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Nomor Resi</p>
                          <p className="font-mono font-bold text-gray-900">
                            {shipping.resi}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => {
                              navigator.clipboard.writeText(shipping.resi || '');
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Badge className={courierConfig[shipping.courier].color}>
                            {courierConfig[shipping.courier].label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-900 font-semibold">
                        ⚠️ Menunggu vendor untuk memberikan nomor resi
                      </p>
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900">Daftar Item:</p>
                    {shipping.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-600">{item.sku}</p>
                        </div>
                        <span className="font-semibold">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Timeline */}
                  <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                    {shipping.shippingDate && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Tanggal Pengiriman</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(shipping.shippingDate)}
                          </p>
                          {daysInTransit && (
                            <p className="text-xs text-gray-600 mt-1">
                              {daysInTransit} hari dalam perjalanan
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {shipping.estimatedArrival && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">
                            Estimasi Tiba
                          </p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(shipping.estimatedArrival)}
                          </p>
                        </div>
                      </div>
                    )}

                    {shipping.actualArrival && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Tanggal Diterima</p>
                          <p className="font-semibold text-green-600">
                            {formatDate(shipping.actualArrival)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="gap-2 flex-1">
                      <Eye className="w-4 h-4" />
                      Detail
                    </Button>
                    {shipping.status === 'pending' && (
                      <Button
                        size="sm"
                        className="gradient-green text-white gap-2 flex-1"
                      >
                        <Truck className="w-4 h-4" />
                        Update Resi
                      </Button>
                    )}
                    {shipping.status === 'delivered' && (
                      <Button variant="outline" size="sm" className="gap-2 flex-1">
                        <CheckCircle className="w-4 h-4" />
                        Konfirmasi Terima
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada data pengiriman</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
