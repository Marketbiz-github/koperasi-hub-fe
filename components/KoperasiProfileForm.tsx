'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { koperasiProfilingService } from '@/services/apiService';
import { getAccessToken } from '@/utils/auth';
import { validateImage } from '@/utils/image-validation';
import {
    Loader2,
    Save,
    FileText,
    Target,
    Compass,
    Users,
    Plus,
    Trash2,
    Building2,
    AlertTriangle,
    Check,
    Upload,
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Administrator {
    id?: number;
    name: string;
    phone: string;
    position: string;
    hierarchy_level: number;
}

export default function KoperasiProfileForm() {
    const { user, isHydrated } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [profileExists, setProfileExists] = useState(false);

    const [formData, setFormData] = useState({
        legality_number: '',
        legality_file_url: '',
        description: '',
        vision: '',
        mission: '',
        administrators: [] as Administrator[]
    });

    const [uploadLoading, setUploadLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!isHydrated || !user) return;
            try {
                const token = await getAccessToken();
                const res = await koperasiProfilingService.getProfile(token || undefined, user.id);
                if (res.data) {
                    const data = res.data;
                    setFormData({
                        legality_number: data.legality_number || '',
                        legality_file_url: data.legality_file_url || '',
                        description: data.description || '',
                        vision: data.vision || '',
                        mission: data.mission || '',
                        administrators: Array.isArray(data.administrators) ? data.administrators : []
                    });
                    setProfileExists(true);
                }
            } catch (error: any) {
                // 404 is expected if profile doesn't exist yet
                if (error.status !== 404) {
                    console.error('Error fetching profile:', error);
                }
            } finally {
                setInitialLoading(false);
            }
        };

        if (isHydrated && user) {
            fetchProfile();
        } else if (isHydrated && !user) {
            setInitialLoading(false);
        }
    }, [user, isHydrated]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const validation = validateImage(file);
        if (!validation.valid) {
            setMessage({ type: 'error', text: validation.error || 'Gagal validasi file' });
            return;
        }

        setUploadLoading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('role', 'koperasi');
            uploadFormData.append('userId', user.id.toString());
            uploadFormData.append('storeId', 'profile'); // dummy storeId for folder
            uploadFormData.append('type', 'legality');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
            });

            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, legality_file_url: data.url }));
                setMessage({ type: 'success', text: 'File legalitas berhasil diunggah' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Gagal mengunggah file' });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: 'Gagal menghubungi server upload' });
        } finally {
            setUploadLoading(false);
        }
    };

    const addAdministrator = () => {
        setFormData(prev => ({
            ...prev,
            administrators: [
                ...prev.administrators,
                { name: '', phone: '', position: '', hierarchy_level: prev.administrators.length + 1 }
            ]
        }));
    };

    const removeAdministrator = (index: number) => {
        setFormData(prev => ({
            ...prev,
            administrators: prev.administrators.filter((_, i) => i !== index)
        }));
    };

    const updateAdministrator = (index: number, field: keyof Administrator, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            administrators: prev.administrators.map((admin, i) =>
                i === index ? { ...admin, [field]: value } : admin
            )
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const token = await getAccessToken();
            if (!token) throw new Error('Sesi berakhir');

            if (profileExists) {
                await koperasiProfilingService.updateProfile(token, formData);
            } else {
                await koperasiProfilingService.createProfile(token, formData);
                setProfileExists(true);
            }

            setMessage({ type: 'success', text: 'Profil koperasi berhasil disimpan!' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: error.message || 'Gagal menyimpan profil' });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                    <Building2 className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Profil Institusi Koperasi</h1>
                    <p className="text-slate-500">Lengkapi data legalitas dan profil organisasi koperasi Anda.</p>
                </div>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl mb-6 flex items-center justify-between gap-3 ${message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-red-50 text-red-700 border border-red-100'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        <p className="font-medium text-sm">{message.text}</p>
                    </div>
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Legalitas */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" /> Legalitas Koperasi
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor SK / Legalitas <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.legality_number}
                                onChange={(e) => setFormData({ ...formData, legality_number: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                placeholder="Contoh: SK-12345/KOP/2026"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Dokumen SK (Scan/PDF) <span className="text-red-500">*</span></label>
                            <div className="flex items-center gap-3">
                                {formData.legality_file_url ? (
                                    <div className="flex-1 flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-600 truncate flex-1">
                                            {formData.legality_file_url.split('/').pop()}
                                        </span>
                                        <a
                                            href={formData.legality_file_url}
                                            target="_blank"
                                            className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                                            title="Buka File"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <label className="p-2 hover:bg-slate-200 rounded-lg text-emerald-600 cursor-pointer transition-colors" title="Ganti File">
                                            <Upload className="w-4 h-4" />
                                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,application/pdf" />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex-1 relative">
                                        <div className="w-full py-2.5 px-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 transition-all cursor-pointer">
                                            {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            <span className="text-xs font-bold uppercase tracking-wider">Unggah Dokumen</span>
                                        </div>
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleFileUpload}
                                            accept="image/*,application/pdf"
                                            required={!formData.legality_file_url}
                                        />
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 italic px-1">Maks. 2MB. Format: PDF, JPG, PNG.</p>
                        </div>
                    </div>
                </section>

                {/* Section 2: Visi & Misi */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-600" /> Visi, Misi & Deskripsi
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tentang Koperasi (Deskripsi Singkat) <span className="text-red-500">*</span></label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none"
                                placeholder="Jelaskan sejarah atau profil singkat koperasi Anda..."
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Compass className="w-4 h-4 text-emerald-500" /> Visi <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.vision}
                                    onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none text-sm"
                                    placeholder="Tuliskan visi koperasi..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Compass className="w-4 h-4 text-emerald-500" /> Misi <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.mission}
                                    onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none text-sm"
                                    placeholder="Tuliskan misi koperasi (gunakan baris baru untuk setiap poin)..."
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Pengurus */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-600" /> Daftar Pengurus
                        </h2>
                        <button
                            type="button"
                            onClick={addAdministrator}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all text-xs font-bold ring-1 ring-emerald-600/10"
                        >
                            <Plus className="w-4 h-4" /> Tambah Pengurus
                        </button>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {formData.administrators.map((admin, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl relative group"
                                >
                                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                                        {index + 1}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeAdministrator(index)}
                                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={admin.name}
                                                onChange={(e) => updateAdministrator(index, 'name', e.target.value)}
                                                className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:border-emerald-500 outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Jabatan <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={admin.position}
                                                onChange={(e) => updateAdministrator(index, 'position', e.target.value)}
                                                className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:border-emerald-500 outline-none"
                                                placeholder="Contoh: Ketua, Sekretaris..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">No. Telepon / WA <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={admin.phone}
                                                onChange={(e) => updateAdministrator(index, 'phone', e.target.value)}
                                                className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:border-emerald-500 outline-none"
                                                placeholder="08..."
                                                required
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {formData.administrators.length === 0 && (
                            <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                                <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-sm text-slate-400 font-medium">Belum ada pengurus yang ditambahkan.</p>
                                <button
                                    type="button"
                                    onClick={addAdministrator}
                                    className="mt-4 text-emerald-600 text-xs font-bold hover:underline"
                                >
                                    Tambah Pengurus Pertama
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {profileExists ? 'Perbarui Profil Institusi' : 'Simpan Profil Institusi'}
                    </button>
                </div>
            </form>
        </div>
    );
}
