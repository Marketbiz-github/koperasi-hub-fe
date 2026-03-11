'use client'

import { useState, useEffect } from 'react'
import { affiliatorService } from '@/services/apiService'
import { getAccessToken } from '@/utils/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Loader2 } from 'lucide-react'

export default function PenarikanPage() {
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [historyLoading, setHistoryLoading] = useState(true)
    const [withdrawals, setWithdrawals] = useState<any[]>([])

    const fetchHistory = async () => {
        setHistoryLoading(true)
        try {
            const token = await getAccessToken()
            if (token) {
                const response = await affiliatorService.getWithdrawHistory(token)
                if (response.data) {
                    setWithdrawals(Array.isArray(response.data) ? response.data : [])
                }
            }
        } catch (error) {
            console.error('Failed to fetch withdrawal history:', error)
        } finally {
            setHistoryLoading(false)
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [])

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || parseInt(amount) < 10000) {
            toast.error('Minimal penarikan Rp. 10.000')
            return
        }

        setLoading(true)
        try {
            const token = await getAccessToken()
            if (token) {
                await affiliatorService.withdraw(parseInt(amount), token)
                toast.success('Permintaan penarikan telah dikirim')
                setAmount('')
                // Refresh data
                await fetchHistory()
            }
        } catch (error: any) {
            toast.error(error.message || 'Gagal melakukan penarikan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Penarikan Komisi</h1>
                <p className="text-muted-foreground">Tarik hasil kerja keras Anda ke rekening</p>
            </div>

            <Card className='max-w-xl'>
                <CardHeader>
                    <CardTitle>Form Penarikan</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleWithdraw} className="space-y-4 max-w-xl">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Jumlah Penarikan</label>
                            <Input
                                type="number"
                                placeholder="Contoh: 50000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="10000"
                                required
                            />
                            <p className="text-xs text-muted-foreground">Minimal penarikan Rp. 10.000</p>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {loading ? 'Memproses...' : 'Tarik Sekarang'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Penarikan</CardTitle>
                    <CardDescription>Status terbaru dari setiap permintaan penarikan yang pernah Anda buat.</CardDescription>
                </CardHeader>
                <CardContent>
                    {historyLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                        </div>
                    ) : withdrawals.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 border border-dashed rounded-xl">
                            Belum ada riwayat penarikan.
                        </div>
                    ) : (
                        <div className="rounded-md border max-w-full overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Nominal</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {withdrawals.map((withdraw, idx) => (
                                        <TableRow key={withdraw.id || idx}>
                                            <TableCell>
                                                {new Date(withdraw.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                Rp. {parseInt(withdraw.amount || 0).toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs font-medium 
                                                    ${withdraw.status === 'pending' ? 'bg-amber-100 text-amber-700'
                                                        : withdraw.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
                                                            : withdraw.status === 'rejected' ? 'bg-red-100 text-red-700'
                                                                : 'bg-slate-100 text-slate-700'}`}
                                                >
                                                    {withdraw.status ? withdraw.status.toUpperCase() : 'UNKNOWN'}
                                                </span>
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
