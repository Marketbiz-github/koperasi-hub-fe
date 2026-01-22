'use client'

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, FileText } from 'lucide-react'

const STATUS_TABS = [
  { key: 'belum-bayar', label: 'Belum Bayar', count: 0 },
  { key: 'dibayar', label: 'Dibayar', count: 1 },
  { key: 'dikirim', label: 'Dikirim', count: 0 },
  { key: 'diterima', label: 'Diterima', count: 0 },
  { key: 'dibatalkan', label: 'Dibatalkan', count: 0 },
]

export default function PenjualanPage() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-xl font-semibold">Penjualan</h1>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input placeholder="ID Order" />
          <Input placeholder="ID iPaymu" />

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Menunggu Pembayaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="menunggu">Menunggu Pembayaran</SelectItem>
              <SelectItem value="dibayar">Dibayar</SelectItem>
              <SelectItem value="dikirim">Dikirim</SelectItem>
            </SelectContent>
          </Select>

          <Input placeholder="Mulai" />

          <Input placeholder="Sampai" />

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Urutkan Berdasarkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="terbaru">Terbaru</SelectItem>
              <SelectItem value="terlama">Terlama</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-end gap-2">
            <Button variant="secondary" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon">
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 text-center space-y-1">
            <div className="text-2xl font-semibold">0</div>
            <p className="text-sm text-muted-foreground">
              Jumlah Transaksi Belum Bayar
            </p>
            <div className="mt-4 bg-black text-white py-2 rounded-md text-sm">
              Jumlah Transaksi
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center space-y-1">
            <div className="text-2xl font-semibold">Rp 0</div>
            <p className="text-sm text-muted-foreground">
              Total Penjualan Belum Bayar
            </p>
            <div className="mt-4 bg-black text-white py-2 rounded-md text-sm">
              Total Penjualan
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + Table */}
      <Tabs defaultValue="belum-bayar" className="w-full">
        <TabsList className="flex flex-wrap gap-2 justify-start">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="gap-2">
              {tab.label}
              <Badge variant="secondary">{tab.count}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map((tab) => (
          <TabsContent key={tab.key} value={tab.key}>
            <Card>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>iPaymu ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Opsi</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground py-10"
                      >
                        Tidak ada data ditampilkan
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
