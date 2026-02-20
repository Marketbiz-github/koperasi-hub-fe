'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { affiliationService, userService, storeService } from '@/services/apiService';
import { Search, UserPlus, Loader2, Check, AlertCircle, Building2, Mail, Info, X, MapPin, Phone, Globe, ExternalLink } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import Image from 'next/image';

export default function RequestAffiliationPage() {
    const { token } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [requestingId, setRequestingId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedStore, setSelectedStore] = useState<any | null>(null);

    const debouncedSearch = useDebounce(searchTerm, 500);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const fetchItems = useCallback(async (search: string = '') => {
        if (!token) return;

        setIsLoading(true);
        setMessage(null);

        try {
            // Reseller searches for Koperasi
            const response = await userService.search(token, {
                role: 'koperasi',
                store_name: search,
                page: 1,
                limit: 50
            });

            if (response.data && response.data.data) {
                const usersList = response.data.data;
                const newItemsArray: any[] = [];

                for (const user of usersList) {
                    try {
                        const storeResponse = await storeService.getStoreByUserId(token, user.id);
                        const storeData = (storeResponse.data && storeResponse.data.length > 0) ? storeResponse.data[0] : null;

                        newItemsArray.push({
                            ...user,
                            store: storeData
                        });
                    } catch (err) {
                        console.error(`Failed to fetch store for user ${user.id}:`, err);
                        newItemsArray.push({
                            ...user,
                            store: null
                        });
                    }
                }

                setItems(newItemsArray);
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Gagal mencari koperasi' });
        } finally {
            setIsLoading(false);
            setIsInitialLoading(false);
            setHasSearched(true);
        }
    }, [token]);

    // Initial fetch
    useEffect(() => {
        if (token) {
            fetchItems('');
        }
    }, [token, fetchItems]);

    // Live search on debounce
    useEffect(() => {
        if (hasSearched && !isInitialLoading) {
            fetchItems(debouncedSearch);
        }
    }, [debouncedSearch, fetchItems]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchItems(searchTerm);
    };

    const handleRequest = async (parentId: number) => {
        if (!token) return;
        setRequestingId(parentId);
        setMessage(null);

        try {
            await affiliationService.create(token, {
                parent_id: parentId,
                type: 'reseller_koperasi'
            });
            setMessage({ type: 'success', text: 'Permintaan afiliasi berhasil dikirim' });
        } catch (error: any) {
            const errorMsg = error.message === 'affiliation already exists or is pending'
                ? 'Permintaan afiliasi sudah ada atau sedang menunggu persetujuan'
                : (error.message || 'Gagal mengirim permintaan afiliasi');
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setRequestingId(null);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Request Afiliasi ke Koperasi</h1>
                <p className="text-slate-500 mt-1">Cari koperasi melalui nama toko dan ajukan permintaan afiliasi.</p>
            </div>

            {/* Search Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 max-w-6xl">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari nama toko koperasi..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-emerald-200"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        Cari
                    </button>
                </form>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Results Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                                <th className="px-6 py-4 text-center w-16">No</th>
                                <th className="px-6 py-4">Toko Koperasi</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">No. Telepon</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {items.length > 0 ? (
                                items.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                                        <td className="px-6 py-4 text-center font-medium text-slate-400">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                                                    {item.store?.logo ? (
                                                        <Image
                                                            src={item.store.logo}
                                                            alt={item.store.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <Building2 className="w-6 h-6 text-emerald-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{item.store?.name || item.name}</div>
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-tight font-medium">Koperasi</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-700">{item.email || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-700">{item.phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedStore(item.store)}
                                                    disabled={!item.store}
                                                    title="Detail Toko"
                                                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
                                                >
                                                    <Info className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRequest(item.id)}
                                                    disabled={requestingId === item.id}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm shadow-emerald-100 hover:shadow-md"
                                                >
                                                    {requestingId === item.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <UserPlus className="w-4 h-4" />
                                                    )}
                                                    Request Afiliasi
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        {isLoading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                                <p>Mencari koperasi...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="w-12 h-12 opacity-20 mb-2" />
                                                <p>{hasSearched ? 'Tidak ditemukan koperasi dengan kriteria tersebut.' : 'Gunakan kolom pencarian untuk menemukan koperasi.'}</p>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Store Detail Modal */}
            {selectedStore && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="relative h-32 bg-emerald-600 overflow-hidden">
                            {selectedStore.cover ? (
                                <Image src={selectedStore.cover} alt="Cover" fill className="object-cover opacity-60" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700" />
                            )}
                            <button
                                onClick={() => setSelectedStore(null)}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-md"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Store Info Profile */}
                        <div className="px-8 pb-8 -mt-12 relative">
                            <div className="flex items-end gap-5 mb-6">
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg shrink-0 overflow-hidden border border-slate-100">
                                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-emerald-50 flex items-center justify-center">
                                        {selectedStore.logo ? (
                                            <Image src={selectedStore.logo} alt={selectedStore.name} fill className="object-cover" />
                                        ) : (
                                            <Building2 className="w-10 h-10 text-emerald-600" />
                                        )}
                                    </div>
                                </div>
                                <div className="pb-2">
                                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedStore.name}</h2>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {selectedStore.description && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tentang Toko</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed">{selectedStore.description}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <MapPin className="w-3 h-3 text-slate-400" /> Alamat
                                            </h4>
                                            <p className="text-slate-700 text-sm font-medium">{selectedStore.alamat || '-'}</p>
                                            <p className="text-slate-500 text-xs mt-0.5">{selectedStore.city}, {selectedStore.province}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <X className="w-3 h-3 rotate-45 text-slate-400" /> Kode Pos
                                            </h4>
                                            <p className="text-slate-700 text-sm font-medium">{selectedStore.zipcode || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <Phone className="w-3 h-3 text-slate-400" /> Kontak
                                            </h4>
                                            <p className="text-slate-700 text-sm font-medium">{selectedStore.phone || '-'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <Globe className="w-3 h-3 text-slate-400" /> Domain
                                            </h4>
                                            {(() => {
                                                const displayDomain = selectedStore.domain || (selectedStore.subdomain ? `${selectedStore.subdomain}.koperasi-hub-fe.test` : '-');
                                                return displayDomain !== '-' ? (
                                                    <a
                                                        href={`https://${displayDomain}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1 group"
                                                    >
                                                        {displayDomain}
                                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </a>
                                                ) : (
                                                    <p className="text-slate-700 text-sm font-medium">-</p>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => setSelectedStore(null)}
                                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
