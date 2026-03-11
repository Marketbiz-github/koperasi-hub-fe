'use client'

import { useEffect, useState } from 'react'
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { TopSelling } from "@/components/top-selling";
import { affiliatorService } from '@/services/apiService'
import { getAccessToken } from '@/utils/auth'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getAccessToken()
        if (token) {
          const response = await affiliatorService.getStats(token)
          setStats(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Promotor Dashboard</h1>
      <div className="my-6">
        <SectionCards
          items={[
            {
              title: "Total Komisi",
              value: stats ? `Rp. ${stats.total_commission?.toLocaleString('id-ID') || 0}` : "...",
              description: "Total komisi yang didapat",
            },
            {
              title: "Konversi Penjualan",
              value: stats ? `${stats.conversion_rate || 0}%` : "...",
              description: "Rasio klik menjadi penjualan",
            },
            {
              title: "Total Klik",
              value: stats ? `${stats.total_clicks || 0}` : "...",
              description: "Jumlah klik pada link afiliasi",
            },
            {
              title: "Total Share",
              value: stats ? `${stats.total_shares || 0}` : "...",
              description: "Jumlah link yang dibagikan",
            }
          ]}
        />
      </div>

    </div>
  );
}
