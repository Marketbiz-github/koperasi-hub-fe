"use client";

import ProductListPage from "@/components/ProductListPage";

export default function ResellerProductsPage() {
    return (
        <ProductListPage
            title="Daftar Produk"
            description="Kelola inventaris produk reseller Anda"
            rolePath="reseller"
        />
    );
}
