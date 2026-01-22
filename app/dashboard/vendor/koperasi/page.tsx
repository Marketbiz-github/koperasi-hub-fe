"use client"

import { useState } from "react"
import Link from "next/link"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Eye, DollarSign, Copy, Pencil } from "lucide-react"

interface Koperasi {
  id: string
  nama: string
  status: string
  tanggalJoin: string
}

export default function KoperasiPage() {
  const [koperasiList] = useState<Koperasi[]>([
    {
      id: "1",
      nama: "Koperasi Sejahtera",
      status: "Aktif",
      tanggalJoin: "2024-01-15",
    },
    {
      id: "2",
      nama: "Koperasi Maju Jaya",
      status: "Aktif",
      tanggalJoin: "2024-02-20",
    },
    {
      id: "3",
      nama: "Koperasi Bersama",
      status: "Nonaktif",
      tanggalJoin: "2024-03-10",
    },
  ])

  const [duplicateTarget, setDuplicateTarget] = useState<string>("")
  const [duplicateSource, setDuplicateSource] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDuplicate = (targetId: string) => {
    setDuplicateTarget(targetId)
    setDuplicateSource("")
    setIsDialogOpen(true)
  }

  const handleConfirmDuplicate = () => {
    if (!duplicateSource || !duplicateTarget) return

    // Simulasi copy setting dari duplicateSource ke duplicateTarget
    console.log(`Duplicate from ${duplicateSource} to ${duplicateTarget}`)
    
    // Bisa tambah toast/notification di sini
    setIsDialogOpen(false)
    setDuplicateTarget("")
    setDuplicateSource("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Koperasi</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <Input placeholder="Cari nama koperasi" />

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>

            <div className="md:col-span-3 flex gap-2">
              <Button className="flex-1">Cari</Button>
              <Button variant="outline" className="flex-1">
                Bersihkan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Koperasi</CardTitle>
          <CardDescription>Koperasi yang sudah di-approve</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Join</TableHead>
                  <TableHead className="text-right">Opsi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {koperasiList.map((kop, index) => (
                  <TableRow key={kop.id} className="hover:bg-gray-50">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{kop.nama}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          kop.status === "Aktif" ? "default" : "secondary"
                        }
                      >
                        {kop.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(kop.tanggalJoin)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/vendor/koperasi/${kop.id}`}>
                          <Button
                            size="icon"
                            variant="outline"
                            title="Lihat detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          size="default"
                          variant="outline"
                          title="Custom harga"
                          asChild
                        >
                          <Link href={`/dashboard/vendor/koperasi/${kop.id}/atur-harga`}>
                            <DollarSign className="h-4 w-4 mr-2" /> Custom Harga
                          </Link>
                        </Button>

                        <Dialog open={isDialogOpen && duplicateTarget === kop.id} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              title="Duplikat setting"
                              onClick={() => handleDuplicate(kop.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Duplikat Setting Koperasi</DialogTitle>
                              <DialogDescription>
                                Pilih koperasi sumber untuk menyalin semua setting harga ke{" "}
                                <span className="font-semibold">{kop.nama}</span>
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Dari Koperasi Mana?
                                </label>
                                <Select
                                  value={duplicateSource}
                                  onValueChange={setDuplicateSource}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih koperasi sumber" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {koperasiList
                                      .filter((k) => k.id !== kop.id)
                                      .map((k) => (
                                        <SelectItem key={k.id} value={k.id}>
                                          {k.nama}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
                                <p className="font-medium">ℹ️ Akan dicopy:</p>
                                <ul className="list-disc list-inside mt-1 text-xs">
                                  <li>Semua harga default dari produk</li>
                                  <li>Semua harga custom yang sudah diset</li>
                                </ul>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  onClick={handleConfirmDuplicate}
                                  disabled={!duplicateSource}
                                  className="flex-1"
                                >
                                  Duplikat
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsDialogOpen(false)}
                                  className="flex-1"
                                >
                                  Batal
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Link href={`/dashboard/vendor/koperasi/${kop.id}/edit`}>
                          <Button size="icon" variant="outline" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
