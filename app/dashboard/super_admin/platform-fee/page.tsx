'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit, Trash2, Search, Globe, Store as StoreIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface PlatformFee {
    id: number;
    nominal: number;
    store_id: number | null;
    created_at?: string;
    store?: {
        name: string;
        subdomain: string;
    }
}

interface StoreOption {
    id: number;
    name: string;
}

export default function PlatformFeePage() {
    const [fees, setFees] = useState<PlatformFee[]>([]);
    const [stores, setStores] = useState<StoreOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingStores, setIsLoadingStores] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // CRUD Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingFee, setEditingFee] = useState<PlatformFee | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    
    const [isSaving, setIsSaving] = useState(false);

    const [isGlobal, setIsGlobal] = useState(true);
    const [formData, setFormData] = useState({
        nominal: '',
        store_id: '',
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/platform-fee');
            const result = await response.json();
            
            if (response.ok) {
                setFees(result.data?.data || result.data || []);
            } else {
                toast.error(result.message || 'Gagal mengambil data platform fee');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat memuat data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchStores = useCallback(async () => {
        setIsLoadingStores(true);
        try {
            const response = await fetch('/api/stores?limit=100');
            const result = await response.json();
            if (response.ok) {
                // Adjust based on typical store API response structure
                const storeData = result.data?.data || result.data || [];
                setStores(storeData.map((s: any) => ({
                    id: s.id,
                    name: s.name || s.subdomain || `Store #${s.id}`
                })));
            }
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setIsLoadingStores(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        fetchStores();
    }, [fetchData, fetchStores]);

    const handleOpenCreate = () => {
        setEditingFee(null);
        setIsGlobal(true);
        setFormData({
            nominal: '',
            store_id: '',
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (fee: PlatformFee) => {
        setEditingFee(fee);
        setIsGlobal(fee.store_id === null);
        setFormData({
            nominal: fee.nominal.toString(),
            store_id: fee.store_id ? fee.store_id.toString() : '',
        });
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        const payload = {
            nominal: Number(formData.nominal),
            store_id: isGlobal ? null : Number(formData.store_id),
        }

        try {
            const url = editingFee
                ? `/api/platform-fee/${editingFee.id}`
                : '/api/platform-fee';
            const method = editingFee ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(editingFee ? 'Platform Fee diperbarui' : 'Platform Fee ditambahkan');
                setIsDialogOpen(false);
                fetchData();
            } else {
                toast.error(result.message || 'Gagal menyimpan platform fee');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan sistem');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setIsSaving(true);
        try {
            const response = await fetch(`/api/platform-fee/${deletingId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Platform Fee dihapus');
                setIsDeleteDialogOpen(false);
                fetchData();
            } else {
                const result = await response.json();
                toast.error(result.message || 'Gagal menghapus platform fee');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan sistem');
        } finally {
            setIsSaving(false);
            setDeletingId(null);
        }
    };

    const filteredFees = Array.isArray(fees) ? fees.filter(f => {
        const searchL = searchTerm.toLowerCase();
        if (f.store?.name && f.store.name.toLowerCase().includes(searchL)) return true;
        if (f.id.toString() === searchL) return true;
        if (f.store_id?.toString() === searchL) return true;
        if (searchTerm === '') return true;
        return false;
    }) : [];

    return (
        <div className="space-y-6 px-4 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Platform Fee</h1>
                    <p className="text-muted-foreground">Kelola pengaturan Platform Fee global atau per-store</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Platform Fee
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari ID Store / Nama Store..."
                            className="max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex h-[300px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-16">ID</TableHead>
                                        <TableHead>Tipe</TableHead>
                                        <TableHead>Target</TableHead>
                                        <TableHead>Nominal</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFees.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                Tidak ada data platform fee ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredFees.map((f) => (
                                            <TableRow key={f.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-mono text-xs text-muted-foreground">#{f.id}</TableCell>
                                                <TableCell>
                                                    {f.store_id ? (
                                                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                                                            <StoreIcon className="mr-1 h-3 w-3" /> Spesifik Store
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                                                            <Globe className="mr-1 h-3 w-3" /> Global
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {f.store_id ? `${f.store?.name || 'Store ID: ' + f.store_id}` : 'Semua Store'}
                                                </TableCell>
                                                <TableCell className="font-medium text-green-700">Rp {Number(f.nominal).toLocaleString('id-ID')}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Edit Platform Fee"
                                                            onClick={() => handleOpenEdit(f)}
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Hapus"
                                                            onClick={() => {
                                                                setDeletingId(f.id);
                                                                setIsDeleteDialogOpen(true);
                                                            }}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingFee ? 'Edit Platform Fee' : 'Tambah Platform Fee'}</DialogTitle>
                        <DialogDescription>
                            Atur nilai platform fee. Anda dapat menerapkannya untuk global (semua transaksi) atau spesifik untuk store tertentu.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <Label>Target Global</Label>
                                <p className="text-xs text-muted-foreground">Berlaku untuk semua store</p>
                            </div>
                            <Switch
                                checked={isGlobal}
                                onCheckedChange={setIsGlobal}
                            />
                        </div>

                        {!isGlobal && (
                            <div className="grid gap-2">
                                <Label htmlFor="store_id">Pilih Store Target</Label>
                                <SearchableSelect
                                    options={stores}
                                    value={formData.store_id}
                                    onValueChange={(val) => setFormData({ ...formData, store_id: val })}
                                    placeholder="Pilih store..."
                                    searchPlaceholder="Cari nama store..."
                                    isLoading={isLoadingStores}
                                />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="nominal">Nominal Fee (Rp)</Label>
                            <Input
                                id="nominal"
                                type="number"
                                value={formData.nominal}
                                onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                                placeholder="Contoh: 2000"
                                required
                            />
                        </div>
                        
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {editingFee ? 'Update' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confim Modal */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus Platform Fee ini? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
                        <Button
                            variant="destructive"
                            disabled={isSaving}
                            onClick={handleDelete}
                        >
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

