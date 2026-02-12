'use client';

import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, X, Loader2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { productOptionService, productOptionValueService, apiRequest } from '@/services/apiService';
import { getAccessToken } from '@/utils/auth';

export default function OptionsPageShared() {
    const { user, isHydrated, hydrate } = useAuthStore();
    const [store, setStore] = useState<any>(null);
    const [options, setOptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingOption, setEditingOption] = useState<any>(null);
    const [optionName, setOptionName] = useState('');
    const [optionValues, setOptionValues] = useState<string[]>([]);
    const [newValue, setNewValue] = useState('');

    useEffect(() => {
        if (!isHydrated) hydrate();
    }, [isHydrated, hydrate]);

    const fetchData = async () => {
        if (!user) return;
        try {
            const token = await getAccessToken();
            if (!token) return;

            const storeInfo = await apiRequest(`/stores/user/${user.id}`, { token });
            const currentStore = storeInfo.data?.[0];
            if (currentStore) {
                setStore(currentStore);
                const optRes = await productOptionService.getList(token, { store_id: currentStore.id });
                const opts = optRes.data || [];

                // Fetch values for each option
                const enrichedOptions = await Promise.all(opts.map(async (opt: any) => {
                    const valRes = await productOptionValueService.getList(token, { option_id: opt.id });
                    return { ...opt, values: valRes.data || [] };
                }));

                setOptions(enrichedOptions);
            }
        } catch (error) {
            console.error('Error fetching options:', error);
            toast.error('Gagal memuat data opsi');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isHydrated && user) fetchData();
    }, [user, isHydrated]);

    const handleSaveOption = async () => {
        if (!optionName.trim()) {
            toast.error('Nama varian wajib diisi');
            return;
        }

        setIsSaving(true);
        try {
            const token = await getAccessToken();
            if (!token) throw new Error('No token');

            let optId = editingOption?.id;
            if (editingOption) {
                await productOptionService.update(token, optId, { name: optionName });
            } else {
                const res = await productOptionService.create(token, {
                    store_id: store.id,
                    product_id: 1, // Use placeholder ID for global options
                    name: optionName
                });
                optId = res.data.id;
            }

            // Sync values
            const currentValues = editingOption?.values || [];
            const valuesToCreate = optionValues.filter(v => !currentValues.some((cv: any) => cv.value === v));
            const valuesToDelete = currentValues.filter((cv: any) => !optionValues.includes(cv.value));

            for (const val of valuesToCreate) {
                await productOptionValueService.create(token, {
                    store_id: store.id,
                    product_option_id: optId,
                    value: val
                });
            }

            for (const val of valuesToDelete) {
                await productOptionValueService.delete(token, val.id);
            }

            toast.success('Opsi berhasil disimpan');
            setIsDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Gagal menyimpan opsi');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteOption = async (id: number) => {
        if (!confirm('Hapus opsi ini? Semua produk yang menggunakan opsi ini mungkin terpengaruh.')) return;
        try {
            const token = await getAccessToken();
            if (!token) return;
            await productOptionService.delete(token, id);
            toast.success('Opsi dihapus');
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus opsi');
        }
    };

    const openEdit = (opt: any) => {
        setEditingOption(opt);
        setOptionName(opt.name);
        setOptionValues(opt.values.map((v: any) => v.value));
        setIsDialogOpen(true);
    };

    const openAdd = () => {
        setEditingOption(null);
        setOptionName('');
        setOptionValues([]);
        setIsDialogOpen(true);
    };

    const addValue = () => {
        if (!newValue.trim()) return;
        if (optionValues.includes(newValue.trim())) return;
        setOptionValues([...optionValues, newValue.trim()]);
        setNewValue('');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Kelola Opsi Produk</h1>
                    <p className="text-slate-500 text-sm">Buat dan atur pilihan varian (Warna, Ukuran, dll) yang bisa digunakan di semua produk.</p>
                </div>
                <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Varian
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/4">Nama Varian</TableHead>
                                <TableHead>Pilihan Nilai</TableHead>
                                <TableHead className="w-[120px] text-right pr-6">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {options.map((opt) => (
                                <TableRow key={opt.id}>
                                    <TableCell className="font-medium align-top py-4">{opt.name}</TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {opt.values.map((v: any) => (
                                                <Badge key={v.id} variant="secondary" className="px-3 py-1">{v.value}</Badge>
                                            ))}
                                            {opt.values.length === 0 && <span className="text-slate-400 italic text-xs">Belum ada nilai</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right align-top py-4 pr-6">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => openEdit(opt)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteOption(opt.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {options.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-12 text-slate-400">
                                        Belum ada data opsi varian.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingOption ? 'Edit Opsi' : 'Tambah Opsi Baru'}</DialogTitle>
                        <DialogDescription>
                            Contoh: Warna (Merah, Biru) atau Ukuran (S, M, L)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nama Varian (Misal: Warna)</Label>
                            <Input
                                placeholder="Misal: Warna"
                                value={optionName}
                                onChange={e => setOptionName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Pilihan Nilai</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {optionValues.map((val, idx) => (
                                    <Badge key={idx} className="pl-2 pr-1 py-1 gap-1 bg-slate-200 text-slate-800 hover:bg-slate-300">
                                        {val}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 hover:bg-transparent"
                                            onClick={() => setOptionValues(optionValues.filter((_, i) => i !== idx))}
                                        >
                                            <X className="h-3 w-3 text-slate-500" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Input nilai lalu tekan Enter"
                                    value={newValue}
                                    onChange={e => setNewValue(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addValue();
                                        }
                                    }}
                                />
                                <Button type="button" onClick={addValue} className="bg-slate-100 text-slate-900 border hover:bg-slate-200">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Batal</Button>
                        <Button onClick={handleSaveOption} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
