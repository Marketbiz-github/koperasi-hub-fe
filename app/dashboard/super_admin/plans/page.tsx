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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit, Trash2, Search, Link as LinkIcon } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Feature {
    id: number;
    code?: string;
    name: string;
    description?: string;
}

interface Plan {
    id: number;
    name: string;
    price: string;
    duration_days: number;
    created_at: string;
    features?: Feature[];
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [features, setFeatures] = useState<Feature[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // CRUD Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    
    // Assign Dialog state
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [assignPlanId, setAssignPlanId] = useState<number | null>(null);
    const [selectedFeatureIds, setSelectedFeatureIds] = useState<number[]>([]);

    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        duration_days: '',
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [planRes, featureRes] = await Promise.all([
                fetch('/api/plans'),
                fetch('/api/features')
            ]);
            
            const pResult = await planRes.json();
            const fResult = await featureRes.json();
            
            if (planRes.ok) {
                setPlans(pResult.data?.data || pResult.data || []);
            } else {
                toast.error(pResult.message || 'Gagal mengambil data paket');
            }

            if (featureRes.ok) {
                setFeatures(fResult.data?.data || fResult.data || []);
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat memuat data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenCreate = () => {
        setEditingPlan(null);
        setFormData({
            name: '',
            price: '',
            duration_days: '',
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            price: plan.price.toString(),
            duration_days: plan.duration_days.toString(),
        });
        setIsDialogOpen(true);
    };

    const handleOpenAssign = (plan: Plan) => {
        setAssignPlanId(plan.id);
        if (plan.features) {
            setSelectedFeatureIds(plan.features.map(f => f.id));
        } else {
            setSelectedFeatureIds([]); 
        }
        setIsAssignDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        const payload = {
            name: formData.name,
            price: formData.price, // API mengharapkan string, bukan number
            duration_days: Number(formData.duration_days),
        }

        try {
            const url = editingPlan
                ? `/api/plans/${editingPlan.id}`
                : '/api/plans';
            const method = editingPlan ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(editingPlan ? 'Paket diperbarui' : 'Paket ditambahkan');
                setIsDialogOpen(false);
                fetchData();
            } else {
                toast.error(result.message || 'Gagal menyimpan paket');
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
            const response = await fetch(`/api/plans/${deletingId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Paket dihapus');
                setIsDeleteDialogOpen(false);
                fetchData();
            } else {
                const result = await response.json();
                toast.error(result.message || 'Gagal menghapus paket');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan sistem');
        } finally {
            setIsSaving(false);
            setDeletingId(null);
        }
    };

    const handleSaveAssign = async () => {
        if (!assignPlanId) return;
        setIsSaving(true);

        // Cari plan yang sedang di-assign untuk ambil fitur yang sudah ada
        const currentPlan = plans.find(p => p.id === assignPlanId);
        const alreadyAssignedIds = (currentPlan?.features || []).map(f => f.id);

        // Hanya proses fitur yang belum ter-assign sebelumnya
        const newFeatureIds = selectedFeatureIds.filter(id => !alreadyAssignedIds.includes(id));

        if (newFeatureIds.length === 0) {
            toast.info('Tidak ada fitur baru yang perlu di-assign');
            setIsAssignDialogOpen(false);
            setIsSaving(false);
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const featureId of newFeatureIds) {
            try {
                const response = await fetch(`/api/plans/${assignPlanId}/features/${featureId}`, {
                    method: 'POST',
                });
                if (response.ok) {
                    successCount++;
                } else {
                    const result = await response.json();
                    console.error(`Gagal assign feature ${featureId}:`, result.message);
                    failCount++;
                }
            } catch (error) {
                console.error(`Error assign feature ${featureId}:`, error);
                failCount++;
            }
        }

        if (successCount > 0 && failCount === 0) {
            toast.success(`${successCount} fitur berhasil di-assign`);
        } else if (successCount > 0 && failCount > 0) {
            toast.warning(`${successCount} berhasil, ${failCount} fitur gagal di-assign`);
        } else {
            toast.error('Semua fitur gagal di-assign');
        }

        setIsAssignDialogOpen(false);
        setIsSaving(false);
        fetchData(); // Refresh agar tampilan fitur di plan terupdate
    }

    const filteredPlans = Array.isArray(plans) ? plans.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="space-y-6 px-4 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Manajemen Paket</h1>
                    <p className="text-muted-foreground">Kelola master data paket berlangganan</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Paket
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama paket..."
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
                                        <TableHead>Nama Paket</TableHead>
                                        <TableHead>Harga</TableHead>
                                        <TableHead>Durasi (Hari)</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPlans.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                Tidak ada paket ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPlans.map((p) => (
                                            <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-mono text-xs text-muted-foreground">#{p.id}</TableCell>
                                                <TableCell className="font-medium">{p.name}</TableCell>
                                                <TableCell>Rp {Number(p.price).toLocaleString('id-ID')}</TableCell>
                                                <TableCell>{p.duration_days} Hari</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Assign Fitur"
                                                            onClick={() => handleOpenAssign(p)}
                                                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                        >
                                                            <LinkIcon className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Edit Paket"
                                                            onClick={() => handleOpenEdit(p)}
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Hapus Paket"
                                                            onClick={() => {
                                                                setDeletingId(p.id);
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
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? 'Edit Paket' : 'Tambah Paket Baru'}</DialogTitle>
                        <DialogDescription>
                            Lengkapi informasi paket di bawah ini.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Paket</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Contoh: Premium Plan"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price">Harga (Rp)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="Contoh: 150000"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="duration">Durasi (Hari)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={formData.duration_days}
                                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                                placeholder="Contoh: 30"
                                required
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {editingPlan ? 'Update' : 'Simpan'}
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
                            Apakah Anda yakin ingin menghapus paket ini? Tindakan ini tidak dapat dibatalkan.
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

            {/* Assign Feature Modal */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Assign Fitur ke Paket</DialogTitle>
                        <DialogDescription>
                            Pilih fitur yang ingin dihubungkan dengan paket ini.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4 max-h-[300px] overflow-y-auto">
                        {features.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground">Tidak ada master data fitur ditemukan.</p>
                        ) : (
                            features.map(f => (
                                <div key={f.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`feature-${f.id}`} 
                                        checked={selectedFeatureIds.includes(f.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedFeatureIds(prev => [...prev, f.id]);
                                            } else {
                                                setSelectedFeatureIds(prev => prev.filter(id => id !== f.id));
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor={`feature-${f.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {f.name}
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSaveAssign} disabled={isSaving || features.length === 0} className="bg-green-600 hover:bg-green-700">
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Simpan Assigned Fitur
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
