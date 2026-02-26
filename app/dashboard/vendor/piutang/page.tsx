'use client';

import { useState, useEffect } from 'react';
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
    Loader2,
    ChevronLeft,
    ChevronRight,
    User,
    Wallet,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getAccessToken } from '@/utils/auth';
import { debtService, storeService } from '@/services/apiService';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye } from 'lucide-react';


// Status color mapping for Debts
const debtStatusConfig: Record<string, { label: string, color: string }> = {
    unpaid: { label: 'Belum Lunas', color: 'bg-amber-100 text-amber-800' },
    partially_paid: { label: 'Dibayar Sebagian', color: 'bg-blue-100 text-blue-800' },
    paid: { label: 'Lunas', color: 'bg-emerald-100 text-emerald-800' },
};

const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseInt(value) : value;
    return `Rp${(num || 0).toLocaleString('id-ID')}`;
};

export default function VendorPiutangPage() {
    const { user } = useAuthStore();

    const [debts, setDebts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDebts, setTotalDebts] = useState(0);

    const [customerStores, setCustomerStores] = useState<Record<string, any>>({});
    const [isFetchingStores, setIsFetchingStores] = useState(false);


    const fetchDebts = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const token = await getAccessToken();
            const params: any = {
                user_id: user.id, // Vendor ID
                page,
                limit: 10,
            };
            if (statusFilter !== 'all') params.status = statusFilter;

            const res = await debtService.getDebts(params, token || '');
            if (res.data) {
                const fetchedDebts = res.data.debts || [];
                setDebts(fetchedDebts);
                setTotalPages(res.data.pagination?.last_page || 1);
                setTotalDebts(res.data.pagination?.total || 0);

                // Fetch customer details
                fetchCustomerDetails(fetchedDebts, token || '');
            }

        } catch (err) {
            console.error('Failed to fetch debts', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerDetails = async (debtList: any[], token: string) => {
        const buyerIds = Array.from(new Set(debtList.map(d => d.buyer_id).filter(id => id && !customerStores[id])));
        if (buyerIds.length === 0) return;

        setIsFetchingStores(true);
        try {
            const storesMap = { ...customerStores };
            await Promise.all(buyerIds.map(async (id) => {
                try {
                    const res = await storeService.getDetail(token, id);
                    if (res.data) {
                        storesMap[id] = res.data;
                    }
                } catch (e) {
                    console.error(`Failed to fetch store detail for ${id}`, e);
                }
            }));
            setCustomerStores(storesMap);
        } finally {
            setIsFetchingStores(false);
        }
    };

    useEffect(() => {
        fetchDebts();
    }, [user?.id, statusFilter, page]);


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daftar Piutang</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Pantau dan kelola piutang dari pesanan koperasi
                    </p>
                </div>

            </div>

            {/* Stats Overview (Optional, can be expanded later) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-emerald-50 border-emerald-100">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-emerald-500 p-3 rounded-xl text-white">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-emerald-600">Total Piutang</p>
                            <p className="text-2xl font-bold text-emerald-700">{totalDebts}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Debts Table */}
            <Card className="shadow-sm border-gray-200 overflow-hidden p-4">
                <div className="flex">
                    <div className="flex items-center gap-3">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] bg-white border-gray-200">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="unpaid">Belum Lunas</SelectItem>
                                <SelectItem value="partially_paid">Dibayar Sebagian</SelectItem>
                                <SelectItem value="paid">Lunas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="rounded-md border-x border-t overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-16">No</TableHead>
                                <TableHead>No. Pesanan</TableHead>
                                <TableHead>Pelanggan</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Total Piutang</TableHead>
                                <TableHead>Tenor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                            <p className="text-sm text-gray-500">Memuat data piutang...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : debts.length > 0 ? (
                                debts.map((debt, index) => {
                                    const customerStore = customerStores[debt.buyer_id];
                                    return (
                                        <TableRow key={debt.id} className="hover:bg-muted/20 transition-colors">
                                            <TableCell className="text-muted-foreground font-medium">
                                                {(page - 1) * 10 + index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-gray-900 capitalize">{debt.order?.order_number || `ORD-${debt.order_id}`}</div>
                                                <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(debt.created_at).toLocaleDateString('id-ID')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border bg-muted">
                                                        <AvatarImage src={customerStore?.logo_url} alt={customerStore?.name} className="object-cover" />
                                                        <AvatarFallback className="bg-emerald-50 text-emerald-700 font-bold p-1">
                                                            {customerStore?.name?.substring(0, 2).toUpperCase() || <User className="w-4 h-4" />}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                                                            {customerStore?.name || debt.buyer_name || 'Pembeli'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 uppercase font-medium">
                                                            {customerStore?.domain || 'Store'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="uppercase text-[10px] font-bold">
                                                    {debt.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-emerald-700">
                                                    {formatCurrency(debt.amount)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-600">
                                                    {debt.tenor_months ? `${debt.tenor_months} Bulan` : '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={debt.status === 'paid' ? 'default' : 'secondary'} className={debt.status === 'paid' ? 'bg-emerald-500 hover:bg-emerald-600 text-[10px] shadow-none border-0' : 'text-[10px] shadow-none border-0'}>
                                                    {debtStatusConfig[debt.status]?.label || debt.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/dashboard/vendor/pesanan/${debt.order_id}`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                                        title="Lihat Order"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                                <Wallet className="w-12 h-12 text-gray-300" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">Belum ada piutang</h3>
                                            <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                                Daftar piutang akan muncul di sini jika ada pembeli yang menggunakan metode pembayaran piutang.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>


                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t bg-gray-50/50 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Menampilkan <span className="font-medium">{debts.length}</span> dari <span className="font-medium">{totalDebts}</span> piutang
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="h-8"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Sebelumnya
                            </Button>
                            <div className="flex items-center gap-1 mx-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <Button
                                        key={i}
                                        variant={page === i + 1 ? "default" : "ghost"}
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setPage(i + 1)}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="h-8"
                            >
                                Selanjutnya
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
