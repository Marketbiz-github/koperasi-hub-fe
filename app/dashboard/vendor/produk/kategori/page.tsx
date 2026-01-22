"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function KategoriPage() {
  const [items, setItems] = useState(
    [
      { id: '1', name: 'Elektronik', parent: '-', status: 'Aktif' },
      { id: '2', name: 'Fashion', parent: '-', status: 'Aktif' },
    ]
  )

  const handleDelete = (id: string) => {
    setItems(items.filter((i) => i.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kategori Produk</h1>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/vendor/produk/kategori/tambah">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <Input placeholder="Nama kategori" />

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>

            <div className="md:col-span-3 flex gap-2">
              <Button className="flex-1">Cari</Button>
              <Button variant="outline" className="flex-1">Bersihkan</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
          <CardDescription>Kelola kategori produk di toko Anda</CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Opsi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id} className="hover:bg-gray-50">
                  <TableCell>{it.name}</TableCell>
                  <TableCell>{it.parent}</TableCell>
                  <TableCell>
                    <Badge>{it.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href="#">
                      <Button size="icon" variant="outline">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(it.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
