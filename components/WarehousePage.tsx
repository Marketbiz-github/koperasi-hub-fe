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
import { Loader2, Plus, Edit, Trash2, Search, MapPin, Mail, Warehouse } from 'lucide-react';
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
import { useAuthStore } from '@/store/authStore';
import { apiRequest, shippingService } from '@/services/apiService';
import { getAccessToken } from '@/utils/auth';
import { useDebounce } from '@/hooks/useDebounce';

interface WarehouseData {
    id: number;
    id_store: number;
    email: string;
    nama_gudang: string;
    alamat: string;
    area_id: string;
    province_id: string;
    province: string;
    city_id: string;
    city: string;
    district_id: string;
    district: string;
    subdistrict_id: string;
    subdistrict: string;
    zipcode: string;
    latitude: number;
    longitude: number;
    id_wms: string;
    status: number;
    created_at?: string;
    updated_at?: string;
}

interface WarehousePageProps {
    title: string;
    description: string;
}

export default function WarehousePageShared({ title, description }: WarehousePageProps) {
    const { user, isHydrated, hydrate } = useAuthStore();
    const [store, setStore] = useState<any>(null);
    const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStoreLoading, setIsStoreLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<WarehouseData | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Location selector states
    const [areaSearchInput, setAreaSearchInput] = useState('');
    const debouncedAreaSearch = useDebounce(areaSearchInput, 500);
    const [areaResults, setAreaResults] = useState<any[]>([]);
    const [isSearchingArea, setIsSearchingArea] = useState(false);
    const [showAreaResults, setShowAreaResults] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        nama_gudang: '',
        email: '',
        alamat: '',
        province: '',
        province_id: '',
        city: '',
        city_id: '',
        district: '',
        district_id: '',
        subdistrict: '',
        subdistrict_id: '',
        zipcode: '',
        area_id: '',
        latitude: 0,
        longitude: 0,
        id_wms: '',
        status: 1,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [limit] = useState(10);
    const [warehouseProducts, setWarehouseProducts] = useState<any[]>([]);
    const [isProductsLoading, setIsProductsLoading] = useState(false);
    const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseData | null>(null);

    useEffect(() => {
        if (!isHydrated) {
            hydrate();
        }
    }, [isHydrated, hydrate]);

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
                toast.error('Gagal memuat informasi toko');
            } finally {
                setIsStoreLoading(false);
            }
        };

        if (isHydrated && user) {
            fetchStore();
        } else if (isHydrated && !user) {
            setIsStoreLoading(false);
        }
    }, [user, isHydrated]);

    const fetchWarehouses = useCallback(async (page: number = 1) => {
        if (!store) return;
        setIsLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                store_id: store.id.toString(),
            });
            const response = await fetch(`/api/gudang?${query.toString()}`);
            const result = await response.json();
            if (response.ok) {
                // New structure: result.data.warehouses and result.data.pagination
                const list = result.data?.warehouses || [];
                const pagin = result.data?.pagination || null;
                setWarehouses(list);
                setPagination(pagin);
                setCurrentPage(page);
            } else {
                toast.error(result.message || 'Gagal mengambil data gudang');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat memuat data');
        } finally {
            setIsLoading(false);
        }
    }, [store, limit, searchTerm]);

    // Initial and search fetch
    useEffect(() => {
        if (store) {
            const timer = setTimeout(() => {
                fetchWarehouses(1);
            }, 500); // 500ms debounce
            return () => clearTimeout(timer);
        }
    }, [store, searchTerm, fetchWarehouses]);

    const fetchWarehouseProducts = async (warehouseId: number) => {
        setIsProductsLoading(true);
        try {
            const response = await fetch(`/api/gudang/${warehouseId}`);
            const result = await response.json();
            if (response.ok) {
                // Assuming result.data.products contains the list of products
                setWarehouseProducts(result.data?.products || []);
            } else {
                toast.error(result.message || 'Gagal memuat produk gudang');
            }
        } catch (error) {
            toast.error('Gagal memuat detail produk');
        } finally {
            setIsProductsLoading(false);
        }
    };

    const handleViewDetail = (warehouse: WarehouseData) => {
        setSelectedWarehouse(warehouse);
        setIsViewDetailOpen(true);
        fetchWarehouseProducts(warehouse.id);
    };

    useEffect(() => {
        if (!isStoreLoading && store) {
            fetchWarehouses(1);
        } else if (!isStoreLoading && !store) {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStoreLoading, store]);

    useEffect(() => {
        const searchArea = async () => {
            if (debouncedAreaSearch.length < 3) {
                setAreaResults([]);
                setShowAreaResults(false);
                return;
            }

            setIsSearchingArea(true);
            try {
                const token = await getAccessToken();
                const res = await shippingService.searchArea(debouncedAreaSearch, token || undefined);
                if (res.data?.success && res.data.areas) {
                    setAreaResults(res.data.areas.map((area: any) => {
                        let postalCode = area.postal_code;
                        if (!postalCode || postalCode === 0) {
                            // Try to parse from name
                            const parts = area.name.split(' ');
                            const potentialZip = parts[parts.length - 1];
                            if (/^\d{5}$/.test(potentialZip)) {
                                postalCode = potentialZip;
                            }
                        }

                        return {
                            id: area.id,
                            name: area.name,
                            province: area.administrative_division_level_1_name,
                            city: area.administrative_division_level_2_name,
                            district: area.administrative_division_level_3_name,
                            subdistrict: area.name.split(',')[0],
                            postal_code: postalCode,
                        };
                    }));
                } else {
                    setAreaResults([]);
                }
            } catch (error) {
                console.error('Error searching area:', error);
            } finally {
                setIsSearchingArea(false);
            }
        };

        searchArea();
    }, [debouncedAreaSearch]);

    const handleSearchArea = (val: string) => {
        setAreaSearchInput(val);
        if (val.length >= 3) {
            setShowAreaResults(true);
        } else {
            setShowAreaResults(false);
        }
    };

    const handleSelectArea = (area: any) => {
        setFormData(prev => ({
            ...prev,
            province: area.province,
            province_id: area.province,
            city: area.city,
            city_id: area.city,
            district: area.district,
            district_id: area.district,
            subdistrict: area.subdistrict,
            subdistrict_id: area.id,
            zipcode: area.postal_code?.toString() || '',
            area_id: area.id,
        }));
        setAreaSearchInput(area.name);
        setShowAreaResults(false);
    };

    const handleOpenCreate = () => {
        setEditingWarehouse(null);
        setAreaSearchInput('');
        setAreaResults([]);
        setFormData({
            nama_gudang: '',
            email: '',
            alamat: '',
            province: '',
            province_id: '',
            city: '',
            city_id: '',
            district: '',
            district_id: '',
            subdistrict: '',
            subdistrict_id: '',
            zipcode: '',
            area_id: '',
            latitude: 0,
            longitude: 0,
            id_wms: '',
            status: 1,
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = async (warehouse: WarehouseData) => {
        setEditingWarehouse(warehouse);
        setFormData({
            nama_gudang: warehouse.nama_gudang,
            email: warehouse.email,
            alamat: warehouse.alamat,
            province: warehouse.province,
            province_id: warehouse.province_id,
            city: warehouse.city,
            city_id: warehouse.city_id,
            district: warehouse.district,
            district_id: warehouse.district_id,
            subdistrict: warehouse.subdistrict,
            subdistrict_id: warehouse.subdistrict_id,
            zipcode: warehouse.zipcode,
            area_id: warehouse.area_id,
            latitude: warehouse.latitude,
            longitude: warehouse.longitude,
            id_wms: warehouse.id_wms,
            status: warehouse.status,
        });
        setAreaSearchInput(`${warehouse.subdistrict}, ${warehouse.district}, ${warehouse.city}, ${warehouse.province}`);
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!store || !user) {
            toast.error('Informasi toko tidak ditemukan');
            return;
        }

        setIsSaving(true);

        const payload = {
            ...formData,
            id_store: store.id,
            zipcode: String(formData.zipcode || ''),
            area_id: String(formData.area_id || ''),
            province_id: String(formData.province_id || ''),
            city_id: String(formData.city_id || ''),
            district_id: String(formData.district_id || ''),
            subdistrict_id: String(formData.subdistrict_id || ''),
        };

        try {
            const url = editingWarehouse
                ? `/api/gudang/${editingWarehouse.id}`
                : '/api/gudang';
            const method = editingWarehouse ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(editingWarehouse ? 'Gudang diperbarui' : 'Gudang ditambahkan');
                setIsDialogOpen(false);
                fetchWarehouses();
            } else {
                toast.error(result.message || 'Gagal menyimpan gudang');
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
            const response = await fetch(`/api/gudang/${deletingId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Gudang dihapus');
                setIsDeleteDialogOpen(false);
                fetchWarehouses();
            } else {
                const result = await response.json();
                toast.error(result.message || 'Gagal menghapus gudang');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan sistem');
        } finally {
            setIsSaving(false);
            setDeletingId(null);
        }
    };

    const filteredWarehouses = warehouses.filter(w =>
        w.nama_gudang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isStoreLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
    }

    if (!store) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Warehouse className="h-16 w-16 text-muted-foreground/50" />
                <p className="text-xl font-semibold">Toko belum terdaftar</p>
                <p className="text-muted-foreground text-center max-w-md">Silakan selesaikan pendaftaran toko Anda terlebih dahulu untuk mengelola gudang.</p>
                <Button onClick={() => window.location.href = './store-settings'}>Ke Pengaturan Toko</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 px-4 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground">{description}</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Gudang
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <div className="relative w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama gudang..."
                                className="pl-9 pr-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full hover:bg-transparent"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
                                </Button>
                            )}
                        </div>
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
                                        <TableHead className="w-16">No</TableHead>
                                        <TableHead>Nama Gudang</TableHead>
                                        <TableHead>Email & WMS</TableHead>
                                        <TableHead>Lokasi</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredWarehouses.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                Tidak ada gudang ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredWarehouses.map((w, index) => (
                                            <TableRow key={w.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {(currentPage - 1) * limit + index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{w.nama_gudang}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Warehouse className="h-3 w-3" /> {w.id_wms || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Mail className="h-3 w-3 text-muted-foreground" /> {w.email || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm line-clamp-1 max-w-[250px]" title={w.alamat}>
                                                        <MapPin className="h-3 w-3 inline mr-1 text-red-500" />
                                                        {w.district}, {w.city}, {w.province}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{w.subdistrict} {w.zipcode}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={w.status === 1 ? 'default' : 'secondary'}>
                                                        {w.status === 1 ? 'Aktif' : 'Non-aktif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewDetail(w)}
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        >
                                                            Lihat Produk
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleOpenEdit(w)}
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setDeletingId(w.id);
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

                    {pagination && pagination.last_page > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan <span className="font-medium">{(currentPage - 1) * limit + 1}</span> - <span className="font-medium">{Math.min(currentPage * limit, pagination.total)}</span> dari <span className="font-medium">{pagination.total}</span> gudang
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchWarehouses(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Sebelumnya
                                </Button>
                                <div className="flex items-center gap-1">
                                    {[...Array(pagination.last_page)].map((_, i) => (
                                        <Button
                                            key={i + 1}
                                            variant={currentPage === i + 1 ? "default" : "outline"}
                                            size="sm"
                                            className="w-9"
                                            onClick={() => fetchWarehouses(i + 1)}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchWarehouses(currentPage + 1)}
                                    disabled={currentPage === pagination.last_page}
                                >
                                    Selanjutnya
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Product Details Dialog */}
            <Dialog open={isViewDetailOpen} onOpenChange={setIsViewDetailOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Detail Produk - {selectedWarehouse?.nama_gudang}</DialogTitle>
                        <DialogDescription>
                            Daftar produk yang tersimpan di gudang ini.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-4">
                        {isProductsLoading ? (
                            <div className="flex h-[200px] items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                            </div>
                        ) : warehouseProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                                <Search className="h-8 w-8 mb-2 opacity-20" />
                                <p>Tidak ada produk di gudang ini</p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Nama Produk</TableHead>
                                            <TableHead>Varian</TableHead>
                                            <TableHead className="text-right">Stok</TableHead>
                                            <TableHead className="text-right">Harga</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {warehouseProducts.map((p: any) => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium">{p.product?.name || 'Produk Tidak Terdefinisi'}</TableCell>
                                                <TableCell>{p.variant?.name || '-'}</TableCell>
                                                <TableCell className="text-right">{p.stock}</TableCell>
                                                <TableCell className="text-right font-mono text-sm text-green-600">
                                                    Rp {new Intl.NumberFormat('id-ID').format(p.price || 0)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setIsViewDetailOpen(false)}>Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingWarehouse ? 'Edit Gudang' : 'Tambah Gudang Baru'}</DialogTitle>
                        <DialogDescription>
                            Lengkapi informasi detail gudang di bawah ini.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nama_gudang">Nama Gudang</Label>
                                <Input
                                    id="nama_gudang"
                                    value={formData.nama_gudang}
                                    onChange={(e) => setFormData({ ...formData, nama_gudang: e.target.value })}
                                    placeholder="Contoh: Gudang Pusat"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Gudang</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="gudang@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="alamat">Alamat Lengkap</Label>
                            <Input
                                id="alamat"
                                value={formData.alamat}
                                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                placeholder="Jl. Raya No. 123"
                                required
                            />
                        </div>

                        <div className="grid gap-2 relative">
                            <Label htmlFor="area-search">Cari Area (Kecamatan, Kota, atau Provinsi)</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="area-search"
                                    placeholder="Masukkan minimal 3 karakter untuk mencari..."
                                    value={areaSearchInput}
                                    onChange={(e) => handleSearchArea(e.target.value)}
                                    className="pl-9"
                                    onFocus={() => areaSearchInput.length >= 3 && setShowAreaResults(true)}
                                />
                                {isSearchingArea && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            {showAreaResults && areaResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[200px] overflow-y-auto bg-white border rounded-md shadow-lg">
                                    {areaResults.map((area: any, index: number) => (
                                        <div
                                            key={`${area.id}-${index}`}
                                            className="px-4 py-2 hover:bg-muted cursor-pointer text-sm border-b last:border-0"
                                            onClick={() => handleSelectArea(area)}
                                        >
                                            <div className="font-medium">{area.name}</div>
                                            <div className="text-xs text-muted-foreground">{area.district}, {area.city}, {area.province}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {showAreaResults && areaResults.length === 0 && areaSearchInput.length >= 3 && !isSearchingArea && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 p-4 bg-white border rounded-md shadow-lg text-sm text-center text-muted-foreground">
                                    Area tidak ditemukan
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="id_wms">ID WMS (Opsional)</Label>
                                <Input
                                    id="id_wms"
                                    value={formData.id_wms}
                                    onChange={(e) => setFormData({ ...formData, id_wms: e.target.value })}
                                    placeholder="WMS-001"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="zipcode">Kode Pos</Label>
                                <Input
                                    id="zipcode"
                                    value={formData.zipcode}
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={String(formData.status)}
                                    onValueChange={(val) => setFormData({ ...formData, status: Number(val) })}
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
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {editingWarehouse ? 'Update' : 'Simpan'}
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
                            Apakah Anda yakin ingin menghapus gudang ini? Tindakan ini tidak dapat dibatalkan.
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
