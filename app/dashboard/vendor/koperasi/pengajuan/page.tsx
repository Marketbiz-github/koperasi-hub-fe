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
import { Eye, CheckCircle, XCircle } from "lucide-react"

interface Pengajuan {
  id: string
  nama: string
  jenis: string
  status: "Menunggu" | "Disetujui" | "Ditolak"
  tanggal: string
}

export default function PengajuanPage() {
  const [pengajuanList] = useState<Pengajuan[]>([
    {
      id: "1",
      nama: "Koperasi Sejahtera",
      jenis: "Pendaftaran Koperasi",
      status: "Menunggu",
      tanggal: "2024-04-01",
    },
    {
      id: "2",
      nama: "Koperasi Maju Jaya",
      jenis: "Upgrade Fitur",
      status: "Menunggu",
      tanggal: "2024-04-03",
    },
    {
      id: "3",
      nama: "Koperasi Bersama",
      jenis: "Pendaftaran Koperasi",
      status: "Ditolak",
      tanggal: "2024-04-05",
    },
  ])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const statusBadge = (status: Pengajuan["status"]) => {
    switch (status) {
      case "Disetujui":
        return <Badge variant="default">Disetujui</Badge>
      case "Ditolak":
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge variant="secondary">Menunggu</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pengajuan</h1>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <Input placeholder="Cari nama pengaju" />

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Jenis Pengajuan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="pendaftaran">
                  Pendaftaran Koperasi
                </SelectItem>
                <SelectItem value="upgrade">Upgrade Fitur</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="menunggu">Menunggu</SelectItem>
                <SelectItem value="disetujui">Disetujui</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengajuan</CardTitle>
          <CardDescription>
            Pengajuan yang masuk dan menunggu proses
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Opsi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {pengajuanList.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {item.nama}
                    </TableCell>
                    <TableCell>{item.jenis}</TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell>{formatDate(item.tanggal)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/super_admin/pengajuan/${item.id}`}
                        >
                          <Button
                            size="icon"
                            variant="outline"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        {item.status === "Menunggu" && (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              title="Setujui"
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="outline"
                              title="Tolak"
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {pengajuanList.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-10"
                    >
                      Tidak ada data ditampilkan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
