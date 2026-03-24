"use client";

import ProductForm from "@/components/ProductForm";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CreateProductForm() {
    const searchParams = useSearchParams();
    const duplicateId = searchParams.get("duplicate");
    
    return <ProductForm rolePath="vendor" productId={duplicateId || undefined} isDuplicate={!!duplicateId} />;
}

export default function CreateProductPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateProductForm />
    </Suspense>
  );
}
