"use client"

import { useEffect, useState } from "react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { TopSelling } from "@/components/top-selling";
import { apiRequest } from "@/services/apiService";
import { getAccessToken } from "@/utils/auth";

export default function DashboardPage() {
  const [counts, setCounts] = useState({
    vendor: 0,
    koperasi: 0,
    reseller: 0,
    promotor: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;

        // Fetch counts for each role
        const roles = ['vendor', 'koperasi', 'reseller', 'promotor'];
        const results = await Promise.all(
          roles.map(role => 
            apiRequest(`/users?page=1&limit=1&role=${role}`, { token })
              .catch(() => ({ data: { total: 0 } }))
          )
        );

        const extractTotal = (res: any) => {
          if (res?.data?.meta?.total !== undefined) return res.data.meta.total;
          if (res?.meta?.total !== undefined) return res.meta.total;
          if (res?.data?.total !== undefined) return res.data.total;
          return res?.data?.data?.length || res?.data?.length || 0;
        };

        const newCounts = {
          vendor: extractTotal(results[0]),
          koperasi: extractTotal(results[1]),
          reseller: extractTotal(results[2]),
          promotor: extractTotal(results[3]),
        };

        setCounts(newCounts as any);
      } catch (error) {
        console.error("Failed to fetch dashboard counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const chartData = [
    { date: "Bulan Lalu", sales: 150000000 },
    { date: "Minggu Lalu", sales: 45000000 },
    { date: "Minggu Ini", sales: 52000000 },
    { date: "Kemarin", sales: 8500000 },
    { date: "Hari Ini", sales: 3200000 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">Ringkasan performa seluruh platform Koperasi Hub</p>
      
      <div className="my-6">
        <SectionCards
          items={[
            {
              title: "Total Vendor",
              value: loading ? "..." : counts.vendor.toLocaleString('id-ID'),
              description: "Vendor aktif",
            },
            {
              title: "Total Koperasi",
              value: loading ? "..." : counts.koperasi.toLocaleString('id-ID'),
              description: "Koperasi terdaftar",
            },
            {
              title: "Total Reseller",
              value: loading ? "..." : counts.reseller.toLocaleString('id-ID'),
              description: "Reseller aktif",
            },
            {
              title: "Total Promotor",
              value: loading ? "..." : counts.promotor.toLocaleString('id-ID'),
              description: "Promotor aktif",
            },
            {
              title: "Total Penjualan",
              value: "Rp. 5.250.000.000",
              description: "Bulan ini (Statis)",
            },
          ]}
        />
      </div>

      <div className="my-6 flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-2/3">
          <ChartAreaInteractive 
            title="Grafik Penjualan Keseluruhan"
            description="Statistik total penjualan platform"
            data={chartData}
            dataKey="sales"
          />
        </div>
        <div className="lg:w-1/3">
          <TopSelling
            title="Top Selling Produk"
            description="Produk terlaris di seluruh platform"
            items={[
              {
                name: "Kaos Polos Premium",
                type: "Produk",
                image: "/images/products/kaos.jpg",
                sold: 1200,
                revenue: "Rp. 32.000.000",
              },
              {
                name: "Paket Dropship Gold",
                type: "Paket",
                image: "/images/products/paket.jpg",
                sold: 850,
                revenue: "Rp. 55.000.000",
              },
              {
                name: "Jasa Admin Marketplace",
                type: "Jasa",
                image: "/images/products/jasa.jpg",
                sold: 420,
                revenue: "Rp. 21.000.000",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

