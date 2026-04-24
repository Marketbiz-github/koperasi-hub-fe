'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, History, Info, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Plan {
    id: number;
    name: string;
    price: string;
    duration_days: number;
    features?: { id: number; name: string }[];
}

interface SubscriptionHistory {
    id: number;
    price_paid: string;
    duration_days: number;
    renewed_at: string;
    plan: {
        id: number;
        name: string;
    };
}

export function SharedLanggananPage() {
    const { user, hydrate } = useAuthStore();
    const pathname = usePathname();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [history, setHistory] = useState<SubscriptionHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<number | null>(null);
    const [historySearch, setHistorySearch] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Determine role from pathname (e.g. /dashboard/vendor/langganan)
                const roleMatch = pathname?.match(/\/dashboard\/([^\/]+)/);
                const currentRole = roleMatch ? roleMatch[1] : user?.role;
                
                // Fetch Plans with role filter
                const plansUrl = currentRole 
                    ? `/api/plans?role=${currentRole}&order_by=order&order_dir=ASC` 
                    : '/api/plans?order_by=order&order_dir=ASC';
                
                const resPlans = await fetch(plansUrl);
                const dataPlans = await resPlans.json();
                if (resPlans.ok) {
                    setPlans(dataPlans.data || []);
                } else {
                    toast.error(dataPlans.message || 'Gagal memuat paket');
                }

                // Fetch History
                if (user?.id) {
                    const resHistory = await fetch(`/api/users/${user.id}/subscription-history`);
                    const dataHistory = await resHistory.json();
                    if (resHistory.ok) {
                        setHistory(dataHistory.data || []);
                    }
                }
            } catch (error) {
                toast.error('Terjadi kesalahan memuat data langganan');
            } finally {
                setIsLoading(false);
                setIsHistoryLoading(false);
            }
        };

        fetchData();
    }, [pathname, user?.id]);

    const handleSelectPlan = async (planId: number) => {
        if (!user?.id) return;

        setIsProcessing(planId);
        try {
            // Determine role from pathname (e.g. /dashboard/vendor/langganan)
            const roleMatch = pathname?.match(/\/dashboard\/([^\/]+)/);
            const userRole = roleMatch ? roleMatch[1] : user.role;
            const returnUrl = `${window.location.origin}/dashboard/${userRole}/thankyou?type=plan`;

            const res = await fetch('/api/subscriptions/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan_id: planId, return_url: returnUrl })
            });
            const resData = await res.json();

            if (res.ok) {
                const paymentUrl = resData.data?.url || resData.data?.payment_url;
                if (paymentUrl) {
                    toast.success('Mengalihkan ke halaman pembayaran...');
                    window.location.href = paymentUrl;
                } else {
                    toast.error('Gagal mendapatkan link pembayaran iPaymu');
                }
            } else {
                toast.error(resData.message || 'Gagal merubah paket');
            }
        } catch (error) {
            toast.error('Gagal terhubung ke server');
        } finally {
            setIsProcessing(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const currentPlanId = user?.plan?.id;

    const filteredHistory = history.length > 0 ? history.filter(h => 
        h.plan.name.toLowerCase().includes(historySearch.toLowerCase())
    ) : [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Paket Langganan</h1>
                <p className="text-muted-foreground">Pilih paket langganan yang sesuai dengan kebutuhan tokomu.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {plans.map((plan) => {
                    const isCurrentPlan = currentPlanId === plan.id;
                    return (
                        <Card key={plan.id} className={`flex flex-col ${isCurrentPlan ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}>
                            <CardHeader>
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <CardDescription>
                                    <span className="text-3xl font-bold text-foreground">
                                        Rp {parseInt(plan.price).toLocaleString('id-ID')}
                                    </span>
                                    {plan.duration_days > 0 && <span className="text-sm"> / {plan.duration_days} Hari</span>}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                {plan.features && plan.features.length > 0 ? (
                                    <ul className="space-y-2">
                                        {plan.features.map(f => (
                                            <li key={f.id} className="flex items-center gap-2 text-sm">
                                                <Check className="h-4 w-4 text-green-500 shrink-0" />
                                                <span>{f.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">Fitur tidak tersedia</p>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={isCurrentPlan ? "outline" : "default"}
                                    disabled={isCurrentPlan || isProcessing !== null}
                                    onClick={() => handleSelectPlan(plan.id)}
                                >
                                    {isProcessing === plan.id && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                    {isCurrentPlan ? 'Paket Aktif' : 'Pilih Paket'}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-12">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" />
                            Riwayat Langganan
                        </h2>
                        <p className="text-sm text-muted-foreground">Catatan paket langganan yang pernah Anda beli.</p>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari paket..."
                            className="pl-9 pr-8"
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                        />
                        {historySearch && (
                            <button 
                                onClick={() => setHistorySearch('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                            >
                                <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                </div>

                <Card className="border-none shadow-sm ring-1 ring-gray-200">
                    <CardContent className="p-0">
                        {isHistoryLoading ? (
                            <div className="flex h-32 items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : filteredHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50/80 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-4 border-b">Tanggal Pembelian</th>
                                            <th className="px-6 py-4 border-b">Paket</th>
                                            <th className="px-6 py-4 border-b">Durasi</th>
                                            <th className="px-6 py-4 border-b text-right">Nominal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredHistory.map((h, i) => (
                                            <tr key={i} className="hover:bg-primary/5 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">
                                                            {new Date(h.renewed_at).toLocaleDateString('id-ID', {
                                                                day: '2-digit',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            Pukul {new Date(h.renewed_at).toLocaleTimeString('id-ID', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                                        <span className="font-semibold text-gray-900">{h.plan.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium">
                                                        {h.duration_days} Hari
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="font-bold text-gray-900">
                                                        Rp {parseInt(h.price_paid || "0").toLocaleString('id-ID')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex h-32 flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-lg">
                                <Info className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-sm font-medium">
                                    {historySearch ? `Tidak ada paket "${historySearch}" ditemukan` : 'Belum ada riwayat langganan'}
                                </p>
                                {historySearch && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="mt-2 text-xs"
                                        onClick={() => setHistorySearch('')}
                                    >
                                        Hapus pencarian
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
