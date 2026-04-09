import { SharedLanggananPage } from '@/components/SharedLanggananPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Langganan | Reseller Dashboard',
    description: 'Pilih paket langganan untuk reseller'
};

export default function ResellerLangganan() {
    return <SharedLanggananPage />;
}
