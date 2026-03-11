'use client'

import { useEffect, useState } from 'react'
import { affiliatorService } from '@/services/apiService'
import { getAccessToken } from '@/utils/auth'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function RiwayatTransaksi() {
    const [loading, setLoading] = useState(true)
    const [shares, setShares] = useState<any[]>([])

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = await getAccessToken()
                if (token) {
                    const response = await affiliatorService.getStats(token)
                    if (response.data && response.data.active_shares) {
                        setShares(response.data.active_shares)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch transactions:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Riwayat Transaksi Afiliasi</h1>
                <p className="text-muted-foreground">Daftar produk yang telah Anda bagikan beserta potensi komisinya</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Share & Komisi</CardTitle>
                    <CardDescription>Menampilkan daftar produk yang pernah di-share dan fee komisi per-tindakan.</CardDescription>
                </CardHeader>
                <CardContent>
                    {shares.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            Belum ada riwayat transaksi atau share link.
                        </div>
                    ) : (
                        <div className="rounded-md border max-w-full overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No</TableHead>
                                        <TableHead>Produk</TableHead>
                                        <TableHead>Kode Share</TableHead>
                                        <TableHead>Fee per Klik</TableHead>
                                        <TableHead>Fee per Reshare</TableHead>
                                        <TableHead>Fee per Penjualan</TableHead>
                                        <TableHead>Tanggal Dibuat</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shares.map((share, index) => (
                                        <TableRow key={share.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                {share.campaign?.product?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                                                    {share.share_code}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                Rp. {share.campaign?.fee_per_click?.toLocaleString() || 0}
                                            </TableCell>
                                            <TableCell>
                                                Rp. {share.campaign?.fee_per_reshare?.toLocaleString() || 0}
                                            </TableCell>
                                            <TableCell>
                                                Rp. {share.campaign?.fee_per_sale?.toLocaleString() || 0}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(share.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
