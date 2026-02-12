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
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit, Trash2, Search, ImageIcon } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { validateImage } from '@/utils/image-validation';

interface GeneralCategory {
    id: number;
    name: string;
    image: string | null;
    category_parent: number | null;
    category_grand_parent: number | null;
    status: string;
    created_at: string;
    updated_at: string;
}

export default function GeneralCategoryPage() {
    const [categories, setCategories] = useState<GeneralCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<GeneralCategory | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        category_parent: 'none',
        category_grand_parent: 'none',
        status: '1',
    });

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/general-categories');
            const result = await response.json();
            if (response.ok) {
                // Data structure logic based on provided sample: result.data.data
                const list = result.data?.data || result.data || [];
                setCategories(list);
            } else {
                toast.error(result.message || 'Gagal mengambil data kategori');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat memuat data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleOpenCreate = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            image: '',
            category_parent: 'none',
            category_grand_parent: 'none',
            status: '1',
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (category: GeneralCategory) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            image: category.image || '',
            category_parent: category.category_parent ? String(category.category_parent) : 'none',
            category_grand_parent: category.category_grand_parent ? String(category.category_grand_parent) : 'none',
            status: category.status,
        });
        setIsDialogOpen(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateImage(file);
        if (!validation.valid) {
            toast.error(validation.error);
            return;
        }

        setIsUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('role', 'categories');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload,
            });

            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, image: data.path }));
                toast.success('Gambar berhasil diunggah');
            } else {
                toast.error(data.error || 'Gagal mengunggah gambar');
            }
        } catch (error) {
            toast.error('Gagal menghubungi server upload');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const payload = {
            ...formData,
            category_parent: formData.category_parent === 'none' ? "" : String(formData.category_parent),
            category_grand_parent: formData.category_grand_parent === 'none' ? "" : String(formData.category_grand_parent),
        };

        try {
            const url = editingCategory
                ? `/api/general-categories/${editingCategory.id}`
                : '/api/general-categories';
            const method = editingCategory ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(editingCategory ? 'Kategori diperbarui' : 'Kategori ditambahkan');
                setIsDialogOpen(false);
                fetchCategories();
            } else {
                toast.error(result.message || 'Gagal menyimpan kategori');
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
            const response = await fetch(`/api/general-categories/${deletingId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Kategori dihapus');
                setIsDeleteDialogOpen(false);
                fetchCategories();
            } else {
                const result = await response.json();
                toast.error(result.message || 'Gagal menghapus kategori');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan sistem');
        } finally {
            setIsSaving(false);
            setDeletingId(null);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 px-4 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">General Kategori</h1>
                    <p className="text-muted-foreground">Kelola kategori produk global untuk marketplace</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama kategori..."
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
                                        <TableHead>Gambar</TableHead>
                                        <TableHead>Nama Kategori</TableHead>
                                        <TableHead>Parent</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCategories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                Tidak ada kategori ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCategories.map((cat) => (
                                            <TableRow key={cat.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-mono text-xs text-muted-foreground">#{cat.id}</TableCell>
                                                <TableCell>
                                                    {cat.image ? (
                                                        <img
                                                            src={cat.image}
                                                            alt={cat.name}
                                                            className="h-10 w-10 rounded-md object-cover border"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Img';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                                            <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{cat.name}</TableCell>
                                                <TableCell>
                                                    {cat.category_parent ? (
                                                        <Badge variant="outline" className="font-normal">
                                                            Parent ID: {cat.category_parent}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">Top Level</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={cat.status === '1' ? 'default' : 'secondary'}>
                                                        {cat.status === '1' ? 'Aktif' : 'Non-aktif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleOpenEdit(cat)}
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setDeletingId(cat.id);
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

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
                        <DialogDescription>
                            Lengkapi informasi kategori di bawah ini.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Kategori</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Contoh: Elektronik"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="image">Gambar Kategori</Label>
                            <div className="flex items-center gap-4">
                                {formData.image && (
                                    <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="image-file"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                    {isUploading && <p className="text-xs text-muted-foreground mt-1">Mengunggah...</p>}
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground">URL: {formData.image || '-'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="parent">Parent Kategori</Label>
                                <Select
                                    value={formData.category_parent}
                                    onValueChange={(val) => setFormData({ ...formData, category_parent: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Parent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tanpa Parent (Top Level)</SelectItem>
                                        {categories
                                            .filter(c => c.id !== editingCategory?.id)
                                            .map(c => (
                                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="grand_parent">Grand Parent</Label>
                                <Select
                                    value={formData.category_grand_parent}
                                    onValueChange={(val) => setFormData({ ...formData, category_grand_parent: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Grand Parent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tanpa Grand Parent</SelectItem>
                                        {categories
                                            .filter(c => c.id !== editingCategory?.id)
                                            .map(c => (
                                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData({ ...formData, status: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Aktif</SelectItem>
                                    <SelectItem value="0">Non-aktif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {editingCategory ? 'Update' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.
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
