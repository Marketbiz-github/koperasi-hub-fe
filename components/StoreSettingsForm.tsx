'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiRequest, shippingService } from '@/services/apiService';
import { getAccessToken } from '@/utils/auth';
import { useDebounce } from '@/hooks/useDebounce';
import { Loader2, Save, MapPin, Truck, Store, Upload, AlertTriangle, Palette, Phone, Search, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { validateImage } from '@/utils/image-validation';

interface Location {
    id: string | number;
    name: string;
    province?: string;
    city?: string;
    district?: string;
    area?: string;
    postal_code?: number;
}

interface Courier {
    id: string;
    name: string;
    image: string;
}

const AVAILABLE_COURIERS: Courier[] = [
    { id: 'lion', name: 'Lion Parcel', image: '/images/courier/LPA.png' },
    { id: 'sap', name: 'SAP Express', image: '/images/courier/SAP.png' },
    { id: 'pos', name: 'POS Indonesia', image: '/images/courier/POS.png' },
    { id: 'tiki', name: 'TIKI', image: '/images/courier/TIK.png' },
    { id: 'jne', name: 'JNE', image: '/images/courier/JNE.png' },
    { id: 'sicepat', name: 'SiCepat', image: '/images/courier/SCP.png' },
    { id: 'ninja', name: 'Ninja Xpress', image: '/images/courier/ninja.png' },
    { id: 'rpx', name: 'RPX', image: '/images/courier/rpx.png' },
    { id: 'wahana', name: 'Wahana', image: '/images/courier/WHN.png' },
    { id: 'jnt', name: 'J&T', image: '/images/courier/JNT.png' },
    { id: 'gojek', name: 'Gojek', image: '/images/courier/gosend.png' },
    { id: 'grab', name: 'Grab', image: '/images/courier/grab.png' },
    { id: 'idexpress', name: 'ID Express', image: '/images/courier/idexpress.png' },
    { id: 'ipaymu_cod', name: 'iPaymu COD', image: '/images/courier/ipaymu-cod.png' },
    { id: 'self_pickup', name: 'Self Pickup', image: '/images/courier/self-pickup.png' },
];

export default function StoreSettingsForm() {
    const { user, isHydrated, hydrate } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [store, setStore] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        slogan: '',
        description: '',
        alamat: '',
        province_id: '',
        city_id: '',
        district_id: '',
        area_id: '',
        zipcode: '',
        phone: '',
        status: '1',
        // ipaymu_va removed
        province: '',
        city: '',
        district: '',
        area: '',
        courier: [] as string[],
        color: '#10b981',
        fee_setting: 'merchant' as 'merchant' | 'customer',
        is_gratis_ongkir: '0',
        gratis_ongkir_unit: 'nominal' as 'nominal' | 'percent',
        gratis_ongkir_value: '',
        logo: '',
        cover: '',
    });

    const [areaSearchInput, setAreaSearchInput] = useState('');
    const debouncedAreaSearch = useDebounce(areaSearchInput, 500);
    const [areaResults, setAreaResults] = useState<Location[]>([]);
    const [isSearchingArea, setIsSearchingArea] = useState(false);
    const [showAreaResults, setShowAreaResults] = useState(false);

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
                    const data = res.data[0];
                    setStore(data);

                    setFormData({
                        name: data.name || '',
                        slogan: data.slogan || '',
                        description: data.description || '',
                        alamat: data.alamat || '',
                        province_id: data.province_id || '',
                        city_id: data.city_id || '',
                        district_id: data.district_id || '',
                        area_id: data.area_id || '',
                        zipcode: data.zipcode || '',
                        phone: data.phone || user.phone || '', // Fallback to user phone
                        status: data.status?.toString() || '1',
                        // ipaymu_va removed
                        province: data.province || '',
                        city: data.city || '',
                        district: data.district || '',
                        area: data.area || '',
                        courier: Array.isArray(data.courier) ? data.courier : (data.courier ? data.courier.split(',') : []),
                        color: data.color || '#10b981',
                        fee_setting: data.fee_setting || 'merchant',
                        is_gratis_ongkir: data.is_gratis_ongkir?.toString() || '0',
                        gratis_ongkir_unit: data.gratis_ongkir_unit || 'nominal',
                        gratis_ongkir_value: data.gratis_ongkir_value || '',
                        logo: data.logo || '',
                        cover: data.cover || '',
                    });

                    // Set initial area search input
                    if (data.area && data.district && data.city && data.province) {
                        setAreaSearchInput(`${data.area}, ${data.district}, ${data.city}, ${data.province}`);
                    } else if (data.province) {
                        setAreaSearchInput(data.province);
                    }
                }
            } catch (error) {
                console.error('Error fetching store:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        if (isHydrated && user) {
            fetchStore();
        } else if (isHydrated && !user) {
            setInitialLoading(false);
        }
    }, [user, isHydrated]);

    // Handlers
    const [uploadLoading, setUploadLoading] = useState<{ logo: boolean, cover: boolean }>({ logo: false, cover: false });

    useEffect(() => {
        const searchArea = async () => {
            if (debouncedAreaSearch.length < 3) {
                setAreaResults([]);
                setShowAreaResults(false);
                return;
            }

            setIsSearchingArea(true);
            setShowAreaResults(true);
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
                            area: area.name.split(',')[0],
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
            area: area.area,
            area_id: area.id,
            zipcode: area.postal_code?.toString() || '',
        }));
        setAreaSearchInput(area.name);
        setShowAreaResults(false);
    };

    const handleCourierToggle = (courierId: string) => {
        setFormData(prev => {
            const current = prev.courier;
            if (current.includes(courierId)) {
                return { ...prev, courier: current.filter(id => id !== courierId) };
            } else {
                return { ...prev, courier: [...current, courierId] };
            }
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
        const file = e.target.files?.[0];
        if (!file || !user || !store) return;

        const validation = validateImage(file);
        if (!validation.valid) {
            setMessage({ type: 'error', text: `${file.name}: ${validation.error}` });
            return;
        }

        setUploadLoading(prev => ({ ...prev, [type]: true }));

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('role', user.role);
            uploadFormData.append('userId', user.id.toString());
            uploadFormData.append('storeId', store.id.toString());
            uploadFormData.append('type', type);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
            });

            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, [type]: data.url }));
            } else {
                setMessage({ type: 'error', text: data.error || 'Gagal mengunggah gambar' });
            }
        } catch (error) {
            console.error('Upload catch error:', error);
            setMessage({ type: 'error', text: 'Gagal menghubungi server upload' });
        } finally {
            setUploadLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Strict Validation
        const requiredFields = [
            { key: 'name', label: 'Nama Toko' },
            { key: 'description', label: 'Deskripsi Toko' },
            // ipaymu_va removed
            { key: 'alamat', label: 'Alamat Lengkap' },
            { key: 'province_id', label: 'Provinsi' },
            { key: 'city_id', label: 'Kota' },
            { key: 'district_id', label: 'Kecamatan' },
            { key: 'area_id', label: 'Kelurahan' },
            { key: 'logo', label: 'Logo Toko' },
        ];

        const missing = requiredFields.filter(f => !formData[f.key as keyof typeof formData]);
        if (missing.length > 0) {
            setMessage({
                type: 'error',
                text: `Mohon lengkapi field wajib: ${missing.map(m => m.label).join(', ')}`
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (formData.courier.length === 0) {
            setMessage({ type: 'error', text: 'Pilih minimal satu kurir pengiriman.' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!store) return;
        setLoading(true);
        setMessage(null);

        try {
            const payload = {
                ...formData,
                zipcode: String(formData.zipcode || ''),
                courier: formData.courier, // Send as array
                is_gratis_ongkir: formData.is_gratis_ongkir,
            };

            const token = await getAccessToken();
            // Use store.id dynamically
            await apiRequest(`/stores/${store.id}`, {
                method: 'PUT',
                body: payload,
                token: token || undefined,
            });

            setMessage({ type: 'success', text: 'Data toko berhasil diperbarui!' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: error.message || 'Gagal menyimpan data toko.' });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
    }

    if (!user) {
        return <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Sesi Berakhir</h3>
            <p className="text-slate-500 mb-6">Silakan login kembali untuk mengakses pengaturan toko.</p>
            <button onClick={() => window.location.href = '/login'} className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium">Login Sekarang</button>
        </div>;
    }

    return (
        <div className="mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                    <Store className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Pengaturan Toko</h1>
                    <p className="text-slate-500">Kelola informasi toko, alamat, dan pengiriman.</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <Store className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Visual Settings: Logo & Cover */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-emerald-600" /> Logo & Cover Toko
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Logo Upload */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-700">Logo Toko <span className="text-red-500">*</span></label>
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative">
                                    {uploadLoading.logo ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                                    ) : formData.logo ? (
                                        <div className="w-full h-full relative">
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 text-white">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            {/* Render Image if it's a full URL or a relative path from the public folder */}
                                            {formData.logo.startsWith('http') || formData.logo.startsWith('/images/') ? (
                                                <Image src={formData.logo} alt="Logo" fill className="object-cover" />
                                            ) : (
                                                <div className="p-2 text-[10px] break-all text-center">{formData.logo}</div>
                                            )}
                                        </div>
                                    ) : (
                                        <Upload className="w-8 h-8 text-slate-400" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, 'logo')}
                                        disabled={uploadLoading.logo}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Format: PNG, JPG, WEBP, GIF (Maks. 1MB)</p>
                            </div>
                        </div>

                        {/* Cover Upload */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-700">Banner / Cover Toko</label>
                            <div className="relative group">
                                <div className="w-full h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative">
                                    {uploadLoading.cover ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                                    ) : formData.cover ? (
                                        <div className="w-full h-full relative">
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 text-white">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            {formData.cover.startsWith('http') || formData.cover.startsWith('/images/') ? (
                                                <Image src={formData.cover} alt="Cover" fill className="object-cover" />
                                            ) : (
                                                <div className="p-2 text-[10px] break-all text-center">{formData.cover}</div>
                                            )}
                                        </div>
                                    ) : (
                                        <Upload className="w-8 h-8 text-slate-400" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, 'cover')}
                                        disabled={uploadLoading.cover}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Rekomendasi ukuran: 1200x400 px</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Basic Info */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Store className="w-5 h-5 text-emerald-600" /> Informasi Dasar
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nama Toko <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Slogan</label>
                            <input
                                type="text"
                                value={formData.slogan}
                                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Telepon Toko <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-10 px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    placeholder="Contoh: 08123456789"
                                    required
                                />
                            </div>
                            {!formData.phone && user.phone && (
                                <p className="text-[10px] text-slate-500 mt-1 italic">Menggunakan nomor telepon profil: {user.phone}</p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi Toko <span className="text-red-500">*</span></label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                placeholder="Jelaskan tentang toko Anda..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Kiri */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Status Toko
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value })
                                    }
                                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                >
                                    <option value="1">Aktif</option>
                                    <option value="0">Non-Aktif</option>
                                </select>
                            </div>

                            {/* Kanan */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Warna Tema Toko
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) =>
                                            setFormData({ ...formData, color: e.target.value })
                                        }
                                        className="h-12 w-20 border border-slate-300 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.color}
                                        onChange={(e) =>
                                            setFormData({ ...formData, color: e.target.value })
                                        }
                                        className="flex-1 px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                        placeholder="#10b981"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Location */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-600" /> Lokasi & Alamat
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Alamat Lengkap <span className="text-red-500">*</span></label>
                            <textarea
                                value={formData.alamat}
                                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                placeholder="Nama jalan, nomor rumah, RT/RW..."
                                required
                            />
                        </div>

                        <div className="md:col-span-2 relative">
                            <Label htmlFor="area-search" className="block text-sm font-medium text-slate-700 mb-2">Cari Area (Kecamatan, Kota, atau Provinsi) <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    id="area-search"
                                    type="text"
                                    placeholder="Masukkan minimal 3 karakter untuk mencari..."
                                    value={areaSearchInput}
                                    onChange={(e) => handleSearchArea(e.target.value)}
                                    className="w-full pl-10 px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    onFocus={() => areaSearchInput.length >= 3 && setShowAreaResults(true)}
                                />
                                {isSearchingArea && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                                    </div>
                                )}
                            </div>

                            {showAreaResults && areaResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[200px] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg">
                                    {areaResults.map((area: any, index: number) => (
                                        <div
                                            key={`${area.id}-${index}`}
                                            className="px-4 py-3 hover:bg-emerald-50 cursor-pointer text-sm border-b border-slate-50 last:border-0"
                                            onClick={() => handleSelectArea(area)}
                                        >
                                            <div className="font-medium text-slate-800">{area.name}</div>
                                            <div className="text-xs text-slate-500">{area.district}, {area.city}, {area.province}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {showAreaResults && areaResults.length === 0 && areaSearchInput.length >= 3 && !isSearchingArea && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 p-4 bg-white border border-slate-200 rounded-xl shadow-lg text-sm text-center text-slate-500">
                                    Area tidak ditemukan
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Kode Pos</label>
                            <input
                                type="text"
                                value={formData.zipcode}
                                readOnly
                                className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-500 outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>
                </section>

                {/* Couriers */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-emerald-600" /> Kurir Pengiriman <span className="text-red-500">*</span>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {AVAILABLE_COURIERS.map((courier) => (
                            <div
                                key={courier.id}
                                onClick={() => handleCourierToggle(courier.id)}
                                className={`
                  cursor-pointer relative p-4 rounded-xl border transition-all hover:shadow-md
                  ${formData.courier.includes(courier.id)
                                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                                        : 'border-slate-200 bg-white hover:border-emerald-200'}
                `}
                            >
                                <div className="aspect-[3/2] relative mb-2 flex items-center justify-center">
                                    <Image
                                        src={courier.image}
                                        alt={courier.name}
                                        width={100}
                                        height={60}
                                        className="object-contain max-h-full"
                                        onError={(e) => {
                                            // Fallback for missing images
                                            (e.target as any).src = `https://ui-avatars.com/api/?name=${courier.name}&background=random`;
                                        }}
                                    />
                                </div>
                                <div className="text-center">
                                    <span className="text-[10px] font-medium text-slate-700">{courier.name}</span>
                                </div>
                                {formData.courier.includes(courier.id) && (
                                    <div className="absolute top-1 right-1">
                                        <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                            <Save className="w-2 h-2 text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Shipping Settings */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-emerald-600" /> Pengaturan Pengiriman
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Biaya Ongkir Ditanggung</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="fee_setting"
                                        value="merchant"
                                        checked={formData.fee_setting === 'merchant'}
                                        onChange={(e) => setFormData({ ...formData, fee_setting: e.target.value as 'merchant' | 'customer' })}
                                        className="w-4 h-4 text-emerald-600"
                                    />
                                    <span className="text-sm text-slate-700">Merchant</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="fee_setting"
                                        value="customer"
                                        checked={formData.fee_setting === 'customer'}
                                        onChange={(e) => setFormData({ ...formData, fee_setting: e.target.value as 'merchant' | 'customer' })}
                                        className="w-4 h-4 text-emerald-600"
                                    />
                                    <span className="text-sm text-slate-700">Customer</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 cursor-pointer mb-4">
                                <input
                                    type="checkbox"
                                    checked={formData.is_gratis_ongkir === '1'}
                                    onChange={(e) => setFormData({ ...formData, is_gratis_ongkir: e.target.checked ? '1' : '0' })}
                                    className="w-4 h-4 text-emerald-600 rounded"
                                />
                                <span className="text-sm font-medium text-slate-700">Gratis Ongkir</span>
                            </label>

                            {formData.is_gratis_ongkir === '1' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-emerald-100">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Tipe</label>
                                        <select
                                            value={formData.gratis_ongkir_unit}
                                            onChange={(e) => setFormData({ ...formData, gratis_ongkir_unit: e.target.value as 'nominal' | 'percent' })}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                        >
                                            <option value="nominal">Nominal (Rp)</option>
                                            <option value="percent">Persen (%)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Nilai</label>
                                        <input
                                            type="number"
                                            value={formData.gratis_ongkir_value}
                                            onChange={(e) => setFormData({ ...formData, gratis_ongkir_value: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            placeholder={formData.gratis_ongkir_unit === 'nominal' ? '50000' : '10'}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div >
    );
}
