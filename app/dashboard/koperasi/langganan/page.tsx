import { SharedLanggananPage } from '@/components/SharedLanggananPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Langganan | Koperasi Dashboard',
    description: 'Pilih paket langganan untuk koperasi'
};

export default function KoperasiLangganan() {
    return <SharedLanggananPage />;
}
