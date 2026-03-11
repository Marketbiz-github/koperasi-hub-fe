'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/apiService';
import { getAccessToken } from '@/utils/auth';
import { Loader2, Save, User as UserIcon, Phone, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSettingsForm() {
    const { user, isHydrated, hydrate } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    useEffect(() => {
        if (!isHydrated) {
            hydrate();
        }
    }, [isHydrated, hydrate]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!isHydrated || !user) return;
            try {
                const token = await getAccessToken();
                const res = await userService.getUserDetail(token || '', user.id);
                if (res.data) {
                    const data = res.data;
                    setFormData({
                        name: data.name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        password: '',
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast.error('Gagal memuat data profil');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;
        setLoading(true);

        try {
            const token = await getAccessToken();
            const payload: any = {
                name: formData.name,
                phone: formData.phone,
            };

            // Allow password update if provided
            if (formData.password) {
                payload.password = formData.password;
            }

            await userService.updateUser(user.id, payload, token || '');

            toast.success('Profil berhasil diperbarui!');

            // Clear password field after successful update
            if (formData.password) {
                setFormData(prev => ({ ...prev, password: '' }));
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Gagal menyimpan profil.');
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
            <p className="text-slate-500 mb-6">Silakan login kembali untuk mengakses pengaturan akun.</p>
            <button onClick={() => window.location.href = '/login'} className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium">Login Sekarang</button>
        </div>;
    }

    return (
        <div className="py-8 px-4">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                    <UserIcon className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Pengaturan Akun</h1>
                    <p className="text-slate-500">Kelola informasi pribadi dan keamanan akun Anda.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-blue-600" /> Informasi Pribadi
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email (Tidak dapat diubah)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    value={formData.email}
                                    readOnly
                                    className="w-full pl-10 px-4 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-500 outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Telepon <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-10 px-4 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    placeholder="Contoh: 08123456789"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-600" /> Keamanan Akun
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Password Baru <span className="text-slate-400 font-normal italic">(opsional)</span></label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                placeholder="Biarkan kosong jika tidak ingin mengubah password"
                            />
                            <p className="text-[10px] text-slate-500 mt-1 italic">
                                Mengisi field ini akan mengubah password login Anda.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    );
}
