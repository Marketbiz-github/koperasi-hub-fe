'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Search,
    Plus,
    Gift,
    Loader2,
    Trash2,
    Edit,
    AlertCircle,
    CheckCircle2,
    Power
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { getAccessToken } from '@/utils/auth';
import { campaignService, productService, apiRequest } from '@/services/apiService';

interface Campaign {
    id: number;
    product_id: number;
    fee_per_click: number;
    fee_per_reshare: number;
    fee_per_sale: number;
    max_budget: number;
    current_spent: number;
    is_active: boolean;
    product?: {
        name: string;
        images?: { image_url: string }[];
    };
}

export default function CampaignPage() {
    const { user, userDetail, fetchUserDetail, isHydrated } = useAuthStore();
    const [store, setStore] = useState<any>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Create/Edit Dialog States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [formData, setFormData] = useState({
        product_id: '',
        fee_per_click: 0,
        fee_per_reshare: 0,
        fee_per_sale: 0,
        max_budget: 0
    });

    // Fetch Store Data
    useEffect(() => {
        const fetchStore = async () => {
            if (!isHydrated || !user) return;
            try {
                const token = await getAccessToken();
                const res = await apiRequest(`/stores/user/${user.id}`, { token: token || undefined });
                if (res.data && res.data.length > 0) {
                    setStore(res.data[0]);
                }
            } catch (error) {
                console.error('Error fetching store:', error);
            }
        };
        fetchStore();
    }, [user, isHydrated]);

    const fetchCampaigns = useCallback(async () => {
        if (!store?.id) return;
        setIsLoading(true);
        try {
            const token = await getAccessToken();
            const res = await campaignService.getStoreCampaigns(token || '', store.id);
            setCampaigns(res.data || []);
        } catch (error) {
            toast.error('Gagal mengambil data campaign');
        } finally {
            setIsLoading(false);
        }
    }, [store]);

    const fetchProducts = useCallback(async () => {
        if (!store?.id) return;
        try {
            const token = await getAccessToken();
            const res = await productService.getProducts({ store_id: store.id, limit: 100 }, token || '');
            setProducts(res.data?.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, [store]);

    useEffect(() => {
        if (store) {
            fetchCampaigns();
            fetchProducts();
            fetchUserDetail();
        }
    }, [store, fetchCampaigns, fetchProducts, fetchUserDetail]);

    const handleCreateClick = () => {
        setSelectedCampaign(null);
        setFormData({
            product_id: '',
            fee_per_click: 10,
            fee_per_reshare: 2000,
            fee_per_sale: 5000,
            max_budget: 50000
        });
        setIsDialogOpen(true);
    };

    const handleEditClick = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setFormData({
            product_id: campaign.product_id.toString(),
            fee_per_click: campaign.fee_per_click,
            fee_per_reshare: campaign.fee_per_reshare,
            fee_per_sale: campaign.fee_per_sale,
            max_budget: campaign.max_budget
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Max Budget cannot be less than Current Spent
        if (selectedCampaign && formData.max_budget < selectedCampaign.current_spent) {
            toast.error(`Budget maksimal tidak boleh lebih kecil dari budget yang sudah terpakai (${formatCurrency(selectedCampaign.current_spent)})`);
            return;
        }

        // Validation: Min Balance check against fee_per_click
        const campaignBalance = (userDetail as any)?.campaign_balance || 0;
        if (campaignBalance < formData.fee_per_click) {
            toast.error(`Saldo campaign tidak cukup (Min. ${formatCurrency(formData.fee_per_click)}). Silakan topup terlebih dahulu.`);
            return;
        }

        // Validation: Min Balance 10,000 for New Campaign
        if (!selectedCampaign && campaignBalance < 10000) {
            toast.error('Saldo minimal Rp10.000 untuk membuat campaign baru');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await getAccessToken();

            if (selectedCampaign) {
                await campaignService.updateCampaign(token || '', selectedCampaign.id, {
                    fee_per_click: formData.fee_per_click,
                    fee_per_reshare: formData.fee_per_reshare,
                    fee_per_sale: formData.fee_per_sale,
                    max_budget: formData.max_budget,
                    is_active: true,
                    status: true
                });
                toast.success('Campaign berhasil diperbarui');
            } else {
                await campaignService.createCampaign(token || '', {
                    product_id: Number(formData.product_id),
                    fee_per_click: formData.fee_per_click,
                    fee_per_reshare: formData.fee_per_reshare,
                    fee_per_sale: formData.fee_per_sale,
                    max_budget: formData.max_budget
                });
                toast.success('Campaign berhasil dibuat');
            }
            fetchCampaigns();
            fetchUserDetail();
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Gagal menyimpan campaign');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus campaign ini?')) return;
        try {
            const token = await getAccessToken();
            await campaignService.deleteCampaign(token || '', id);
            toast.success('Campaign berhasil dihapus');
            fetchCampaigns();
        } catch (error) {
            toast.error('Gagal menghapus campaign');
        }
    };

    const handleToggleActive = async (campaign: Campaign) => {
        try {
            const token = await getAccessToken();
            const campaignBalance = (userDetail as any)?.campaign_balance || 0;

            // If activating, check balance
            if (!campaign.is_active) {
                if (campaignBalance < 10000) {
                    toast.error('Saldo minimal Rp10.000 untuk mengaktifkan campaign');
                    return;
                }
                if (campaignBalance < campaign.fee_per_click) {
                    toast.error(`Saldo tidak cukup untuk biaya per klik (${formatCurrency(campaign.fee_per_click)})`);
                    return;
                }
                if (campaign.current_spent >= campaign.max_budget) {
                    toast.error('Budget campaign sudah habis. Silakan tingkatkan budget maksimal.');
                    return;
                }
            }

            await campaignService.updateCampaign(token || '', campaign.id, {
                is_active: !campaign.is_active,
                status: !campaign.is_active
            });
            toast.success(`Campaign ${!campaign.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
            fetchCampaigns();
            fetchUserDetail();
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengubah status campaign');
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    const filteredCampaigns = campaigns.filter(c =>
        c.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Daftar Campaign</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-500">
                            Kelola campaign produk untuk meningkatkan jangkauan dan penjualan
                        </p>
                        <div className="h-4 w-px bg-gray-300" />
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 italic">
                            Saldo: {formatCurrency((userDetail as any)?.campaign_balance || 0)}
                        </div>
                    </div>
                </div>
                <Button onClick={handleCreateClick} className="gradient-green text-white shadow-sm ring-1 ring-emerald-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Campaign
                </Button>
            </div>

            {/* Filters */}
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardContent className="">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Cari nama produk..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-10 border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            <Card className="overflow-hidden border-none shadow-sm ring-1 ring-gray-200">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-gray-200">
                            <TableHead className="w-12 text-center text-xs font-bold uppercase text-gray-500 py-4">No.</TableHead>
                            <TableHead className="text-xs font-bold uppercase text-gray-500">Produk</TableHead>
                            <TableHead className="text-xs font-bold uppercase text-gray-500 text-center">Biaya (Klik/Share/Sale)</TableHead>
                            <TableHead className="text-xs font-bold uppercase text-gray-500 text-right">Budget & Terpakai</TableHead>
                            <TableHead className="text-xs font-bold uppercase text-gray-500 text-center">Status</TableHead>
                            <TableHead className="text-right text-xs font-bold uppercase text-gray-500 pr-6">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                                    <p className="text-sm text-gray-500 mt-2">Memuat data...</p>
                                </TableCell>
                            </TableRow>
                        ) : filteredCampaigns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <div className="p-4 bg-gray-50 rounded-full mb-4 ring-1 ring-gray-100">
                                            <Gift className="w-12 h-12 text-gray-300" />
                                        </div>
                                        <p className="text-lg font-medium text-gray-600">Belum ada campaign</p>
                                        <p className="text-sm mt-1">Mulai buat campaign pertama Anda untuk mendapatkan lebih banyak pelanggan.</p>
                                        <Button onClick={handleCreateClick} variant="outline" className="mt-6 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                            <Plus className="w-4 h-4 mr-2" /> Buat Sekarang
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCampaigns.map((c, idx) => (
                                <TableRow key={c.id} className="group hover:bg-emerald-50/30 transition-colors border-gray-100 last:border-0 font-medium">
                                    <TableCell className="text-center text-gray-400 text-sm">{idx + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50 flex items-center justify-center">
                                                {c.product?.images?.[0]?.image_url ? (
                                                    <img src={c.product.images[0].image_url} alt="" className="w-full h-full object-cover" />
                                                ) : <Gift className="w-5 h-5 text-gray-300" />}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-gray-900 line-clamp-1">{c.product?.name || 'Produk Tidak Ditemukan'}</span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">ID: #{c.id}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-wrap justify-center gap-1.5">
                                            <div className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] border border-blue-100">
                                                {formatCurrency(c.fee_per_click)} /klik
                                            </div>
                                            <div className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] border border-amber-100">
                                                {formatCurrency(c.fee_per_reshare)} /share
                                            </div>
                                            <div className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] border border-purple-100">
                                                {formatCurrency(c.fee_per_sale)} /sale
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-emerald-700">{formatCurrency(c.max_budget)}</span>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full"
                                                        style={{ width: `${Math.min(100, (c.current_spent / c.max_budget) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-gray-500">{formatCurrency(c.current_spent)}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight shadow-sm ring-1 ring-inset ${c.is_active
                                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                            : 'bg-gray-50 text-gray-500 ring-gray-600/20'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${c.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                            {c.is_active ? 'Aktif' : 'Non-aktif'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-8 w-8 ${c.is_active ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}`}
                                                onClick={() => handleToggleActive(c)}
                                                title={c.is_active ? "Nonaktifkan" : "Aktifkan"}
                                            >
                                                <Power className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => handleEditClick(c)}
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(c.id)}
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Dialog Create/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader className="p-6 bg-gray-50 border-b border-gray-100">
                            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                                    <Gift className="w-5 h-5" />
                                </div>
                                {selectedCampaign ? 'Perbarui Campaign' : 'Buat Campaign Baru'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-6 space-y-5">
                            {!selectedCampaign && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Pilih Produk</Label>
                                    <Select
                                        value={formData.product_id}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, product_id: val }))}
                                    >
                                        <SelectTrigger className="h-11 border-gray-200">
                                            <SelectValue placeholder="Pilih produk dari toko Anda" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => (
                                                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Fee Per Klik (Rp)</Label>
                                    <Input
                                        type="number"
                                        value={formData.fee_per_click}
                                        onChange={(e) => setFormData(prev => ({ ...prev, fee_per_click: Number(e.target.value) }))}
                                        className="h-11 border-gray-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Fee Per Share (Rp)</Label>
                                    <Input
                                        type="number"
                                        value={formData.fee_per_reshare}
                                        onChange={(e) => setFormData(prev => ({ ...prev, fee_per_reshare: Number(e.target.value) }))}
                                        className="h-11 border-gray-200"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Fee Per Sale (Rp)</Label>
                                    <Input
                                        type="number"
                                        value={formData.fee_per_sale}
                                        onChange={(e) => setFormData(prev => ({ ...prev, fee_per_sale: Number(e.target.value) }))}
                                        className="h-11 border-gray-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Budget Maksimal (Rp)</Label>
                                    <Input
                                        type="number"
                                        value={formData.max_budget}
                                        onChange={(e) => setFormData(prev => ({ ...prev, max_budget: Number(e.target.value) }))}
                                        className="h-11 border-gray-200"
                                    />
                                </div>
                            </div>

                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div className="text-[13px] text-amber-800 leading-relaxed">
                                    <p className="font-bold mb-1">Penting!</p>
                                    <p>Pastikan saldo campaign Anda cukup. Campaign akan otomatis non-aktif jika budget terlampaui atau saldo habis.</p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-6 bg-gray-50 border-t border-gray-100">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Batal</Button>
                            <Button type="submit" className="gradient-green text-white px-8" disabled={isSubmitting || (!selectedCampaign && !formData.product_id)}>
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                {selectedCampaign ? 'Simpan Perubahan' : 'Luncurkan Campaign'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
