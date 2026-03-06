'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Info, Loader2, CreditCard, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { getAccessToken } from '@/utils/auth';
import { campaignService, apiRequest } from '@/services/apiService';

export default function CampaignTopupPage() {
    const { user, isHydrated } = useAuthStore();
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isBalanceLoading, setIsBalanceLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [store, setStore] = useState<any>(null);

    // Fetch Store and Balance Data
    useEffect(() => {
        const fetchData = async () => {
            if (!isHydrated || !user) return;
            try {
                const token = await getAccessToken();
                // Get Store
                const storeRes = await apiRequest(`/stores/user/${user.id}`, { token: token || undefined });
                if (storeRes.data && storeRes.data.length > 0) {
                    const currentStore = storeRes.data[0];
                    setStore(currentStore);

                    // Get Campaign Data to show total balance (assuming balance is per store or we fetch from a specific balance endpoint)
                    // The postman shows "Get Store Campaigns" returns campaigns, but "Campaign Owner" is used for topup.
                    // For now, let's assume we can get balance from a dedicated endpoint if exists, 
                    // or just show a placeholder if the API doesn't provide a direct "get balance" yet.
                    // Based on the postman, Topup is POST to /campaigns/topup.
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsBalanceLoading(false);
            }
        };
        fetchData();
    }, [user, isHydrated]);

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
                        {isBalanceLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-100" />
                        ) : (
                            <div className="text-4xl font-bold tracking-tight">{formatCurrency(balance)}</div>
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
                                <p className="opacity-90">Anda akan diarahkan ke gerbang pembayaran aman iPaymu untuk menyelesaikan transaksi via Transfer Bank, E-Wallet, atau Qris.</p>
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

            {/* Additional Info / History Placeholder */}
            <Card className="border-none shadow-sm ring-1 ring-gray-200 mt-6">
                <CardHeader>
                    <CardTitle className="text-base font-bold text-gray-900">Riwayat Topup Terakhir</CardTitle>
                </CardHeader>
                <CardContent className="h-32 flex flex-col items-center justify-center text-gray-400">
                    <Info className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">Riwayat transaksi akan muncul di sini</p>
                </CardContent>
            </Card>
        </div>
    );
}
