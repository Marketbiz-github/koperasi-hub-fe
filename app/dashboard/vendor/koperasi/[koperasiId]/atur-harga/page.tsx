"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronLeft, Save } from "lucide-react"

interface ProductPrice {
  id: string
  nama: string
  hargaDefault: string
  hargaCustom: string | null
}

export default function AturHargaKoperasiPage() {
  const params = useParams()
  const koperasiId = params.koperasiId as string

  const [products, setProducts] = useState<ProductPrice[]>([
    {
      id: "1",
      nama: "Jeruk Orange 1KG",
      hargaDefault: "50000",
      hargaCustom: "45000",
    },
    {
      id: "2",
      nama: "Mangga Manis 1KG",
      hargaDefault: "40000",
      hargaCustom: null,
    },
    {
      id: "3",
      nama: "Pisang Emas 1KG",
      hargaDefault: "35000",
      hargaCustom: null,
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [customPrice, setCustomPrice] = useState<string>("")

  const handleEditCustomPrice = (id: string, current: string | null) => {
    setEditingId(id)
    setCustomPrice(current || "")
  }

  const handleSaveCustomPrice = (id: string) => {
    setProducts(
      products.map((p) =>
        p.id === id
          ? {
              ...p,
              hargaCustom: customPrice || null,
            }
          : p
      )
    )
    setEditingId(null)
  }

  const formatCurrency = (value: string) => {
    const num = parseInt(value || "0")
    return `Rp${num.toLocaleString("id-ID")}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vendor/koperasi">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Custom Harga Koperasi</h1>
          <p className="text-sm text-gray-500">Koperasi ID: {koperasiId}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atur Harga Custom Per Produk</CardTitle>
          <CardDescription>
            Set harga custom untuk produk Anda di koperasi ini. Kosongkan untuk
            gunakan harga default.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Harga Default</TableHead>
                  <TableHead>Harga Custom</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.map((prod) => (
                  <TableRow key={prod.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{prod.nama}</TableCell>
                    <TableCell>
                      <span className="text-gray-600">
                        {formatCurrency(prod.hargaDefault)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {editingId === prod.id ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(e.target.value)}
                            placeholder="Custom price"
                            className="w-32"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveCustomPrice(prod.id)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span
                          className={
                            prod.hargaCustom
                              ? "text-blue-600 font-semibold"
                              : "text-gray-400"
                          }
                        >
                          {prod.hargaCustom
                            ? formatCurrency(prod.hargaCustom)
                            : "-"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId !== prod.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleEditCustomPrice(prod.id, prod.hargaCustom)
                          }
                        >
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex gap-2">
            <Link href="/dashboard/vendor/koperasi">
              <Button variant="outline">Kembali</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
