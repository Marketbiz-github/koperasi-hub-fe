'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { productService, storeService } from '@/services/apiService';
import { getAccessToken } from '@/utils/auth';
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { TopSelling } from "@/components/top-selling";
import { Loader2 } from 'lucide-react';

export default function DashboardSummaryView({ role }: { role: string }) {
    const { user, store, isHydrated, hydrate } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [topProductsEnriched, setTopProductsEnriched] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isHydrated) {
            hydrate();
        }
    }, [isHydrated, hydrate]);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!isHydrated || !user || !store) return;
            try {
                const token = await getAccessToken();
                const res = await storeService.getDashboardSummary(token || '', store.id);
                if (res.data) {
                    setStats(res.data);
                    
                    // Fetch top products details to get images
                    if (res.data.top_products && res.data.top_products.length > 0) {
                        const enriched = await Promise.all(
                            res.data.top_products.map(async (p: any) => {
                                try {
                                    const detailRes = await productService.getProductDetail(p.product_id, token || '');
                                    return {
                                        ...p,
                                        image: detailRes.data?.thumb || detailRes.data?.image || null
                                    };
                                } catch (error) {
                                    console.error(`Error fetching detail for product ${p.product_id}:`, error);
                                    return { ...p, image: null };
                                }
                            })
                        );
                        setTopProductsEnriched(enriched);
                    }
                }
            } catch (error) {
                console.error('Error fetching dashboard summary:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isHydrated && user && store) {
            fetchSummary();
        } else if (isHydrated && (!user || !store)) {
            setLoading(false);
        }
    }, [user, store, isHydrated]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const cardItems = [
        {
            title: "Total Penjualan",
            value: stats ? formatCurrency(stats.total_sales_this_month) : "Rp 0",
            description: "Bulan ini",
            trend: stats?.total_sales_this_month >= stats?.total_sales_last_month ? "up" : "down" as any,
            percent: stats?.total_sales_last_month > 0 
                ? `${Math.abs(Math.round(((stats.total_sales_this_month - stats.total_sales_last_month) / stats.total_sales_last_month) * 100))}%`
                : "0%"
        },
        {
            title: "Total Pesanan",
            value: stats ? stats.total_orders_this_month.toString() : "0",
            description: "Bulan ini",
            trend: stats?.total_orders_this_month >= stats?.total_orders_last_month ? "up" : "down" as any,
            percent: stats?.total_orders_last_month > 0
                ? `${Math.abs(Math.round(((stats.total_orders_this_month - stats.total_orders_last_month) / stats.total_orders_last_month) * 100))}%`
                : "0%"
        },
        {
            title: "Total Produk",
            value: stats ? stats.total_products.toString() : "0",
            description: "Produk aktif",
        },
        {
            title: "Penjualan Kemarin",
            value: stats ? formatCurrency(stats.total_sales_yesterday) : "Rp 0",
            description: "Dibanding hari ini",
        }
    ];

    const topSellingItems = topProductsEnriched.map((p: any) => ({
        name: p.product_name,
        type: "Produk",
        sold: p.total_sold,
        image: p.image
    }));

    const chartData = stats ? [
        { date: "Bulan Lalu", sales: stats.total_sales_last_month },
        { date: "Minggu Lalu", sales: stats.total_sales_last_week },
        { date: "Minggu Ini", sales: stats.total_sales_this_week },
        { date: "Kemarin", sales: stats.total_sales_yesterday },
        { date: "Hari Ini", sales: stats.total_sales_today },
    ] : [];

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-800 capitalize">{role} Dashboard</h1>
                <p className="text-slate-500">Selamat datang kembali! Berikut ringkasan performa toko Anda.</p>
            </header>

            <SectionCards items={cardItems} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChartAreaInteractive 
                        title="Ringkasan Penjualan"
                        description="Statistik penjualan berdasarkan periode"
                        data={chartData}
                        dataKey="sales"
                    />
                </div>
                <div>
                  <TopSelling 
                    title="Produk Terlaris" 
                    description="Produk dengan penjualan terbanyak"
                    items={topSellingItems} 
                  />
                </div>
            </div>
        </div>
    );
}
