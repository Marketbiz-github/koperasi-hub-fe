import { SharedLanggananPage } from '@/components/SharedLanggananPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Langganan | Vendor Dashboard',
    description: 'Pilih paket langganan untuk vendor'
};

export default function VendorLangganan() {
    return <SharedLanggananPage />;
}
