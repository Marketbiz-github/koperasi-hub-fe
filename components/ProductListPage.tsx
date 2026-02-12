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
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit, Trash2, Search, Package, Filter, X, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { apiRequest, productService } from '@/services/apiService';
import { getAccessToken } from '@/utils/auth';
import Image from 'next/image';

interface Product {
    id: number;
    name: string;
    sku: string;
    price: string | number;
    status: string;
    images?: { image_url: string; is_primary: boolean }[];
    product_category?: { name: string };
    total_stock?: number;
}

interface ProductListPageProps {
    title: string;
    description: string;
    rolePath: string; // e.g., 'vendor', 'koperasi', 'reseller'
}

export default function ProductListPage({ title, description, rolePath }: ProductListPageProps) {
    const { user, isHydrated, hydrate } = useAuthStore();
    const [store, setStore] = useState<any>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStoreLoading, setIsStoreLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

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

    // Fetch Categories for dropdown
    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch('/api/product-categories');
            const result = await response.json();
            if (response.ok) {
                setCategories(result.data?.data || result.data || []);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        if (!store?.id) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                store_id: store.id.toString(),
                page: currentPage.toString(),
                limit: limit.toString(),
            });

            if (searchTerm) params.append('name', searchTerm);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (categoryFilter !== 'all') params.append('product_category_id', categoryFilter);

            const response = await fetch(`/api/products?${params.toString()}`);
            const result = await response.json();

            if (response.ok) {
                setProducts(result.data?.data || []);
                setTotalPages(Math.ceil((result.data?.meta?.total || 0) / limit));
            } else {
                toast.error(result.message || 'Gagal mengambil data produk');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat memuat produk');
        } finally {
            setIsLoading(false);
        }
    }, [store, currentPage, searchTerm, statusFilter, categoryFilter]);

    useEffect(() => {
        if (!isStoreLoading && store) {
            fetchCategories();
            fetchProducts();
        } else if (!isStoreLoading && !store) {
            setIsLoading(false);
        }
    }, [isStoreLoading, store, fetchProducts, fetchCategories]);

    const handleDuplicate = async (productId: number) => {
        const confirmDuplicate = confirm('Apakah Anda yakin ingin menduplikasi produk ini?');
        if (!confirmDuplicate) return;

        try {
            const token = await getAccessToken();
            if (!token) return;
            await productService.duplicateProduct(productId, token);
            toast.success('Produk berhasil diduplikasi');
            fetchProducts();
        } catch (error) {
            toast.error('Gagal menduplikasi produk');
        }
    };

    const handleDelete = async (productId: number) => {
        const confirmDelete = confirm('Apakah Anda yakin ingin menghapus produk ini?');
        if (!confirmDelete) return;

        try {
            const token = await getAccessToken();
            if (!token) return;
            await productService.deleteProduct(productId, token);
            toast.success('Produk berhasil dihapus');
            fetchProducts();
        } catch (error) {
            toast.error('Gagal menghapus produk');
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchProducts();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setCurrentPage(1);
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    if (isStoreLoading) {
        return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
    }

    if (!store) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Package className="h-16 w-16 text-muted-foreground/20" />
                <p className="text-xl font-semibold">Toko belum aktif</p>
                <p className="text-muted-foreground text-center max-w-md">Silakan selesaikan pengaturan toko Anda untuk mulai mengelola produk.</p>
                <Button onClick={() => window.location.href = `/dashboard/${rolePath}/store-settings`}>Ke Pengaturan Toko</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 px-4 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground">{description}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => window.location.href = `/dashboard/${rolePath}/produk/tambah`} className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Produk
                    </Button>
                </div>
            </div>

            {/* PRODUCT TABLE */}
            <Card className="shadow-sm">
                <CardHeader>
                    <form onSubmit={handleSearch} className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama produk..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="inactive">Non-aktif</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={clearFilters} title="Reset Filter">
                                <X className="h-4 w-4 mr-2" /> Reset Filter
                            </Button>
                        </div>
                    </form>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-16">No</TableHead>
                                        <TableHead>Produk</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Stok</TableHead>
                                        <TableHead>Harga</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                                Belum ada produk yang ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        products.map((product, index) => {
                                            const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url;
                                            return (
                                                <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
                                                    <TableCell className="text-muted-foreground font-medium">{(currentPage - 1) * limit + index + 1}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative h-12 w-12 rounded-lg bg-muted border overflow-hidden flex-shrink-0">
                                                                {primaryImage ? (
                                                                    <img src={primaryImage} alt={product.name} className="object-cover w-full h-full" />
                                                                ) : (
                                                                    <Package className="h-6 w-6 text-muted-foreground/30 absolute m-auto inset-0" />
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold line-clamp-1">{product.name}</span>
                                                                <span className="text-[10px] text-muted-foreground uppercase font-mono">{product.sku || 'No SKU'}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-normal">
                                                            {product.product_category?.name || 'Tanpa Kategori'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`font-medium ${Number(product.total_stock) < 5 ? 'text-red-500' : ''}`}>
                                                            {product.total_stock ?? 0}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-emerald-700">
                                                        {formatCurrency(product.price)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className={product.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                                                            {product.status === 'active' ? 'Aktif' : 'Non-aktif'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                                                title="Edit"
                                                                onClick={() => window.location.href = `/dashboard/${rolePath}/produk/${product.id}`}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                                                title="Duplikat"
                                                                onClick={() => handleDuplicate(product.id)}
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 hover:bg-red-50"
                                                                title="Hapus"
                                                                onClick={() => handleDelete(product.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* PAGINATION */}
                    {!isLoading && totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-muted-foreground">Halaman {currentPage} dari {totalPages}</p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    Sebelumnya
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    Berikutnya
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
