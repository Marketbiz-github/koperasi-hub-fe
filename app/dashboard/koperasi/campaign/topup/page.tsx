'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Info, Loader2, CreditCard, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { getAccessToken } from '@/utils/auth';
import { campaignService, apiRequest } from '@/services/apiService';

export default function CampaignTopupPage() {
    const { user, userDetail, fetchUserDetail, isHydrated } = useAuthStore();
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    // Fetch History Data
    const fetchHistory = useCallback(async () => {
        if (!isHydrated || !user) return;
        setIsHistoryLoading(true);
        try {
            const token = await getAccessToken();
            const res = await campaignService.getTopupHistory(token || '', {
                page: currentPage,
                limit: limit
            });

            // Handle nested data structure: res.data.data
            const historyData = res.data?.data || [];
            const total = res.data?.total || 0;

            setHistory(historyData);
            setTotalItems(total);
            setTotalPages(Math.ceil(total / limit));
        } catch (error) {
            console.error('Error fetching history:', error);
            // toast.error('Gagal mengambil riwayat topup');
        } finally {
            setIsHistoryLoading(false);
        }
    }, [user, isHydrated, currentPage]);

    useEffect(() => {
        fetchHistory();
        if (isHydrated && user) {
            fetchUserDetail();
        }
    }, [fetchHistory, isHydrated, user, fetchUserDetail]);

    const handleTopup = async () => {
        if (!amount || Number(amount) < 10000) {
            toast.error('Minimal topup adalah Rp10.000');
            return;
        }

        setIsLoading(true);
        try {
            const token = await getAccessToken();
            const res = await campaignService.topupSaldo(token || '', Number(amount));

            if (res.data?.payment_url) {
                toast.success('Mengalihkan ke halaman pembayaran...');
                window.location.href = res.data.payment_url;
            } else {
                toast.error('Gagal mendapatkan URL pembayaran');
            }
        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan saat memproses topup');
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    const campaignBalance = (userDetail as any)?.campaign_balance || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Topup Saldo Campaign</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Isi saldo untuk mendanai campaign produk Anda agar tetap berjalan
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Info */}
                <Card className="md:col-span-1 border-none bg-emerald-600 text-white shadow-lg overflow-hidden relative">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-emerald-50 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                            <Wallet className="w-4 h-4" />
                            Saldo Campaign
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!isHydrated ? (
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-100" />
                        ) : (
                            <div className="text-4xl font-bold tracking-tight">{formatCurrency(campaignBalance)}</div>
                        )}
                        <p className="text-xs text-emerald-100 mt-4 leading-relaxed opacity-80">
                            Saldo digunakan untuk membayar biaya setiap klik, share, dan penjualan yang dihasilkan melalui campaign.
                        </p>
                    </CardContent>
                </Card>

                {/* Topup Form */}
                <Card className="md:col-span-2 border-none shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                        <CardTitle className="text-lg font-bold text-gray-900">Form Pengisian Saldo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-3">
                            <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">Jumlah Topup (Rp)</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="Masukkan nominal, contoh: 100000"
                                    className="pl-11 h-12 text-lg font-medium border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {[50000, 100000, 250000, 500000].map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setAmount(val.toString())}
                                        className="px-4 py-1.5 text-xs font-semibold rounded-full border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm"
                                    >
                                        +{formatCurrency(val).replace('Rp', '')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex gap-4 shadow-sm ring-1 ring-blue-500/10">
                            <div className="p-2 bg-blue-100 rounded-xl h-fit">
                                <CreditCard className="w-5 h-5 text-blue-600 shadow-sm" />
                            </div>
                            <div className="text-[13px] text-blue-800 leading-relaxed">
                                <p className="font-bold mb-1 flex items-center gap-1.5 text-blue-900">
                                    Metode Pembayaran: iPaymu
                                </p>
                                <p className="opacity-90">Anda akan diarahkan ke halaman pembayaran aman iPaymu untuk menyelesaikan transaksi via Transfer Bank, E-Wallet, atau Qris.</p>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 gradient-green text-white font-bold text-base shadow-lg shadow-emerald-500/20 rounded-xl group"
                            disabled={!amount || isLoading}
                            onClick={handleTopup}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <>
                                    Proses Pembayaran
                                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* History Table */}
            <Card className="border-none shadow-sm ring-1 ring-gray-200 mt-6">
                <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-base font-bold text-gray-900">Riwayat Topup</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isHistoryLoading ? (
                        <div className="h-32 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                        </div>
                    ) : history.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4">Tanggal</th>
                                        <th className="px-6 py-4">Nominal</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {history.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                                {formatCurrency(item.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                                                    item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {item.status === 'pending' && item.payment_url && (
                                                    <Button
                                                        variant="link"
                                                        className="p-0 h-auto text-emerald-600 font-bold hover:text-emerald-700 text-xs"
                                                        onClick={() => window.open(item.payment_url, '_blank')}
                                                    >
                                                        Bayar Sekarang
                                                    </Button>
                                                )}
                                                {item.status === 'success' && (
                                                    <span className="text-xs text-emerald-600 font-medium italic">Selesai</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="h-32 flex flex-col items-center justify-center text-gray-400">
                            <Info className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">Belum ada riwayat transaksi</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {!isHistoryLoading && totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                            <p className="text-xs text-gray-500 font-medium">
                                Menampilkan <span className="text-gray-900">{(currentPage - 1) * limit + 1}</span> - <span className="text-gray-900">{Math.min(currentPage * limit, totalItems)}</span> dari <span className="text-gray-900">{totalItems}</span> transaksi
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-md border-gray-200"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            className={`h-8 w-8 p-0 rounded-md transition-all ${currentPage === page
                                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm"
                                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                                }`}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-md border-gray-200"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
