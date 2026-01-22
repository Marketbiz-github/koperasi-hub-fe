"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
// import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Upload, Pencil, Trash2, DollarSign } from "lucide-react"

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      {/* INFO */}
      {/* <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Untuk melakukan promosi, anda harus mengatur pembagian fee
          Social Dropshipper pada setiap produk.
        </AlertDescription>
      </Alert> */}

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-2">
        <a href="/dashboard/vendor/produk/tambah">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </a>

        <Button variant="secondary">
          <Upload className="mr-2 h-4 w-4" />
          Import Produk
        </Button>
      </div>

      {/* FILTER */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <Input placeholder="Nama produk" />

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="food">Food</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nama</SelectItem>
                <SelectItem value="price">Harga</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Secara" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">ASC</SelectItem>
                <SelectItem value="desc">DESC</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button className="flex-1">Cari</Button>
              <Button variant="outline" className="flex-1">
                Bersihkan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABLE PRODUK */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            Produk yang tersedia di toko anda
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  Opsi
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>Jeruk Orange 1KG</TableCell>
                <TableCell>Food</TableCell>
                <TableCell>30</TableCell>
                <TableCell>Rp50.000</TableCell>
                <TableCell>
                  <Badge>Aktif</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <a href="/dashboard/vendor/produk/1/atur-harga">
                    <Button
                      size="icon"
                      variant="outline"
                      title="Atur harga koperasi"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  </a>
                  <Button size="icon" variant="outline">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>Mangga Manis 1KG</TableCell>
                <TableCell>Food</TableCell>
                <TableCell>29</TableCell>
                <TableCell>Rp40.000</TableCell>
                <TableCell>
                  <Badge>Aktif</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <a href="/dashboard/vendor/produk/2/atur-harga">
                    <Button
                      size="icon"
                      variant="outline"
                      title="Atur harga koperasi"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  </a>
                  <Button size="icon" variant="outline">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PRODUK DIPROMOSIKAN */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Produk yang dipromosikan</CardTitle>
          <CardDescription>
            Produk yang sedang aktif dipromosikan
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="py-8 text-center text-sm text-muted-foreground">
            Tidak ada data ditampilkan
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}
