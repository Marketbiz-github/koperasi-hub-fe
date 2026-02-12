'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Loader2,
    Plus,
    Trash2,
    Image as ImageIcon,
    Save,
    ArrowLeft,
    Package,
    Warehouse,
    Tags,
    Check,
    X as XIcon,
    Info
} from 'lucide-react';
import { toast } from 'sonner';
import {
    productService,
    productCategoryService,
    generalCategoryService,
    productOptionService,
    productOptionValueService,
    productVariantService,
    inventoryService,
    gudangService,
    apiRequest
} from '@/services/apiService';
import { getAccessToken } from '@/utils/auth';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';
import { validateImage } from '@/utils/image-validation';

interface ProductFormProps {
    rolePath: string;
    productId?: string | number;
    isDuplicate?: boolean;
}

interface ImageItem {
    id?: number;
    image_url: string;
    is_primary: boolean;
    display_order: number;
    file?: File;
}

interface VariantOption {
    id?: number;
    name: string;
    values: string[];
}

interface GeneratedVariant {
    id?: number;
    sku: string;
    price: string;
    discount_price: string;
    weight: string;
    optionValues: string[];
    gudang_id: string;
    stock: string;
    image: string;
    file?: File;
    previewUrl?: string;
    is_active: boolean;
}

export default function ProductForm({ rolePath, productId, isDuplicate = false }: ProductFormProps) {
    const router = useRouter();
    const { user, isHydrated, hydrate } = useAuthStore();
    const [store, setStore] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isStoreLoading, setIsStoreLoading] = useState(true);

    const [productCategories, setProductCategories] = useState<any[]>([]);
    const [generalCategories, setGeneralCategories] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        short_description: '',
        long_description: '',
        product_category_id: '',
        general_category_id: '',
        sku: '',
        price: '',
        discount_price: '',
        weight: '',
        length: '10',
        width: '10',
        height: '10',
        target_customer: rolePath === 'vendor' ? 'koperasi' : (rolePath === 'koperasi' ? 'koperasi' : 'customer'),
        status: 'active',
        is_gratis_ongkir: false, // Don't auto-check
        is_cashback: false,
        cashback_unit: 'fixed',
        cashback_value: '',
        dropshiper_unit: (rolePath === 'koperasi' || rolePath === 'reseller') ? 'fixed' : '',
        dropshiper_value: '',
    });

    const [images, setImages] = useState<ImageItem[]>([]);
    const [originalImages, setOriginalImages] = useState<ImageItem[]>([]);
    const [hasVariants, setHasVariants] = useState(false);
    const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
    const [generatedVariants, setGeneratedVariants] = useState<GeneratedVariant[]>([]);

    // Simple Product Stock/Warehouse
    const [simpleStock, setSimpleStock] = useState('0');
    const [simpleWarehouseId, setSimpleWarehouseId] = useState('');

    // Popup State
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editingVariantIdx, setEditingVariantIdx] = useState<number | null>(null);
    const [editingVariant, setEditingVariant] = useState<GeneratedVariant | null>(null);

    const openEditPopup = (index: number) => {
        setEditingVariantIdx(index);
        setEditingVariant({ ...generatedVariants[index] });
        setIsPopupOpen(true);
    };

    const savePopupEdit = () => {
        if (editingVariantIdx !== null && editingVariant) {
            const updated = [...generatedVariants];
            updated[editingVariantIdx] = editingVariant;
            setGeneratedVariants(updated);
            setIsPopupOpen(false);
            toast.success('Perubahan varian disimpan sementara. Klik Simpan Produk untuk mempermanenkan.');
        }
    };

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            if (!isHydrated || !user) return;
            try {
                const token = await getAccessToken();
                if (!token) return;

                // Fetch Store using correct endpoint
                const storeInfo = await apiRequest(`/stores/user/${user.id}`, { token });
                const currentStore = storeInfo.data?.[0];

                if (currentStore) {
                    setStore(currentStore);
                }

                // Fetch Categories and Warehouses
                const [pcRes, gcRes, whRes] = await Promise.all([
                    productCategoryService.getList(token),
                    generalCategoryService.getList(token),
                    gudangService.getList(token, { store_id: currentStore.id })
                ]);

                setProductCategories(pcRes.data?.data || pcRes.data || []);
                setGeneralCategories(gcRes.data?.data || gcRes.data || []);

                const warehousesArray = whRes.data?.warehouses || whRes.data || [];
                setWarehouses(Array.isArray(warehousesArray) ? warehousesArray : []);

                // If Editing or Duplicating, fetch product detail
                if (productId) {
                    const productRes = await productService.getProductDetail(productId, token);
                    const prod = productRes.data;

                    setFormData({
                        name: isDuplicate ? `${prod.name} (Copy)` : prod.name,
                        short_description: prod.short_description || '',
                        long_description: prod.long_description || '',
                        product_category_id: prod.product_category_id?.toString() || '',
                        general_category_id: prod.general_category_id?.toString() || '',
                        sku: isDuplicate ? '' : (prod.sku || ''),
                        price: prod.price?.toString() || '',
                        discount_price: prod.discount_price?.toString() || '',
                        weight: prod.weight?.toString() || '',
                        length: prod.length?.toString() || '10',
                        width: prod.width?.toString() || '10',
                        height: prod.height?.toString() || '10',
                        target_customer: prod.target_customer || 'customer',
                        status: prod.status || 'active',
                        is_gratis_ongkir: !!prod.is_gratis_ongkir,
                        is_cashback: !!prod.is_cashback,
                        cashback_unit: prod.cashback_unit || 'fixed',
                        cashback_value: prod.cashback_value?.toString() || '',
                        dropshiper_unit: prod.dropshiper_unit || 'fixed',
                        dropshiper_value: prod.dropshiper_value?.toString() || '',
                    });

                    if (prod.images) {
                        const mappedImages = prod.images.map((img: any) => ({
                            id: img.id,
                            image_url: img.image_url,
                            is_primary: img.is_primary,
                            display_order: img.display_order
                        }));
                        setImages(mappedImages);
                        setOriginalImages(mappedImages);
                    }

                    // Fetch Product Options and Variants
                    if (!isDuplicate) {
                        try {
                            const [optRes, varRes, stockRes] = await Promise.all([
                                productOptionService.getList(token, { product_id: productId }),
                                productVariantService.getList(token, productId),
                                inventoryService.getStockByProduct(token, productId)
                            ]);

                            const options = optRes.data || [];
                            const variants = varRes.data || [];
                            const stocks = stockRes.data || [];

                            if (options.length > 0) {
                                setHasVariants(true);

                                // Fetch all values for this store at once
                                const allValuesRes = await productOptionValueService.getList(token, { store_id: currentStore.id });
                                const allValues = allValuesRes.data || [];

                                const mappedOptions: VariantOption[] = options.map((opt: any) => {
                                    const optionValues = allValues.filter((v: any) => v.product_option_id === opt.id);
                                    return {
                                        id: opt.id,
                                        name: opt.name,
                                        values: optionValues.map((v: any) => v.value)
                                    };
                                });
                                setVariantOptions(mappedOptions);

                                // Map Variants
                                setGeneratedVariants(variants.map((v: any) => {
                                    const variantStock = stocks.find((s: any) => s.product_variant_id === v.id);
                                    return {
                                        id: v.id,
                                        sku: v.sku,
                                        price: v.price?.toString() || '0',
                                        discount_price: v.discount_price?.toString() || '',
                                        weight: v.weight?.toString() || '200',
                                        optionValues: (v.option_values || v.product_option_values || []).map((ov: any) => ov.value),
                                        gudang_id: variantStock?.gudang_id?.toString() || '',
                                        stock: variantStock?.stock?.toString() || '0',
                                        image: v.image || '',
                                        is_active: v.is_active !== false
                                    };
                                }));
                            } else if (stocks.length > 0) {
                                // Simple Product Stock
                                const mainStock = stocks[0];
                                setSimpleStock(mainStock.stock?.toString() || '0');
                                setSimpleWarehouseId(mainStock.gudang_id?.toString() || '');
                            }
                        } catch (err) {
                            console.error('Error fetching variant details:', err);
                        }
                    }
                }

            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Gagal memuat data pendukung');
            } finally {
                setIsLoading(false);
                setIsStoreLoading(false);
            }
        };

        if (isHydrated && user) fetchData();
    }, [user, isHydrated, productId, isDuplicate]);

    // Handle Image Selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const filesArray = Array.from(files);

        // Validate each file
        for (const file of filesArray) {
            const validation = validateImage(file);
            if (!validation.valid) {
                toast.error(`${file.name}: ${validation.error}`);
                return;
            }
        }

        const newImages = filesArray.map((file, index) => ({
            image_url: URL.createObjectURL(file),
            is_primary: images.length === 0 && index === 0,
            display_order: images.length + index + 1,
            file: file
        }));

        if (images.length + newImages.length > 4) {
            toast.error('Maksimal 4 gambar (3 reguler + 1 thumbnail)');
            return;
        }

        setImages([...images, ...newImages]);
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const setPrimaryImage = (index: number) => {
        setImages(images.map((img, i) => ({
            ...img,
            is_primary: i === index
        })));
    };

    // Variant Logic
    const addVariantOption = () => {
        if (variantOptions.length >= 2) {
            toast.error('Maksimal 2 jenis varian (misal: Ukuran & Warna)');
            return;
        }
        setVariantOptions([...variantOptions, { name: '', values: [] }]);
    };

    const removeVariantOption = (index: number) => {
        setVariantOptions(variantOptions.filter((_, i) => i !== index));
    };

    const updateOptionName = (index: number, name: string) => {
        const updated = [...variantOptions];
        updated[index].name = name;
        setVariantOptions(updated);
    };

    const addOptionValue = (index: number, value: string) => {
        if (!value.trim()) return;
        const updated = [...variantOptions];
        if (updated[index].values.includes(value)) return;
        updated[index].values.push(value);
        setVariantOptions(updated);
    };

    const removeOptionValue = (optIndex: number, valIndex: number) => {
        const updated = [...variantOptions];
        updated[optIndex].values = updated[optIndex].values.filter((_, i) => i !== valIndex);
        setVariantOptions(updated);
    };

    // Generate Variant Combinations
    useEffect(() => {
        if (!hasVariants || variantOptions.length === 0) {
            setGeneratedVariants([]);
            return;
        }

        const validOptions = variantOptions.filter(opt => opt.name && opt.values.length > 0);
        if (validOptions.length === 0) {
            setGeneratedVariants([]);
            return;
        }

        let combinations: string[][] = [[]];
        validOptions.forEach(opt => {
            const newCombinations: string[][] = [];
            combinations.forEach(combo => {
                opt.values.forEach(val => {
                    newCombinations.push([...combo, val]);
                });
            });
            combinations = newCombinations;
        });

        setGeneratedVariants(prev => {
            return combinations.map(combo => {
                // Match by sorted option values to handle order differences
                const existing = prev.find(v => {
                    if (v.optionValues.length !== combo.length) return false;
                    const sortedExisting = [...v.optionValues].sort();
                    const sortedCombo = [...combo].sort();
                    return JSON.stringify(sortedExisting) === JSON.stringify(sortedCombo);
                });
                if (existing) return existing;

                return {
                    sku: `${formData.sku}-${combo.join('-')}`.toUpperCase(),
                    price: formData.price || '0',
                    discount_price: '',
                    weight: formData.weight || '200',
                    optionValues: combo,
                    gudang_id: simpleWarehouseId,
                    stock: '0',
                    image: '', // Don't auto-fill from gallery
                    is_active: true
                };
            });
        });

    }, [hasVariants, variantOptions, formData.sku, formData.price, formData.weight, simpleWarehouseId, images]);

    const uploadImages = async () => {
        const uploaded: any[] = [];
        for (const img of images) {
            if (img.file) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', img.file);
                uploadFormData.append('role', rolePath);
                uploadFormData.append('userId', user?.id.toString() || '');
                uploadFormData.append('storeId', store?.id.toString() || '');
                uploadFormData.append('type', 'product');

                try {
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: uploadFormData
                    });
                    const data = await res.json();
                    if (data.success) {
                        uploaded.push({
                            image_url: data.url,
                            is_primary: img.is_primary,
                            display_order: img.display_order,
                            original_url: img.image_url
                        });
                    } else {
                        throw new Error(data.error || 'Upload failed');
                    }
                } catch (err) {
                    console.error('Image upload failed:', err);
                    throw err;
                }
            } else {
                uploaded.push({
                    image_url: img.image_url,
                    is_primary: img.is_primary,
                    display_order: img.display_order,
                    original_url: img.image_url
                });
            }
        }
        return uploaded;
    };

    const uploadVariantImages = async () => {
        const updatedVariants = [...generatedVariants];
        for (let i = 0; i < updatedVariants.length; i++) {
            const v = updatedVariants[i];
            if (v.file) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', v.file);
                uploadFormData.append('role', rolePath);
                uploadFormData.append('userId', user?.id.toString() || '');
                uploadFormData.append('storeId', store?.id.toString() || '');
                uploadFormData.append('type', 'variant');

                try {
                    const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
                    const data = await res.json();
                    if (data.success) {
                        updatedVariants[i].image = data.url;
                    }
                } catch (err) {
                    console.error('Variant image upload failed:', err);
                }
            }
        }
        setGeneratedVariants(updatedVariants);
        return updatedVariants;
    };

    const handleVariantImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateImage(file);
        if (!validation.valid) {
            toast.error(validation.error);
            return;
        }

        updateGeneratedVariant(index, 'file', file);
    };

    const updateGeneratedVariant = (index: number, field: keyof GeneratedVariant, value: any) => {
        const updated = [...generatedVariants];

        if (field === 'file') {
            const file = value as File;
            if (updated[index].previewUrl) {
                URL.revokeObjectURL(updated[index].previewUrl!);
            }
            updated[index].file = file;
            updated[index].previewUrl = URL.createObjectURL(file);
            updated[index].image = updated[index].previewUrl!;
        } else {
            (updated[index] as any)[field] = value;
        }

        setGeneratedVariants(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!store) {
            toast.error('Data toko tidak ditemukan');
            return;
        }

        if (images.length === 0) {
            toast.error('Minimal 1 gambar produk wajib ada');
            return;
        }

        if (!hasVariants && !simpleWarehouseId) {
            toast.error('Silakan pilih gudang untuk mengisi stok');
            return;
        }

        setIsSaving(true);
        try {
            const token = await getAccessToken();
            if (!token) throw new Error('No token');

            // 1. Upload Images First
            const uploadedImagesData = await uploadImages();
            const urlMap: Record<string, string> = {};
            uploadedImagesData.forEach((item: any) => {
                urlMap[item.original_url] = item.image_url;
            });

            // Map to final images payload (remove original_url and set is_primary)
            const uploadedImagesUrls = uploadedImagesData.map((img: any) => ({
                image_url: img.image_url,
                is_primary: img.display_order === 1,
                display_order: img.display_order
            }));

            const isEdit = productId && !isDuplicate;

            // Optimization: Only send images if changed
            const imagesChanged = isEdit ? JSON.stringify(images.map(i => ({ url: i.image_url, p: i.is_primary }))) !== JSON.stringify(originalImages.map(i => ({ url: i.image_url, p: i.is_primary }))) : true;

            const productPayload: any = {
                ...formData,
                store_id: store.id,
                product_category_id: Number(formData.product_category_id),
                general_category_id: formData.general_category_id ? Number(formData.general_category_id) : undefined,
                sku: formData.sku, // Don't force SKU
                price: formData.price ? String(formData.price) : undefined, // Don't force Price
                discount_price: String(formData.discount_price),
                weight: String(formData.weight),
                length: String(formData.length),
                width: String(formData.width),
                height: String(formData.height),
                is_gratis_ongkir: formData.is_gratis_ongkir,
                is_cashback: formData.is_cashback,
                cashback_unit: formData.cashback_unit,
                cashback_value: String(formData.cashback_value),
                dropshiper_unit: (rolePath === 'koperasi' || rolePath === 'reseller') ? formData.dropshiper_unit : null,
                dropshiper_value: (rolePath === 'koperasi' || rolePath === 'reseller') ? String(formData.dropshiper_value) : null,
            };

            if (imagesChanged) {
                productPayload.images = uploadedImagesUrls;
            }

            let currentProductId = productId;

            if (isEdit) {
                await productService.updateProduct(productId, productPayload, token);
            } else {
                const productRes = await productService.createProduct(productPayload, token);
                currentProductId = productRes.data.id;
            }

            if (hasVariants) {
                // 3. Validation: Check mandatory variant fields
                for (const v of generatedVariants) {
                    if (!v.sku || !v.price || !v.stock || !v.image) {
                        toast.error(`Varian ${v.optionValues.join(' / ')} wajib mengisi SKU, Harga, Stok, dan Gambar`);
                        setIsSaving(false);
                        return;
                    }
                }

                // 4. Upload Variant Images first
                const finalVariants = await uploadVariantImages();

                // 5. Create/Update Options & Values and Map them
                const allValueMap: Record<string, number> = {};

                for (const opt of variantOptions) {
                    if (!opt.name || opt.values.length === 0) continue;

                    let optId = opt.id;
                    if (!optId) {
                        const optRes = await productOptionService.create(token, {
                            store_id: store.id,
                            product_id: Number(currentProductId),
                            name: opt.name
                        });
                        optId = optRes.data.id;
                    }

                    // Fetch current values for this option to avoid duplicates
                    const existingValsRes = await productOptionValueService.getList(token, { option_id: optId as number });
                    const existingVals = existingValsRes.data || [];

                    for (const val of opt.values) {
                        let valId = existingVals.find((ev: any) => ev.value === val)?.id;
                        if (!valId) {
                            const valRes = await productOptionValueService.create(token, {
                                store_id: store.id,
                                product_option_id: optId as number,
                                value: val
                            });
                            valId = valRes.data.id;
                        }
                        allValueMap[`${opt.name}:${val}`] = valId as number;
                    }
                }

                // 6. Create/Update Variants & Update Stock
                for (const variant of finalVariants) {
                    const valueIds = variant.optionValues.map((val, idx) => {
                        const optName = variantOptions[idx].name;
                        return allValueMap[`${optName}:${val}`];
                    }).filter((id): id is number => !!id);

                    let variantId = variant.id;
                    const variantData = {
                        store_id: store.id,
                        product_id: Number(currentProductId),
                        sku: variant.sku,
                        price: variant.price,
                        discount_price: variant.discount_price,
                        weight: Number(variant.weight),
                        image: variant.image,
                        is_active: variant.is_active,
                        option_value_ids: valueIds
                    };

                    if (variantId) {
                        await productVariantService.update(token, variantId as number, variantData);
                    } else {
                        const variantRes = await productVariantService.create(token, variantData);
                        variantId = variantRes.data.id;
                    }

                    // Update Stock for this variant
                    if (variant.gudang_id && variant.stock !== undefined && variant.stock !== '') {
                        // Fix: Ensure stock is sent as number, and check if 0 is the issue
                        const stockValue = Number(variant.stock);
                        await inventoryService.updateStock(token, {
                            product_id: Number(currentProductId),
                            product_variant_id: variantId as number,
                            gudang_id: Number(variant.gudang_id),
                            stock: stockValue
                        });
                    }
                }

                toast.success(isEdit ? 'Produk berhasil diperbarui!' : 'Produk dan varian berhasil dibuat!');
            } else {
                // Simple Product Stock
                await inventoryService.updateStock(token, {
                    product_id: Number(currentProductId),
                    gudang_id: Number(simpleWarehouseId),
                    stock: Number(simpleStock)
                });
                toast.success(isEdit ? 'Produk berhasil diperbarui!' : 'Produk berhasil dibuat!');
            }

            router.push(`/dashboard/${rolePath}/produk`);

        } catch (error: any) {
            console.error('Error saving product:', error);
            toast.error(error.message || 'Gagal menyimpan produk');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 px-4 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {productId ? (isDuplicate ? 'Duplikat Produk' : 'Edit Produk') : 'Tambah Produk Baru'}
                        </h1>
                        <p className="text-muted-foreground">Lengkapi detail informasi produk Anda.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Simpan Produk
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Basic Info & Images */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-emerald-600" /> Informasi Utama
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Produk <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    placeholder="Contoh: iPhone 14 Pro"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Kategori Utama <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={formData.product_category_id}
                                        onValueChange={val => setFormData({ ...formData, product_category_id: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {productCategories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="general_category">Kategori Umum</Label>
                                    <Select
                                        value={formData.general_category_id}
                                        onValueChange={val => setFormData({ ...formData, general_category_id: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Kategori Umum" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {generalCategories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU <span className="text-red-500">*</span></Label>
                                <Input
                                    id="sku"
                                    placeholder="Contoh: IPH14-PRO-256"
                                    value={formData.sku}
                                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Harga (Rp) <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="0"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discount_price">Harga Diskon (Rp)</Label>
                                    <Input
                                        id="discount_price"
                                        type="number"
                                        placeholder="0"
                                        value={formData.discount_price}
                                        onChange={e => setFormData({ ...formData, discount_price: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="short_description">Deskripsi Singkat</Label>
                                <Textarea
                                    id="short_description"
                                    placeholder="Penjelasan singkat tentang produk..."
                                    value={formData.short_description}
                                    onChange={e => setFormData({ ...formData, short_description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="long_description">Deskripsi Lengkap</Label>
                                <Textarea
                                    id="long_description"
                                    placeholder="Detail spesifikasi, keunggulan, dll..."
                                    rows={12}
                                    value={formData.long_description}
                                    onChange={e => setFormData({ ...formData, long_description: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-emerald-600" /> Galeri Produk
                            </CardTitle>
                            <CardDescription>Maksimal 4 gambar (3 reguler + 1 thumbnail utama)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((img, index) => (
                                    <div key={index} className={`relative aspect-square rounded-xl border-2 overflow-hidden group ${img.is_primary ? 'border-emerald-500' : 'border-slate-200'}`}>
                                        <img src={img.image_url} alt="product" className="object-cover w-full h-full" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            {!img.is_primary && (
                                                <Button type="button" size="sm" variant="secondary" className="h-7 text-[10px]" onClick={() => setPrimaryImage(index)}>
                                                    Set Thumbnail
                                                </Button>
                                            )}
                                            <Button type="button" size="icon" variant="destructive" className="h-8 w-8" onClick={() => removeImage(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {img.is_primary && (
                                            <div className="absolute top-1 left-1">
                                                <Badge className="bg-emerald-500 text-[10px] h-5">Utama</Badge>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {images.length < 4 && (
                                    <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-all">
                                        <Plus className="h-8 w-8 text-slate-400" />
                                        <span className="text-xs text-slate-500 mt-2 font-medium">Tambah Foto</span>
                                        <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                                    </label>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Tags className="h-5 w-5 text-emerald-600" /> Varian Produk
                                </CardTitle>
                                <CardDescription>Gunakan jika produk memiliki pilihan warna, ukuran, dll.</CardDescription>
                            </div>
                            <Switch checked={hasVariants} onCheckedChange={setHasVariants} />
                        </CardHeader>
                        {hasVariants && (
                            <CardContent className="space-y-6">
                                {variantOptions.map((opt, optIndex) => (
                                    <div key={optIndex} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                                        <div className="flex items-end gap-4">
                                            <div className="flex-1 space-y-2">
                                                <Label>Nama Varian (Misal: Warna)</Label>
                                                <Input
                                                    placeholder="Misal: Warna, Ukuran, dll"
                                                    value={opt.name}
                                                    onChange={e => updateOptionName(optIndex, e.target.value)}
                                                />
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeVariantOption(optIndex)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Pilihan Varian</Label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {opt.values.map((val, valIndex) => (
                                                    <Badge key={valIndex} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                                                        {val}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-4 w-4 hover:bg-transparent"
                                                            onClick={() => removeOptionValue(optIndex, valIndex)}
                                                        >
                                                            <XIcon className="h-3 w-3" />
                                                        </Button>
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Ketik nilai lalu tekan Enter (Misal: Merah, Biru)"
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const val = e.currentTarget.value.trim();
                                                            if (val && !opt.values.includes(val)) {
                                                                addOptionValue(optIndex, val);
                                                                e.currentTarget.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" className="w-full border-dashed" onClick={addVariantOption}>
                                    <Plus className="mr-2 h-4 w-4" /> Tambah Varian Baru
                                </Button>

                                {generatedVariants.length > 0 && (
                                    <div className="mt-8 space-y-6">
                                        {/* Existing Variants Table (UPDATE) */}
                                        {generatedVariants.filter(gv => gv.id).length > 0 && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-emerald-700 font-bold">Varian Produk</Label>
                                                    <p className="text-[10px] text-muted-foreground italic">* Klik Edit untuk mengubah data varian</p>
                                                </div>
                                                <div className="rounded-xl border border-emerald-200 overflow-x-auto">
                                                    <table className="w-full text-sm min-w-[600px]">
                                                        <thead className="bg-emerald-50">
                                                            <tr className="border-b bg-emerald-50">
                                                                <th className="px-4 py-3 font-semibold text-emerald-700">No</th>
                                                                <th className="px-4 py-3 font-semibold text-emerald-700">Gambar</th>
                                                                <th className="px-4 py-3 font-semibold text-emerald-700">Varian</th>
                                                                <th className="px-4 py-3 font-semibold text-emerald-700">SKU</th>
                                                                <th className="px-4 py-3 font-semibold text-emerald-700">Harga</th>
                                                                <th className="px-4 py-3 font-semibold text-emerald-700">Stok</th>
                                                                <th className="px-4 py-3 font-semibold text-emerald-700 w-24 text-center">Aksi</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-emerald-100">
                                                            {generatedVariants.filter(gv => gv.id).map((gv, idx) => {
                                                                const actualIdx = generatedVariants.findIndex(v => v === gv);
                                                                return (
                                                                    <tr key={actualIdx} className="hover:bg-emerald-50/30">
                                                                        <td className="px-4 py-3 font-medium">{actualIdx + 1}</td>
                                                                        <td className="px-4 py-3 font-medium">
                                                                            <div className="w-12 h-12 relative bg-slate-100 rounded border border-slate-200 flex items-center justify-center overflow-hidden">
                                                                                {gv.image ? (
                                                                                    <img
                                                                                        src={gv.image}
                                                                                        alt={gv.optionValues.join(' / ')}
                                                                                        className="w-full h-full object-cover"
                                                                                    />
                                                                                ) : (
                                                                                    <ImageIcon className="w-5 h-5 text-slate-300" />
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-3 font-medium">{gv.optionValues.join(' / ')}</td>
                                                                        <td className="px-4 py-3 font-mono text-xs">{gv.sku}</td>
                                                                        <td className="px-4 py-3">Rp {Number(gv.price).toLocaleString()}</td>
                                                                        <td className="px-4 py-3">{gv.stock}</td>
                                                                        <td className="px-4 py-3 text-center">
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-7 text-[10px] border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                                                onClick={() => openEditPopup(actualIdx)}
                                                                            >
                                                                                Edit
                                                                            </Button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* New Variants Table (CREATE) */}
                                        {generatedVariants.filter(gv => !gv.id).length > 0 && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-blue-700 font-bold">Varian Baru</Label>
                                                    <p className="text-[10px] text-muted-foreground italic">* Isi data langsung di tabel ini</p>
                                                </div>
                                                <div className="rounded-xl border border-blue-200 overflow-x-auto">
                                                    <table className="w-full text-sm min-w-[900px]">
                                                        <thead className="bg-blue-50">
                                                            <tr className="border-b bg-blue-50">
                                                                <th className="px-4 py-2 text-[10px] font-semibold text-blue-700">Varian</th>
                                                                <th className="px-4 py-2 text-[10px] font-semibold text-blue-700">SKU</th>
                                                                <th className="px-4 py-2 text-[10px] font-semibold text-blue-700 w-28">Harga (Rp)</th>
                                                                <th className="px-4 py-2 text-[10px] font-semibold text-blue-700 w-28">H. Diskon</th>
                                                                <th className="px-4 py-2 text-[10px] font-semibold text-blue-700 w-20">Stok</th>
                                                                <th className="px-4 py-2 text-[10px] font-semibold text-blue-700 w-24">Gudang</th>
                                                                <th className="px-4 py-2 text-[10px] font-semibold text-blue-700 w-16 text-center">Img</th>
                                                                <th className="px-4 py-2 text-[10px] font-semibold text-blue-700 w-12 text-center">Aktif</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-blue-100">
                                                            {generatedVariants.filter(gv => !gv.id).map((gv, idx) => {
                                                                const actualIdx = generatedVariants.findIndex(v => v === gv);
                                                                return (
                                                                    <tr key={actualIdx} className="hover:bg-blue-50/30">
                                                                        <td className="px-4 py-3 font-medium">{gv.optionValues.join(' / ')}</td>
                                                                        <td className="px-4 py-3">
                                                                            <Input
                                                                                className="h-8 text-xs font-mono"
                                                                                value={gv.sku}
                                                                                onChange={e => updateGeneratedVariant(actualIdx, 'sku', e.target.value)}
                                                                            />
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <Input
                                                                                className="h-8 text-xs"
                                                                                type="number"
                                                                                value={gv.price}
                                                                                onChange={e => updateGeneratedVariant(actualIdx, 'price', e.target.value)}
                                                                            />
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <Input
                                                                                className="h-8 text-xs"
                                                                                type="number"
                                                                                value={gv.discount_price}
                                                                                onChange={e => updateGeneratedVariant(actualIdx, 'discount_price', e.target.value)}
                                                                            />
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <Input
                                                                                className="h-8 text-xs"
                                                                                type="number"
                                                                                value={gv.stock}
                                                                                onChange={e => updateGeneratedVariant(actualIdx, 'stock', e.target.value)}
                                                                            />
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <Select
                                                                                value={gv.gudang_id}
                                                                                onValueChange={val => updateGeneratedVariant(actualIdx, 'gudang_id', val)}
                                                                            >
                                                                                <SelectTrigger className="h-8 text-[10px]">
                                                                                    <SelectValue placeholder="Gudang" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {warehouses.map(wh => (
                                                                                        <SelectItem key={wh.id} value={wh.id.toString()}>{wh.nama_gudang || wh.name}</SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <div className="flex flex-col items-center gap-1">
                                                                                <div
                                                                                    className="w-12 h-12 relative bg-slate-100 rounded border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                                                                                    onClick={() => document.getElementById(`v-file-${actualIdx}`)?.click()}
                                                                                >
                                                                                    {gv.image ? (
                                                                                        <img src={gv.image} alt="v" className="w-full h-full object-cover rounded" />
                                                                                    ) : (
                                                                                        <ImageIcon className="w-4 h-4 text-slate-300" />
                                                                                    )}
                                                                                    <input
                                                                                        id={`v-file-${actualIdx}`}
                                                                                        type="file"
                                                                                        accept="image/*"
                                                                                        className="hidden"
                                                                                        onChange={e => handleVariantImageChange(actualIdx, e)}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-center">
                                                                            <Switch
                                                                                checked={gv.is_active}
                                                                                onCheckedChange={val => updateGeneratedVariant(actualIdx, 'is_active', val)}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        )}
                    </Card>
                </div>

                {/* Right Column: Pricing, Inventory, Settings */}
                <div className="space-y-6">
                    {!hasVariants && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Warehouse className="h-5 w-5 text-emerald-600" /> Stok
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gudang">Pilih Gudang <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={simpleWarehouseId}
                                        onValueChange={setSimpleWarehouseId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Gudang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map(wh => (
                                                <SelectItem key={wh.id} value={wh.id.toString()}>{wh.nama_gudang || wh.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground italic">Wajib ada gudang dahulu sebelum isi stok.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="simple_stock">Jumlah Stok</Label>
                                    <Input
                                        id="simple_stock"
                                        type="number"
                                        value={simpleStock}
                                        onChange={e => setSimpleStock(e.target.value)}
                                        disabled={!simpleWarehouseId}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-emerald-600" /> Pengiriman & Target
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="weight">Berat (gram) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    placeholder="0"
                                    value={formData.weight}
                                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-[10px]">P (cm)</Label>
                                    <Input className="h-8" type="number" value={formData.length} onChange={e => setFormData({ ...formData, length: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">L (cm)</Label>
                                    <Input className="h-8" type="number" value={formData.width} onChange={e => setFormData({ ...formData, width: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">T (cm)</Label>
                                    <Input className="h-8" type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Target Pembeli</Label>
                                <Select
                                    value={formData.target_customer}
                                    onValueChange={val => setFormData({ ...formData, target_customer: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Target" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(rolePath === 'koperasi' || rolePath === 'reseller') && <SelectItem value="customer">End Customer</SelectItem>}
                                        {rolePath === 'koperasi' && <SelectItem value="reseller">Reseller</SelectItem>}
                                        {(rolePath === 'vendor' || rolePath === 'koperasi') && <SelectItem value="koperasi">Koperasi</SelectItem>}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground">Tentukan siapa yang dapat melihat dan membeli produk ini.</p>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                                <div className="space-y-0.5">
                                    <Label>Gratis Ongkir</Label>
                                    <p className="text-[10px] text-muted-foreground">Aktifkan subsidi ongkir.</p>
                                </div>
                                <Switch
                                    checked={formData.is_gratis_ongkir}
                                    onCheckedChange={val => setFormData({ ...formData, is_gratis_ongkir: val })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tags className="h-5 w-5 text-emerald-600" /> Marketing & Komisi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                                <div className="space-y-0.5">
                                    <Label>Cashback</Label>
                                    <p className="text-[10px] text-muted-foreground">Aktifkan fitur cashback.</p>
                                </div>
                                <Switch
                                    checked={formData.is_cashback}
                                    onCheckedChange={val => setFormData({ ...formData, is_cashback: val })}
                                />
                            </div>

                            {formData.is_cashback && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Tipe</Label>
                                        <Select value={formData.cashback_unit} onValueChange={val => setFormData({ ...formData, cashback_unit: val })}>
                                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                                                <SelectItem value="percentage">Persen (%)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Nilai</Label>
                                        <Input className="h-8" type="number" value={formData.cashback_value} onChange={e => setFormData({ ...formData, cashback_value: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            {(rolePath === 'koperasi' || rolePath === 'reseller') && (
                                <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-3">
                                    <Label className="text-emerald-800 font-semibold">Komisi Dropshipper <span className="text-red-500">*</span></Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-[10px]">Tipe</Label>
                                            <Select value={formData.dropshiper_unit} onValueChange={val => setFormData({ ...formData, dropshiper_unit: val })}>
                                                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                                                    <SelectItem value="percentage">Persen (%)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px]">Nilai</Label>
                                            <Input className="h-8" type="number" required value={formData.dropshiper_value} onChange={e => setFormData({ ...formData, dropshiper_value: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div >
            </div >

            {/* Variant Edit Popup */}
            <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Varian: {editingVariant?.optionValues.join(' / ')}</DialogTitle>
                    </DialogHeader>
                    {editingVariant && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="v-sku" className="text-right text-xs">SKU</Label>
                                <Input
                                    id="v-sku"
                                    className="col-span-3 h-8 text-xs font-mono"
                                    value={editingVariant.sku}
                                    onChange={e => setEditingVariant({ ...editingVariant, sku: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="v-price" className="text-right text-xs">Harga (Rp)</Label>
                                <Input
                                    id="v-price"
                                    type="number"
                                    className="col-span-3 h-8 text-xs"
                                    value={editingVariant.price}
                                    onChange={e => setEditingVariant({ ...editingVariant, price: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="v-discount" className="text-right text-xs">H. Diskon</Label>
                                <Input
                                    id="v-discount"
                                    type="number"
                                    className="col-span-3 h-8 text-xs"
                                    value={editingVariant.discount_price}
                                    onChange={e => setEditingVariant({ ...editingVariant, discount_price: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="v-stock" className="text-right text-xs">Stok</Label>
                                <Input
                                    id="v-stock"
                                    type="number"
                                    className="col-span-3 h-8 text-xs"
                                    value={editingVariant.stock}
                                    onChange={e => setEditingVariant({ ...editingVariant, stock: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="v-gudang" className="text-right text-xs">Gudang</Label>
                                <div className="col-span-3">
                                    <Select
                                        value={editingVariant.gudang_id}
                                        onValueChange={val => setEditingVariant({ ...editingVariant, gudang_id: val })}
                                    >
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Pilih Gudang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map(wh => (
                                                <SelectItem key={wh.id} value={wh.id.toString()}>{wh.nama_gudang || wh.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-xs">Gambar</Label>
                                <div className="col-span-3 flex items-center gap-3">
                                    <div
                                        className="w-16 h-16 relative bg-slate-100 rounded border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-emerald-400 transition-colors"
                                        onClick={() => document.getElementById('v-popup-file')?.click()}
                                    >
                                        {editingVariant.image ? (
                                            <img src={editingVariant.image} alt="v" className="w-full h-full object-cover rounded" />
                                        ) : (
                                            <ImageIcon className="w-5 h-5 text-slate-300" />
                                        )}
                                        <input
                                            id="v-popup-file"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const url = URL.createObjectURL(file);
                                                    setEditingVariant({ ...editingVariant, file: file, image: url, previewUrl: url });
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground flex-1 italic">Klik gambar untuk mengubah foto varian.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsPopupOpen(false)}>Batal</Button>
                        <Button type="button" className="bg-emerald-600 hover:bg-emerald-700" onClick={savePopupEdit}>Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </form>
    );
}

// Helper X Icon as it might be missing in some setups
function X({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    )
}
