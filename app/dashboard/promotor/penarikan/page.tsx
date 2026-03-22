'use client'

import { useState, useEffect, useCallback } from 'react'
import { affiliatorService } from '@/services/apiService'
import { getAccessToken } from '@/utils/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { 
    Loader2, 
    Wallet, 
    CreditCard, 
    ChevronRight, 
    Info, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    ArrowUpRight
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function PenarikanPage() {
    const { user, isHydrated } = useAuthStore()
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [historyLoading, setHistoryLoading] = useState(true)
    const [withdrawals, setWithdrawals] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)

    const fetchData = useCallback(async () => {
        if (!isHydrated || !user) return
        setHistoryLoading(true)
        try {
            const token = await getAccessToken()
            if (token) {
                const [historyRes, statsRes] = await Promise.all([
                    affiliatorService.getWithdrawHistory(token),
                    affiliatorService.getStats(token)
                ])
                
                if (historyRes.data) {
                    setWithdrawals(Array.isArray(historyRes.data) ? historyRes.data : [])
                }
                
                if (statsRes.data) {
                    setStats(statsRes.data)
                }
            }
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setHistoryLoading(false)
        }
    }, [user, isHydrated])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault()
        const numAmount = parseInt(amount)
        if (!amount || numAmount < 10000) {
            toast.error('Minimal penarikan Rp10.000')
            return
        }

        if (stats && numAmount > (stats.total_commission || 0)) {
            toast.error('Saldo komisi tidak cukup')
            return
        }

        setLoading(true)
        try {
            const token = await getAccessToken()
            if (token) {
                await affiliatorService.withdraw(numAmount, token)
                toast.success('Permintaan penarikan telah dikirim')
                setAmount('')
                // Refresh data
                await fetchData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Gagal melakukan penarikan')
        } finally {
            setLoading(false)
        }
    }

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
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">Penarikan Komisi</h1>
                    <p className="text-sm text-gray-500 mt-1">Tarik hasil kerja keras Anda ke rekening terdaftar</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <Card className="md:col-span-1 border-none bg-emerald-600 text-white shadow-lg overflow-hidden relative">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-emerald-50 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                            <Wallet className="w-4 h-4" />
                            Saldo Komisi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {historyLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-100" />
                        ) : (
                            <div className="text-4xl font-bold tracking-tight">
                                {formatCurrency(stats?.total_commission || 0)}
                            </div>
                        )}
                        <p className="text-xs text-emerald-100 mt-4 leading-relaxed opacity-80">
                            Komisi yang Anda dapatkan dari setiap klik, reshare, dan penjualan produk campaign.
                        </p>
                    </CardContent>
                </Card>

                {/* Form Card */}
                <Card className="md:col-span-2 border-none shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                        <CardTitle className="text-lg font-bold text-gray-900">Form Penarikan Saldo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <form onSubmit={handleWithdraw} className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">Jumlah Penarikan (Rp)</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">Rp</span>
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="Masukkan nominal, contoh: 50000"
                                        className="pl-12 h-12 text-lg font-medium border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        min="10000"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Info className="w-3 h-3 text-blue-500" />
                                    Minimal penarikan adalah Rp10.000
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex gap-4 shadow-sm ring-1 ring-blue-500/10">
                                <div className="p-2 bg-blue-100 rounded-xl h-fit">
                                    <CreditCard className="w-5 h-5 text-blue-600 shadow-sm" />
                                </div>
                                <div className="text-[13px] text-blue-800 leading-relaxed">
                                    <p className="font-bold mb-1 flex items-center gap-1.5 text-blue-900">
                                        Informasi Rekening
                                    </p>
                                    <p className="opacity-90">Dana akan dikirimkan ke rekening yang telah Anda daftarkan di pengaturan akun. Proses penarikan biasanya memakan waktu 1-3 hari kerja.</p>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-12 gradient-green text-white font-bold text-base shadow-lg shadow-emerald-500/20 rounded-xl group" 
                                disabled={loading || !amount}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <>
                                        Tarik Sekarang
                                        <ArrowUpRight className="w-4 h-4 ml-2 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* History Card */}
            <Card className="border-none shadow-sm ring-1 ring-gray-200 mt-6">
                <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-base font-bold text-gray-900">Riwayat Penarikan</CardTitle>
                        <CardDescription className="text-xs mt-1">Status terbaru dari permintaan penarikan Anda</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {historyLoading ? (
                        <div className="h-32 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                        </div>
                    ) : withdrawals.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-gray-400">
                            <div className="p-4 bg-gray-50 rounded-full mb-4">
                                <Clock className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-sm font-medium">Belum ada riwayat penarikan</p>
                            <p className="text-xs mt-1">Hasil kerja keras Anda akan muncul di sini</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-[10px]">Tanggal</TableHead>
                                        <TableHead className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-[10px]">Nominal</TableHead>
                                        <TableHead className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-[10px]">Status</TableHead>
                                        <TableHead className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-[10px] text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100">
                                    {withdrawals.map((withdraw, idx) => (
                                        <TableRow key={withdraw.id || idx} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                                                {new Date(withdraw.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                                                {formatCurrency(parseInt(withdraw.amount || 0))}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ring-1 ring-inset 
                                                    ${withdraw.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                                                        : withdraw.status === 'approved' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                                            : withdraw.status === 'rejected' ? 'bg-red-50 text-red-700 ring-red-600/20'
                                                                : 'bg-gray-50 text-gray-500 ring-gray-600/20'}`}
                                                >
                                                    {withdraw.status ? (
                                                        <span className="flex items-center gap-1">
                                                            {withdraw.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                                                            {withdraw.status === 'rejected' && <AlertCircle className="w-3 h-3" />}
                                                            {withdraw.status === 'pending' && <Clock className="w-3 h-3" />}
                                                            {withdraw.status.toUpperCase()}
                                                        </span>
                                                    ) : 'UNKNOWN'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-emerald-600">
                                                    Detail <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
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
