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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  DollarSign,
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  orderNo: string;
  vendorName: string;
  vendorImage: string;
  amount: number;
  paymentMethod: 'cash' | 'credit';
  status: 'pending' | 'confirmed' | 'paid';
  dueDate?: string;
  paidDate?: string;
  invoice?: string;
  notes?: string;
}

const mockPayments: PaymentRecord[] = [
  {
    id: '1',
    orderNo: 'ORD-2025-001',
    vendorName: 'Vendor Beras Premium',
    vendorImage: '/images/products/beras.png',
    amount: 3025000,
    paymentMethod: 'credit',
    status: 'pending',
    dueDate: '2025-02-24',
    invoice: 'INV-2025-001',
    notes: 'Kredit 30 hari',
  },
  {
    id: '2',
    orderNo: 'ORD-2025-002',
    vendorName: 'Vendor Sayuran Segar',
    vendorImage: '/images/products/beras.png',
    amount: 330000,
    paymentMethod: 'cash',
    status: 'confirmed',
    invoice: 'INV-2025-002',
    notes: 'Pembayaran tunai sudah dikonfirmasi',
  },
  {
    id: '3',
    orderNo: 'ORD-2025-003',
    vendorName: 'Vendor Buah Organik',
    vendorImage: '/images/products/beras.png',
    amount: 5250000,
    paymentMethod: 'credit',
    status: 'paid',
    dueDate: '2025-01-25',
    paidDate: '2025-01-23',
    invoice: 'INV-2025-003',
  },
];

const statusConfig = {
  pending: {
    label: 'Menunggu Pembayaran',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  confirmed: {
    label: 'Terkonfirmasi',
    color: 'bg-blue-100 text-blue-800',
    icon: AlertCircle,
  },
  paid: {
    label: 'Lunas',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
};

export default function PembayaranPage() {
  const [payments] = useState<PaymentRecord[]>(mockPayments);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const filteredPayments = payments.filter((payment) => {
    const matchStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchMethod =
      methodFilter === 'all' || payment.paymentMethod === methodFilter;
    return matchStatus && matchMethod;
  });

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (value: number) => {
    return `Rp${value.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const days = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Pembayaran</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola pembayaran pesanan ke vendor
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pembayaran</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="w-12 h-12 gradient-green rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menunggu Pembayaran</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sudah Dibayar</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {formatCurrency(paidAmount)}
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
          <CardTitle>Filter Pembayaran</CardTitle>
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
                  <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
                  <SelectItem value="confirmed">Terkonfirmasi</SelectItem>
                  <SelectItem value="paid">Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Metode</label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih metode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Metode</SelectItem>
                  <SelectItem value="cash">Tunai</SelectItem>
                  <SelectItem value="credit">Kredit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Records */}
      <div className="space-y-4">
        {filteredPayments.length > 0 ? (
          filteredPayments.map((payment) => {
            // const StatusIcon = statusConfig[payment.status].icon;
            const daysUntilDue = getDaysUntilDue(payment.dueDate);
            const isOverdue =
              daysUntilDue !== null && daysUntilDue < 0 && payment.status === 'pending';

            return (
              <Card key={payment.id} className="hover:shadow-lg transition">
                <CardContent className="pt-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between pb-4 border-b">
                    <div className="flex items-center gap-4 flex-1">
                      <Image
                        src={payment.vendorImage}
                        alt={payment.vendorName}
                        width={60}
                        height={60}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {payment.invoice}
                        </p>
                        <p className="text-sm text-gray-600">
                          {payment.vendorName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {payment.orderNo}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`${statusConfig[payment.status].color} border-0`}
                    >
                      {statusConfig[payment.status].label}
                    </Badge>
                  </div>

                  {/* Amount & Method */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Jumlah</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Metode</p>
                      <Badge
                        variant="outline"
                        className={
                          payment.paymentMethod === 'cash'
                            ? 'bg-green-50 border-green-300'
                            : 'bg-blue-50 border-blue-300'
                        }
                      >
                        {payment.paymentMethod === 'cash'
                          ? '💰 Tunai'
                          : '🏦 Kredit'}
                      </Badge>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                    {payment.dueDate && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Jatuh Tempo</p>
                        <p className="font-semibold text-sm text-gray-900">
                          {formatDate(payment.dueDate)}
                        </p>
                        {daysUntilDue !== null && payment.status === 'pending' && (
                          <p
                            className={`text-xs mt-1 ${
                              isOverdue
                                ? 'text-red-600 font-semibold'
                                : 'text-gray-600'
                            }`}
                          >
                            {isOverdue
                              ? `⚠️ Terlambat ${Math.abs(daysUntilDue)} hari`
                              : `${daysUntilDue} hari lagi`}
                          </p>
                        )}
                      </div>
                    )}
                    {payment.paidDate && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Tanggal Bayar</p>
                        <p className="font-semibold text-sm text-green-600">
                          {formatDate(payment.paidDate)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Catatan</p>
                      <p className="text-xs text-gray-900 font-medium">
                        {payment.notes || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="gap-2 flex-1">
                      <FileText className="w-4 h-4" />
                      Invoice
                    </Button>
                    {payment.status === 'pending' && payment.paymentMethod === 'cash' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 flex-1"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Bukti
                        </Button>
                        <Button
                          size="sm"
                          className="gradient-green text-white gap-2 flex-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Konfirmasi
                        </Button>
                      </>
                    )}
                    {payment.status === 'pending' && payment.paymentMethod === 'credit' && (
                      <Button
                        size="sm"
                        className="gradient-green text-white gap-2 flex-1"
                      >
                        <DollarSign className="w-4 h-4" />
                        Bayar Sekarang
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
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada data pembayaran</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
