"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiImageUpload } from "@/components/multi-image-upload"

export function Step1Info({
  productType,
  setProductType,
}: {
  productType: "single" | "variant"
  setProductType: (v: "single" | "variant") => void
}) {
  const [statusAktif, setStatusAktif] = useState(true)
  const [tipeSatuan, setTipeSatuan] = useState<string>("")

  const categories = [
    "Elektronik",
    "Fashion",
    "Makanan & Minuman",
    "Kecantikan",
    "Rumah Tangga",
    "Olahraga",
    "Buku",
    "Lainnya",
  ]

  const generalCategories = [
    "Premium",
    "Standard",
    "Budget",
    "Luxury",
    "Ekonomis",
    "Organik",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Produk</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Switch checked={statusAktif} onCheckedChange={setStatusAktif} />
          <Label>Status Produk</Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2" htmlFor="nama">Nama Produk *</Label>
            <Input id="nama" placeholder="Masukkan nama produk" />
          </div>
          <div>
            <Label className="mb-2" htmlFor="sku">SKU *</Label>
            <Input id="sku" placeholder="Masukkan SKU" />
          </div>
        </div>

        <div>
          <Label>Jenis Produk *</Label>
          <RadioGroup
            value={productType}
            onValueChange={(v) => setProductType(v as "single" | "variant")}
            className="mt-2 space-y-1"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="single" />
              Produk tanpa varian
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="variant" />
              Produk dengan varian
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2" htmlFor="category">Kategori *</Label>
            <Select>
              <SelectTrigger id="category">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2" htmlFor="general-category">Kategori Umum *</Label>
            <Select>
              <SelectTrigger id="general-category">
                <SelectValue placeholder="Pilih kategori umum" />
              </SelectTrigger>
              <SelectContent>
                {generalCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="mb-2" htmlFor="deskripsi-pendek">Deskripsi Pendek *</Label>
          <Textarea id="deskripsi-pendek" placeholder="Masukkan deskripsi pendek" />
        </div>

        <div>
          <Label className="mb-2" htmlFor="deskripsi-panjang">Deskripsi Panjang *</Label>
          <Textarea
            id="deskripsi-panjang"
            placeholder="Masukkan deskripsi panjang"
            rows={5}
          />
        </div>

        <div>
          <Label className="mb-2" htmlFor="tipe-satuan">Tipe Satuan *</Label>
          <Select value={tipeSatuan} onValueChange={setTipeSatuan}>
            <SelectTrigger id="tipe-satuan">
              <SelectValue placeholder="Pilih tipe satuan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="produk">Produk</SelectItem>
              <SelectItem value="paket">Paket</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {tipeSatuan === "paket" && (
          <div>
            <Label className="mb-2" htmlFor="jumlah-produk">Jumlah Produk dalam Paket *</Label>
            <Input
              id="jumlah-produk"
              type="number"
              placeholder="Masukkan jumlah produk"
            />
          </div>
        )}

        <div>
          <Label className="mb-2">Gambar Produk *</Label>
          <MultiImageUpload />
        </div>
      </CardContent>
    </Card>
  )
}
