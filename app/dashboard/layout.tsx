import StoreValidationPopup from '@/components/StoreValidationPopup';
import DashboardHydration from './DashboardHydration';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <DashboardHydration>
            {children}
            <StoreValidationPopup />
        </DashboardHydration>
    )
}
