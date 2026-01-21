"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface Variant {
  id: string
  sku: string
  name: string
  harga: string
  stok: string
}

export function Step2Management({
  productType,
}: {
  productType: "single" | "variant"
}) {
  const [variants, setVariants] = useState<Variant[]>([])
  const [variantForm, setVariantForm] = useState({
    sku: "",
    name: "",
    harga: "",
    stok: "",
  })

  const handleAddVariant = () => {
    if (
      variantForm.sku &&
      variantForm.name &&
      variantForm.harga &&
      variantForm.stok
    ) {
      setVariants([
        ...variants,
        {
          id: Date.now().toString(),
          ...variantForm,
        },
      ])
      setVariantForm({ sku: "", name: "", harga: "", stok: "" })
    }
  }

  const handleDeleteVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id))
  }

  if (productType === "variant") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Varian Produk</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3 border-b pb-4">
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label className="mb-2 block">SKU Varian *</Label>
                <Input
                  placeholder="Masukkan SKU varian"
                  value={variantForm.sku}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, sku: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="mb-2 block">Varian (Warna / Size) *</Label>
                <Input
                  placeholder="Contoh: Merah / M"
                  value={variantForm.name}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="mb-2 block">Harga *</Label>
                <Input
                  placeholder="Masukkan harga"
                  type="number"
                  value={variantForm.harga}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, harga: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="mb-2 block">Stok *</Label>
                <Input
                  placeholder="Masukkan stok"
                  type="number"
                  value={variantForm.stok}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, stok: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleAddVariant}
            className="mt-1"
          >
            + Tambah Varian
          </Button>

          {variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">
                Varian yang Ditambahkan ({variants.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-3 py-2 text-left">SKU</th>
                      <th className="px-3 py-2 text-left">Varian</th>
                      <th className="px-3 py-2 text-right">Harga</th>
                      <th className="px-3 py-2 text-right">Stok</th>
                      <th className="px-3 py-2 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant) => (
                      <tr key={variant.id} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2">{variant.sku}</td>
                        <td className="px-3 py-2">{variant.name}</td>
                        <td className="px-3 py-2 text-right">
                          Rp {parseInt(variant.harga).toLocaleString("id-ID")}
                        </td>
                        <td className="px-3 py-2 text-right">{variant.stok}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => handleDeleteVariant(variant.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium text-gray-700">Dimensi Produk</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Berat (gram) *</Label>
                <Input
                  placeholder="Masukkan berat produk"
                  type="number"
                />
              </div>

              <div>
                <Label className="mb-2 block">Panjang (cm) *</Label>
                <Input
                  placeholder="Masukkan panjang produk"
                  type="number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Lebar (cm) *</Label>
                <Input
                  placeholder="Masukkan lebar produk"
                  type="number"
                />
              </div>

              <div>
                <Label className="mb-2 block">Tinggi (cm) *</Label>
                <Input
                  placeholder="Masukkan tinggi produk"
                  type="number"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Harga & Stok</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Harga *</Label>
            <Input placeholder="Masukkan harga" type="number" />
          </div>
          <div>
            <Label className="mb-2 block">Harga Setelah Diskon</Label>
            <Input placeholder="Masukkan harga diskon" type="number" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Stok *</Label>
            <Input placeholder="Masukkan stok" type="number" />
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium text-gray-700">Dimensi Produk</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Berat (gram) *</Label>
              <Input
                placeholder="Masukkan berat produk"
                type="number"
              />
            </div>

            <div>
              <Label className="mb-2 block">Panjang (cm) *</Label>
              <Input
                placeholder="Masukkan panjang produk"
                type="number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Lebar (cm) *</Label>
              <Input
                placeholder="Masukkan lebar produk"
                type="number"
              />
            </div>

            <div>
              <Label className="mb-2 block">Tinggi (cm) *</Label>
              <Input
                placeholder="Masukkan tinggi produk"
                type="number"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
