'use client';

import React from 'react';
import Image from 'next/image';
import { 
    Building2, 
    Target, 
    Info, 
    Users, 
    ChevronLeft, 
    Loader2, 
    ShieldCheck, 
    Globe,
    FileText,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { storeService, koperasiProfilingService } from '@/services/apiService';
import { getPublicAccessToken } from '@/utils/auth';
import StoreHeader from '../components/StoreHeader';
import StoreFooter from '../components/StoreFooter';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { motion } from 'framer-motion';

export default function KoperasiPublicProfilePage({
    params,
}: {
    params: Promise<{ storeId: string }>
}) {
    const { storeId } = React.use(params);
    const [store, setStore] = React.useState<any>(null);
    const [profile, setProfile] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = await getPublicAccessToken();
                
                // Fetch Store Details
                // If storeId is numeric, use getDetail, otherwise use lookup
                let storeRes;
                if (!isNaN(Number(storeId))) {
                    storeRes = await storeService.getDetail(token || '', storeId);
                } else {
                    storeRes = await storeService.lookup(token || '', storeId);
                }

                if (storeRes.data) {
                    setStore(storeRes.data);
                    
                    // Fetch Koperasi Profile using user_id from store
                    const userId = storeRes.data.user_id;
                    if (userId) {
                        try {
                            const profileRes = await koperasiProfilingService.getProfile(token || undefined, userId);
                            if (profileRes.data) {
                                setProfile(profileRes.data);
                            }
                        } catch (err) {
                            console.error('Profile not found:', err);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [storeId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Memuat Profil...</p>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center">
                <Building2 className="w-16 h-16 text-slate-200" />
                <h1 className="text-2xl font-bold text-slate-500">Toko tidak ditemukan</h1>
                <Link href="/marketplace" className="text-emerald-600 font-bold hover:underline">Kembali ke Marketplace</Link>
            </div>
        );
    }

    const primaryColor = store.color || '#10b981';

    return (
        <div 
            className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans"
            style={{ '--store-primary': primaryColor } as React.CSSProperties}
        >
            <StoreHeader store={store} />

            <main className="flex-1">
                {/* Hero Section with Glassmorphism */}
                <div className="relative h-64 md:h-80 bg-slate-900 overflow-hidden">
                    {store.cover ? (
                        <Image 
                            src={store.cover} 
                            alt={store.name} 
                            fill 
                            className="object-cover opacity-60 scale-105 blur-[2px]" 
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-900 opacity-60" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FDFDFD] via-transparent to-black/20" />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-8">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-8 border-white shadow-2xl overflow-hidden bg-white group"
                        >
                            {store.logo ? (
                                <Image src={store.logo} alt={store.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <Building2 className="w-16 h-16 text-slate-200" />
                            )}
                        </motion.div>
                        <motion.h1 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="mt-6 text-3xl md:text-5xl font-black text-slate-900 tracking-tight text-center"
                        >
                            {store.name}
                        </motion.h1>
                        <div className="flex items-center gap-2 mt-2">
                             <div className="h-1 w-12 bg-[var(--store-primary)] rounded-full" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Profil Institusi</span>
                             <div className="h-1 w-12 bg-[var(--store-primary)] rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 -mt-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* Sidebar Information */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                            <Globe className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Official Website / ID</p>
                                            <p className="text-sm font-bold text-slate-800 break-all">{window.location.origin}/store/{store.id}</p>
                                        </div>
                                    </div>

                                    {profile?.legality_number && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Legalitas</p>
                                                <div className="flex flex-col gap-2">
                                                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold ring-1 ring-emerald-600/10 w-fit">
                                                        Terdaftar & Terverifikasi
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-xs font-mono text-slate-500">{profile.legality_number}</p>
                                                        {profile.legality_file_url && (
                                                            <a 
                                                                href={profile.legality_file_url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors mt-1"
                                                            >
                                                                <FileText className="w-3 h-3" />
                                                                Lihat Dokumen Resmi
                                                                <ArrowRight className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-slate-100">
                                        <Link 
                                            href={`/store/${storeId}`}
                                            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold transition-all group"
                                        >
                                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                            Kembali ke Toko
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Administrators Card */}
                            {profile?.administrators?.length > 0 && (
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                                        <Users className="w-6 h-6 text-[var(--store-primary)]" />
                                        Struktur Pengurus
                                    </h3>
                                    <div className="space-y-4">
                                        {profile.administrators.map((admin: any, idx: number) => (
                                            <div key={idx} className="flex flex-col gap-1 p-4 bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-2xl transition-all">
                                                <p className="text-sm font-bold text-slate-900">{admin.name}</p>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{admin.position}</p>
                                                    <div className="h-1 flex-1 mx-3 border-b-2 border-dotted border-slate-200" />
                                                    <a 
                                                        href={`https://wa.me/${admin.phone.replace(/[^0-9]/g, '').startsWith('0') ? '62' + admin.phone.replace(/[^0-9]/g, '').substring(1) : admin.phone.replace(/[^0-9]/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] font-mono font-bold text-[var(--store-primary)] hover:underline"
                                                    >
                                                        {admin.phone}
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Main Description & Vision Mission */}
                        <div className="lg:col-span-8 space-y-12">
                            {/* About */}
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-0.5 w-8 bg-[var(--store-primary)]" />
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                        <Info className="w-7 h-7 text-[var(--store-primary)]" />
                                        Tentang Kami
                                    </h2>
                                </div>
                                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                                        <Building2 className="w-48 h-48 rotate-12" />
                                    </div>
                                    <p className="text-slate-600 leading-[1.8] text-lg font-medium relative z-10 whitespace-pre-line">
                                        {profile?.description || store.description || 'Koperasi ini merupakan institusi yang berdedikasi untuk melayani anggota dan masyarakat dengan prinsip gotong royong dan kemandirian ekonomi.'}
                                    </p>
                                </div>
                            </section>

                            {/* Vision & Mission */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <motion.section 
                                    whileHover={{ y: -5 }}
                                    className="bg-gradient-to-br from-emerald-600 to-teal-700 p-10 rounded-[3rem] text-white shadow-2xl shadow-emerald-600/20"
                                >
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black mb-4 uppercase tracking-widest">Visi</h2>
                                    <p className="text-emerald-50/90 leading-relaxed font-semibold italic text-lg">
                                        {profile?.vision ? `"${profile.vision}"` : 'Menjadi pilar utama kemandirian ekonomi masyarakat melalui inovasi teknologi dan kolaborasi berkelanjutan.'}
                                    </p>
                                </motion.section>

                                <motion.section 
                                    whileHover={{ y: -5 }}
                                    className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100"
                                >
                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                                        <FileText className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest">Misi</h2>
                                    <div className="space-y-4">
                                        {profile?.mission ? (
                                            <div className="text-slate-500 leading-relaxed font-medium whitespace-pre-line">
                                                {profile.mission}
                                            </div>
                                        ) : (
                                            <ul className="space-y-3">
                                                {['Mengembangkan ekosistem sirkular.', 'Memberdayakan UMKM lokal.', 'Menerapkan transformasi digital.'].map((m, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-slate-500 font-medium">
                                                        <ArrowRight className="w-4 h-4 mt-1 text-[var(--store-primary)] shrink-0" />
                                                        <span>{m}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </motion.section>
                            </div>

                            {/* Bottom Call to Action */}
                            <div className="bg-slate-50 rounded-[3rem] p-12 text-center border-2 border-dashed border-slate-200">
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Mari Tumbuh Bersama</h3>
                                <p className="text-slate-500 font-medium mb-8">Dukung ekonomi mandiri dengan bertransaksi di toko resmi kami.</p>
                                <Link 
                                    href={`/store/${storeId}`}
                                    className="inline-flex items-center gap-3 bg-[var(--store-primary)] hover:opacity-90 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-600/30"
                                >
                                    Lihat Semua Produk
                                    <ArrowRight className="w-6 h-6" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <StoreFooter store={store} />
            <ScrollToTop />
        </div>
    );
}
