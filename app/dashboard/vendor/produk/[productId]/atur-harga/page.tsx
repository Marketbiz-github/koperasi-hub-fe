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
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy, ChevronLeft } from "lucide-react"

interface KoperasiPrice {
  id: string
  nama: string
  hargaDefault: string
  hargaCustom: string | null
  status: "default" | "custom"
}

export default function AturHargaPage() {
  const params = useParams()
  const productId = params.productId as string

  const [koperasiPrices, setKoperasiPrices] = useState<KoperasiPrice[]>([
    {
      id: "1",
      nama: "Koperasi Sejahtera",
      hargaDefault: "50000",
      hargaCustom: null,
      status: "default",
    },
    {
      id: "2",
      nama: "Koperasi Maju Jaya",
      hargaDefault: "50000",
      hargaCustom: "45000",
      status: "custom",
    },
    {
      id: "3",
      nama: "Koperasi Bersama",
      hargaDefault: "50000",
      hargaCustom: null,
      status: "default",
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ hargaDefault: "", hargaCustom: "" })
  const [duplicateSource, setDuplicateSource] = useState<string>("")
  const [duplicateTarget, setDuplicateTarget] = useState<string>("")

  const handleEdit = (id: string) => {
    const item = koperasiPrices.find((k) => k.id === id)
    if (item) {
      setEditingId(id)
      setEditValues({
        hargaDefault: item.hargaDefault,
        hargaCustom: item.hargaCustom || "",
      })
    }
  }

  const handleSaveEdit = () => {
    setKoperasiPrices(
      koperasiPrices.map((k) =>
        k.id === editingId
          ? {
              ...k,
              hargaDefault: editValues.hargaDefault,
              hargaCustom: editValues.hargaCustom || null,
              status: editValues.hargaCustom ? "custom" : "default",
            }
          : k
      )
    )
    setEditingId(null)
  }

  const handleDuplicate = () => {
    if (!duplicateSource || !duplicateTarget) return

    const source = koperasiPrices.find((k) => k.id === duplicateSource)
    if (!source) return

    setKoperasiPrices(
      koperasiPrices.map((k) =>
        k.id === duplicateTarget
          ? {
              ...k,
              hargaCustom: source.hargaCustom || source.hargaDefault,
              status: "custom",
            }
          : k
      )
    )

    setDuplicateSource("")
    setDuplicateTarget("")
  }

  const formatCurrency = (value: string) => {
    const num = parseInt(value || "0")
    return `Rp${num.toLocaleString("id-ID")}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vendor/produk">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Atur Harga Koperasi</h1>
          <p className="text-sm text-gray-500">Produk ID: {productId}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manajemen Harga Per Koperasi</CardTitle>
          <CardDescription>
            Atur harga default atau custom harga untuk setiap koperasi
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {koperasiPrices.map((kop) => (
              <div
                key={kop.id}
                className="border rounded-lg p-4 space-y-3 bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{kop.nama}</h3>
                    <Badge variant={kop.status === "custom" ? "default" : "secondary"}>
                      {kop.status === "custom" ? "Custom" : "Default"}
                    </Badge>
                  </div>
                  {editingId !== kop.id && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(kop.id)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                {editingId === kop.id ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="mb-2 block">Harga Default</Label>
                      <Input
                        type="number"
                        value={editValues.hargaDefault}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            hargaDefault: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block">Harga Custom (opsional)</Label>
                      <Input
                        type="number"
                        value={editValues.hargaCustom}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            hargaCustom: e.target.value,
                          })
                        }
                        placeholder="Kosongkan untuk hapus custom harga"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        Simpan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Harga Default</p>
                      <p className="font-semibold">
                        {formatCurrency(kop.hargaDefault)}
                      </p>
                    </div>
                    {kop.hargaCustom && (
                      <div>
                        <p className="text-gray-600">Harga Custom</p>
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(kop.hargaCustom)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Copy className="mr-2 h-4 w-4" /> Duplicate Harga
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Duplicate Harga Dari Koperasi Lain</DialogTitle>
                  <DialogDescription>
                    Salin harga custom dari satu koperasi ke koperasi lain
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Dari Koperasi</Label>
                    <Select value={duplicateSource} onValueChange={setDuplicateSource}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih sumber" />
                      </SelectTrigger>
                      <SelectContent>
                        {koperasiPrices
                          .filter((k) => k.status === "custom")
                          .map((k) => (
                            <SelectItem key={k.id} value={k.id}>
                              {k.nama} ({formatCurrency(k.hargaCustom || k.hargaDefault)})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2 block">Ke Koperasi</Label>
                    <Select value={duplicateTarget} onValueChange={setDuplicateTarget}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tujuan" />
                      </SelectTrigger>
                      <SelectContent>
                        {koperasiPrices
                          .filter((k) => k.id !== duplicateSource)
                          .map((k) => (
                            <SelectItem key={k.id} value={k.id}>
                              {k.nama}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleDuplicate} className="w-full">
                    Duplicate
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Link href="/dashboard/vendor/produk">
              <Button variant="outline">Kembali</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
