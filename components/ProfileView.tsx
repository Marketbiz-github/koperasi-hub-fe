'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/apiService';
import { getAccessToken } from '@/utils/auth';
import { Loader2, User as UserIcon, Mail, Phone, Calendar, Shield, Crown, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProfileView() {
    const { user, isHydrated, hydrate } = useAuthStore();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
                    setProfile(res.data);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isHydrated && user) {
            fetchProfile();
        } else if (isHydrated && !user) {
            setLoading(false);
        }
    }, [user, isHydrated]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500">Gagal memuat profil atau sesi telah berakhir.</p>
            </div>
        );
    }

    return (
        <div className="py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <UserIcon size={40} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{profile.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none uppercase text-[10px] font-bold">
                            {profile.role}
                        </Badge>
                        {profile.status === 1 && (
                            <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-none flex items-center gap-1 text-[10px] font-bold">
                                <CheckCircle2 size={10} /> TERVERIFIKASI
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Information */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-600" /> Informasi Akun
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                                <p className="text-slate-700 font-medium">{profile.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No. Telepon</p>
                                <p className="text-slate-700 font-medium">{profile.phone || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Terdaftar Sejak</p>
                                <p className="text-slate-700 font-medium">
                                    {new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Plan */}
                {profile.plan && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Crown className="w-5 h-5 text-amber-500" /> Paket Langganan
                        </h2>
                        <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-100">
                            <p className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-1">Paket Aktif</p>
                            <p className="text-2xl font-black text-amber-900">{profile.plan.name}</p>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Masa Berlaku</p>
                                <p className="text-slate-700 font-medium">
                                    Sampai {new Date(profile.expired_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            {profile.plan.features && profile.plan.features.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fitur Unggulan</p>
                                    <ul className="space-y-1">
                                        {profile.plan.features.map((f: any) => (
                                            <li key={f.id} className="text-sm text-slate-600 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {f.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Flags */}
                {profile.flags && profile.flags.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-2">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Jaringan</h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.flags.map((flag: any) => (
                                <Badge key={flag.id} variant="secondary" className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border-none">
                                    {flag.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
