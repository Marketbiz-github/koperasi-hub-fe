import StoreValidationPopup from '@/components/StoreValidationPopup';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
            <StoreValidationPopup />
        </>
    )
}
