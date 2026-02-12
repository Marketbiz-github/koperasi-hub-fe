'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { affiliationService } from '@/services/apiService';
import { Search, UserPlus, Loader2, Check, AlertCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import Image from 'next/image';

export default function RequestAffiliationPage() {
    const { token } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [requestingId, setRequestingId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const debouncedSearch = useDebounce(searchTerm, 500);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const fetchUsers = useCallback(async (search: string = '') => {
        if (!token) return;

        setIsLoading(true);
        setMessage(null);

        try {
            // Reseller searches for Koperasi
            const response = await affiliationService.getParents(token, {
                role: 'koperasi',
                search: search
            });
            if (response.data) {
                setUsers(response.data);
            } else {
                setUsers([]);
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
            fetchUsers('');
        }
    }, [token, fetchUsers]);

    // Live search on debounce
    useEffect(() => {
        if (hasSearched && !isInitialLoading) {
            fetchUsers(debouncedSearch);
        }
    }, [debouncedSearch, fetchUsers]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(searchTerm);
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
            // Optionally remove the user from list or mark as requested
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: error.message || 'Gagal mengirim permintaan afiliasi' });
        } finally {
            setRequestingId(null);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Request Afiliasi ke Koperasi</h1>
                <p className="text-slate-500 mt-1">Cari koperasi dan ajukan permintaan afiliasi untuk bekerjasama.</p>
            </div>

            {/* Search Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari nama koperasi..."
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !searchTerm.trim()}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        Cari
                    </button>
                </form>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Results Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.length > 0 ? (
                    users.map((user) => (
                        <div key={user.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">
                                            {user.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{user.name}</h3>
                                        <p className="text-sm text-slate-500">{user.email}</p>
                                        {user.store && <p className="text-xs text-emerald-600 font-medium mt-1">{user.store.name}</p>}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleRequest(user.id)}
                                disabled={requestingId === user.id}
                                className="w-full py-2.5 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {requestingId === user.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                )}
                                Request Afiliasi
                            </button>
                        </div>
                    ))
                ) : (
                    hasSearched && !isLoading && (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Tidak ditemukan koperasi dengan kata kunci tersebut.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
