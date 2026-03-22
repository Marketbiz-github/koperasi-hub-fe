"use client"

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    MousePointer2,
    Share2,
    ShoppingBag,
    Wallet,
    Calendar
} from 'lucide-react';

interface ShareStat {
    id: number;
    share_code: string;
    affiliator_id: number;
    affiliator_name: string;
    affiliator_email: string;
    total_click: number;
    commission_click: number;
    total_reshare: number;
    commission_reshare: number;
    total_sale: number;
    commission_sale: number;
    total_commission: number;
    created_at: string;
}

interface CampaignSharesTableProps {
    shares: ShareStat[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const CampaignSharesTable: React.FC<CampaignSharesTableProps> = ({ shares }) => {
    if (!shares || shares.length === 0) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                <Users className="w-12 h-12 mb-4 opacity-10" />
                <p className="text-gray-500 font-medium text-lg">Belum ada yang membagikan campaign ini</p>
                <p className="text-sm opacity-60 mt-1 max-w-xs text-center">Tunggu para promotor mulai membagikan link produk Anda untuk melihat statistik di sini.</p>
            </div>
        );
    }

    return (
        <div className="border rounded-xl overflow-hidden shadow-sm ring-1 ring-gray-100 bg-white">
            <Table>
                <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead className="font-bold text-gray-700 py-4">No</TableHead>
                        <TableHead className="font-bold text-gray-700 py-4">Promotor</TableHead>
                        <TableHead className="text-center font-bold text-gray-700">Kode Share</TableHead>
                        <TableHead className="text-center font-bold text-gray-700">Aktivitas</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">Total Komisi</TableHead>
                        <TableHead className="text-right font-bold text-gray-700 pr-6">Waktu</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                    {shares.map((share, index) => (
                        <TableRow key={share.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell className="text-center">{index + 1}</TableCell>
                            <TableCell className="py-4">
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-900">{share.affiliator_name}</span>
                                    <span className="text-xs text-gray-500">{share.affiliator_email}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-600 border border-gray-200 uppercase">
                                    {share.share_code}
                                </code>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-center gap-4">
                                    <div className="flex flex-col items-center group/stat" title={`Komisi Klik: ${formatCurrency(share.commission_click)}`}>
                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg mb-1 group-hover/stat:bg-blue-100 transition-colors">
                                            <MousePointer2 className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">{share.total_click}</span>
                                        <span className="text-[9px] text-gray-400 uppercase tracking-tighter">Klik</span>
                                    </div>
                                    <div className="flex flex-col items-center group/stat" title={`Komisi Reshare: ${formatCurrency(share.commission_reshare)}`}>
                                        <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg mb-1 group-hover/stat:bg-amber-100 transition-colors">
                                            <Share2 className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">{share.total_reshare}</span>
                                        <span className="text-[9px] text-gray-400 uppercase tracking-tighter">Share</span>
                                    </div>
                                    <div className="flex flex-col items-center group/stat" title={`Komisi Sale: ${formatCurrency(share.commission_sale)}`}>
                                        <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg mb-1 group-hover/stat:bg-purple-100 transition-colors">
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">{share.total_sale}</span>
                                        <span className="text-[9px] text-gray-400 uppercase tracking-tighter">Sale</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-emerald-700">{formatCurrency(share.total_commission)}</span>
                                    <div className="flex items-center gap-1 text-[9px] text-gray-400 uppercase font-bold tracking-tighter">
                                        <Wallet className="w-2.5 h-2.5" />
                                        Terbayar
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                                <div className="flex flex-col items-end text-xs text-gray-500">
                                    <span className="font-medium">{formatDate(share.created_at)}</span>
                                    <div className="flex items-center gap-1 opacity-60">
                                        <Calendar className="w-3 h-3" />
                                        Mulai
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
