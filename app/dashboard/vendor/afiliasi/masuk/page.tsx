'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { affiliationService, storeService } from '@/services/apiService';
import {
    Loader2,
    Check,
    X,
    UserCheck,
    Clock,
    Search,
    Eye,
    MapPin,
    Building2,
    Phone,
    Info
} from 'lucide-react';

interface Affiliation {
    id: number;
    status: string;
    created_at: string;
    child_id: number;
    child: {
        id: number;
        name: string;
        email: string;
        store?: {
            name: string;
        }
    }
}

interface StoreDetail {
    id: number;
    logo?: string;
    name: string;
    alamat: string;
    description: string;
    phone?: string;
    city?: string;
    province?: string;
}

export default function IncomingAffiliationsPage() {
    const { token } = useAuthStore();
    const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Search & Detail States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStore, setSelectedStore] = useState<StoreDetail | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAffiliations = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await affiliationService.getIncoming(token, { types: ['koperasi_vendor'] });
            if (response.data) {
                setAffiliations(response.data);
            } else {
                setAffiliations([]);
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Gagal memuat data afiliasi' });
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAffiliations();
    }, [fetchAffiliations]);

    const handleApprove = async (id: number) => {
        if (!token) return;
        setProcessingId(id);
        setMessage(null);
        try {
            await affiliationService.approve(token, id);
            setMessage({ type: 'success', text: 'Permintaan afiliasi disetujui' });
            fetchAffiliations();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Gagal menyetujui permintaan' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: number) => {
        if (!token) return;
        setProcessingId(id);
        setMessage(null);
        try {
            await affiliationService.reject(token, id);
            setMessage({ type: 'success', text: 'Permintaan afiliasi ditolak' });
            fetchAffiliations();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Gagal menolak permintaan' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleViewDetail = async (userId: number) => {
        if (!token) return;
        setIsDetailLoading(true);
        setIsModalOpen(true);
        setSelectedStore(null);
        try {
            const response = await storeService.getStoreByUserId(token, userId);
            if (response.data && response.data.length > 0) {
                setSelectedStore(response.data[0]);
            } else {
                setMessage({ type: 'error', text: 'Data toko tidak ditemukan' });
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Gagal memuat detail toko' });
            setIsModalOpen(false);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const filteredAffiliations = useMemo(() => {
        return affiliations.filter(item =>
            item.child?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.child?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [affiliations, searchTerm]);

    return (
        <div className="p-6">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Permintaan Afiliasi Masuk</h1>
                    <p className="text-slate-500 mt-1">Kelola permintaan afiliasi dari Koperasi yang ingin bergabung.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari pemohon..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center justify-between gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        {message.text}
                    </div>
                    <button onClick={() => setMessage(null)} className="text-current opacity-50 hover:opacity-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {filteredAffiliations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4 text-center w-16">No</th>
                                        <th className="px-6 py-4">Pemohon</th>
                                        <th className="px-6 py-4 text-center">Detail Toko</th>
                                        <th className="px-6 py-4 text-center">Tanggal</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredAffiliations.map((affiliation, index) => (
                                        <tr key={affiliation.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                                            <td className="px-6 py-4 text-center font-medium text-slate-400">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 text-sm">
                                                        {affiliation.child?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{affiliation.child?.name || 'Unknown'}</div>
                                                        <div className="text-xs text-slate-500">{affiliation.child?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleViewDetail(affiliation.child.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Detail Toko
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center text-xs text-slate-500 whitespace-nowrap">
                                                {new Date(affiliation.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${affiliation.status === 'approved'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                    : affiliation.status === 'rejected'
                                                        ? 'bg-red-50 text-red-700 border border-red-100'
                                                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                                                    }`}>
                                                    {affiliation.status === 'pending' ? <Clock className="w-3 h-3" /> : (affiliation.status === 'approved' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />)}
                                                    {affiliation.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {affiliation.status !== 'rejected' && (
                                                        <button
                                                            onClick={() => handleApprove(affiliation.id)}
                                                            disabled={processingId === affiliation.id || affiliation.status === 'approved'}
                                                            className={`p-2 rounded-lg transition-colors border ${affiliation.status === 'approved'
                                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 cursor-not-allowed'
                                                                : 'text-emerald-600 hover:bg-emerald-50 border-emerald-100'
                                                                }`}
                                                            title="Setujui"
                                                        >
                                                            {processingId === affiliation.id ? (
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                            ) : (
                                                                <UserCheck className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                    )}
                                                    {affiliation.status !== 'approved' && (
                                                        <button
                                                            onClick={() => handleReject(affiliation.id)}
                                                            disabled={processingId === affiliation.id || affiliation.status === 'rejected'}
                                                            className={`p-2 rounded-lg transition-colors border ${affiliation.status === 'rejected'
                                                                ? 'bg-red-100 text-red-700 border-red-200 cursor-not-allowed'
                                                                : 'text-red-600 hover:bg-red-50 border-red-100'
                                                                }`}
                                                            title="Tolak"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-400">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserCheck className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-lg font-medium text-slate-900">Tidak ada permintaan ditemukan</p>
                            <p className="text-sm">Coba kata kunci lain atau periksa kembali nanti.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-emerald-600" />
                                Detail Toko
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6">
                            {isDetailLoading ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                                    <p className="text-sm text-slate-500 font-medium font-mono">Memuat data...</p>
                                </div>
                            ) : selectedStore ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <img src={selectedStore.logo || ''} alt="Logo" className="w-16 h-16 object-cover rounded-lg" />
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nama Toko</div>
                                            <div className="text-lg font-bold text-slate-900 leading-tight">{selectedStore.name}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                                <MapPin className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Alamat</div>
                                                <div className="text-sm text-slate-600 leading-relaxed">
                                                    {selectedStore.alamat}
                                                    {selectedStore.city && `, ${selectedStore.city}`}
                                                    {selectedStore.province && `, ${selectedStore.province}`}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedStore.phone && (
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                                    <Phone className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Kontak</div>
                                                    <div className="text-sm text-slate-600">{selectedStore.phone}</div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                                <Info className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Deskripsi</div>
                                                <div className="text-sm text-slate-600 leading-relaxed italic">
                                                    {selectedStore.description || 'Tidak ada deskripsi.'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <Info className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-500">Gagal memuat detail toko.</p>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm shadow-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
