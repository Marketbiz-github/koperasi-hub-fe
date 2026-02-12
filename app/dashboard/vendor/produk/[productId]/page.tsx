"use client";

import ProductForm from "@/components/ProductForm";
import { useParams } from "next/navigation";

export default function EditProductPage() {
    const params = useParams();
    const productId = params?.productId as string;

    return <ProductForm rolePath="vendor" productId={productId} />;
}
