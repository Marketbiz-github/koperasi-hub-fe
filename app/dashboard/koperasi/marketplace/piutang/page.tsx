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
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface PaymentTerm {
  termNo: number;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
}

interface Receivable {
  id: string;
  contractNo: string;
  vendorName: string;
  vendorImage: string;
  totalAmount: number;
  totalTerms: number;
  completedTerms: number;
  status: 'active' | 'settled' | 'overdue' | 'macet';
  terms: PaymentTerm[];
  startDate: string;
  lastPaymentDate?: string;
}

const mockReceivables: Receivable[] = [
  {
    id: '1',
    contractNo: 'KRD-2025-001',
    vendorName: 'Vendor Beras Premium',
    vendorImage: '/images/products/beras.png',
    totalAmount: 3000000,
    totalTerms: 3,
    completedTerms: 1,
    status: 'active',
    startDate: '2025-01-01',
    lastPaymentDate: '2025-01-25',
    terms: [
      {
        termNo: 1,
        dueDate: '2025-01-25',
        amount: 1000000,
        status: 'paid',
        paidDate: '2025-01-25',
      },
      {
        termNo: 2,
        dueDate: '2025-02-24',
        amount: 1000000,
        status: 'pending',
      },
      {
        termNo: 3,
        dueDate: '2025-03-24',
        amount: 1000000,
        status: 'pending',
      },
    ],
  },
  {
    id: '2',
    contractNo: 'KRD-2025-002',
    vendorName: 'Vendor Buah Organik',
    vendorImage: '/images/products/beras.png',
    totalAmount: 5000000,
    totalTerms: 4,
    completedTerms: 2,
    status: 'overdue',
    startDate: '2024-12-15',
    lastPaymentDate: '2025-01-10',
    terms: [
      {
        termNo: 1,
        dueDate: '2024-12-15',
        amount: 1250000,
        status: 'paid',
        paidDate: '2024-12-15',
      },
      {
        termNo: 2,
        dueDate: '2025-01-10',
        amount: 1250000,
        status: 'paid',
        paidDate: '2025-01-10',
      },
      {
        termNo: 3,
        dueDate: '2025-01-20',
        amount: 1250000,
        status: 'overdue',
      },
      {
        termNo: 4,
        dueDate: '2025-02-20',
        amount: 1250000,
        status: 'pending',
      },
    ],
  },
  {
    id: '3',
    contractNo: 'KRD-2025-003',
    vendorName: 'Vendor Sayuran Segar',
    vendorImage: '/images/products/beras.png',
    totalAmount: 2000000,
    totalTerms: 2,
    completedTerms: 2,
    status: 'settled',
    startDate: '2024-11-01',
    lastPaymentDate: '2025-01-15',
    terms: [
      {
        termNo: 1,
        dueDate: '2024-12-01',
        amount: 1000000,
        status: 'paid',
        paidDate: '2024-12-01',
      },
      {
        termNo: 2,
        dueDate: '2025-01-15',
        amount: 1000000,
        status: 'paid',
        paidDate: '2025-01-15',
      },
    ],
  },
];

const statusConfig = {
  active: {
    label: 'Aktif',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock,
  },
  settled: {
    label: 'Lunas',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  overdue: {
    label: 'Ada Tunggakan',
    color: 'bg-orange-100 text-orange-800',
    icon: AlertCircle,
  },
  macet: {
    label: 'Macet',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
  },
};

export default function PiutangPage() {
  const [receivables] = useState<Receivable[]>(mockReceivables);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredReceivables =
    statusFilter === 'all'
      ? receivables
      : receivables.filter((r) => r.status === statusFilter);

  const totalReceivable = receivables.reduce((sum, r) => sum + r.totalAmount, 0);
  const overdueAmount = receivables
    .filter((r) => r.status === 'overdue')
    .reduce(
      (sum, r) => sum + r.terms.filter((t) => t.status === 'overdue').reduce((s, t) => s + t.amount, 0),
      0
    );
  const paidAmount = receivables.reduce(
    (sum, r) =>
      sum + r.terms.filter((t) => t.status === 'paid').reduce((s, t) => s + t.amount, 0),
    0
  );

  const formatCurrency = (value: number) => {
    return `Rp${value.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const days = Math.ceil(
      (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Piutang (Kredit)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola kontrak kredit dan jadwal pembayaran dengan vendor
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Piutang</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(totalReceivable)}
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

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tunggakan</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {formatCurrency(overdueAmount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Kontrak</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="settled">Lunas</SelectItem>
              <SelectItem value="overdue">Ada Tunggakan</SelectItem>
              <SelectItem value="macet">Macet</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Receivables List */}
      <div className="space-y-4">
        {filteredReceivables.map((receivable) => {
        //   const StatusIcon = statusConfig[receivable.status].icon;
          const progressPercentage = (receivable.completedTerms / receivable.totalTerms) * 100;
          const nextPendingTerm = receivable.terms.find((t) => t.status === 'pending');

          return (
            <Card key={receivable.id} className="hover:shadow-lg transition">
              <CardContent className="pt-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b">
                  <div className="flex items-center gap-4 flex-1">
                    <Image
                      src={receivable.vendorImage}
                      alt={receivable.vendorName}
                      width={60}
                      height={60}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {receivable.contractNo}
                      </p>
                      <p className="text-sm text-gray-600">
                        {receivable.vendorName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Dimulai: {formatDate(receivable.startDate)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`${statusConfig[receivable.status].color} border-0`}
                  >
                    {statusConfig[receivable.status].label}
                  </Badge>
                </div>

                {/* Amount Summary */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Kontrak</p>
                    <p className="font-bold text-gray-900">
                      {formatCurrency(receivable.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-green transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {receivable.completedTerms}/{receivable.totalTerms}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terms Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Termin
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Jatuh Tempo
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-700">
                          Jumlah
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {receivable.terms.map((term) => {
                        const daysOverdue = getDaysOverdue(term.dueDate);
                        const isOverdue =
                          term.status === 'overdue' ||
                          (term.status === 'pending' && daysOverdue > 0);

                        return (
                          <tr key={term.termNo} className="border-t">
                            <td className="px-3 py-2 font-semibold text-gray-900">
                              #{term.termNo}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {formatDate(term.dueDate)}
                              {isOverdue && (
                                <span className="ml-2 text-xs text-red-600 font-semibold">
                                  ({daysOverdue}h terlambat)
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold">
                              {formatCurrency(term.amount)}
                            </td>
                            <td className="px-3 py-2">
                              <Badge
                                className={
                                  term.status === 'paid'
                                    ? 'bg-green-100 text-green-800 border-0'
                                    : term.status === 'overdue'
                                    ? 'bg-red-100 text-red-800 border-0'
                                    : 'bg-yellow-100 text-yellow-800 border-0'
                                }
                              >
                                {term.status === 'paid'
                                  ? '✓ Lunas'
                                  : term.status === 'overdue'
                                  ? '⚠ Terlambat'
                                  : '⏳ Pending'}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Next Due */}
                {nextPendingTerm && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900 font-semibold">
                      📅 Termin Berikutnya:{' '}
                      {formatDate(nextPendingTerm.dueDate)}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Jumlah: {formatCurrency(nextPendingTerm.amount)}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="gap-2 flex-1">
                    <FileText className="w-4 h-4" />
                    Kontrak
                  </Button>
                  {nextPendingTerm && (
                    <Button
                      size="sm"
                      className="gradient-green text-white gap-2 flex-1"
                    >
                      <DollarSign className="w-4 h-4" />
                      Bayar Termin
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
