"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { MultiImageUpload } from "@/components/multi-image-upload"
import Link from "next/link"

export default function KategoriTambahPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [parent, setParent] = useState("")
  const [status, setStatus] = useState(true)

  const parentOptions = ["-", "Elektronik", "Fashion", "Rumah Tangga"]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: hook up to API
    console.log({ name, parent, status })
    router.push('/dashboard/vendor/produk/kategori')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tambah Kategori</h1>
        <Link href="/dashboard/vendor/produk/kategori">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Form Kategori</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Nama Kategori *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama kategori" />
            </div>

            <div>
              <Label className="mb-2 block">Kategori Parent</Label>
              <Select value={parent} onValueChange={setParent}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih parent (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  {parentOptions.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Gambar Kategori</Label>
              <MultiImageUpload />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={status} onCheckedChange={setStatus} />
              <Label>Status</Label>
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit">Simpan</Button>
              <Link href="/dashboard/vendor/produk/kategori">
                <Button variant="outline">Batal</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
