"use client"

import { useState } from "react"
import Image from "next/image"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Share2, Flame, Star } from "lucide-react"
import { useCartStore } from "@/store/cartStore"

interface Vendor {
  id: string
  nama: string
  image: string
  rating: number
}

interface Product {
  id: string
  nama: string
  kategori: string
  harga: string
  hargaNumber: number
  gambar: string
  badge?: string
  vendorId: string
}

const vendors: Vendor[] = [
  {
    id: "vendor-1",
    nama: "Vendor Beras Premium",
    image: "/images/products/beras.png",
    rating: 4.8,
  },
  {
    id: "vendor-2",
    nama: "Vendor Sayuran Segar",
    image: "/images/products/beras.png",
    rating: 4.5,
  },
  {
    id: "vendor-3",
    nama: "Vendor Buah Organik",
    image: "/images/products/beras.png",
    rating: 4.7,
  },
]

const productsData: Record<string, Product[]> = {
  "vendor-1": [
    {
      id: "prod-1",
      nama: "Beras Premium 5kg",
      kategori: "Beras",
      harga: "Rp 150.000",
      hargaNumber: 150000,
      gambar: "/images/products/beras.png",
      badge: "Best Seller",
      vendorId: "vendor-1",
    },
    {
      id: "prod-2",
      nama: "Beras Organik 10kg",
      kategori: "Beras",
      harga: "Rp 250.000",
      hargaNumber: 250000,
      gambar: "/images/products/beras.png",
      vendorId: "vendor-1",
    },
    {
      id: "prod-3",
      nama: "Beras Merah 5kg",
      kategori: "Beras",
      harga: "Rp 120.000",
      hargaNumber: 120000,
      gambar: "/images/products/beras.png",
      vendorId: "vendor-1",
    },
  ],
  "vendor-2": [
    {
      id: "prod-4",
      nama: "Kangkung Segar 1kg",
      kategori: "Sayuran",
      harga: "Rp 15.000",
      hargaNumber: 15000,
      gambar: "/images/products/beras.png",
      badge: "Fresh",
      vendorId: "vendor-2",
    },
    {
      id: "prod-5",
      nama: "Bayam Organik 500g",
      kategori: "Sayuran",
      harga: "Rp 20.000",
      hargaNumber: 20000,
      gambar: "/images/products/beras.png",
      vendorId: "vendor-2",
    },
    {
      id: "prod-6",
      nama: "Tomat Merah 2kg",
      kategori: "Sayuran",
      harga: "Rp 30.000",
      hargaNumber: 30000,
      gambar: "/images/products/beras.png",
      vendorId: "vendor-2",
    },
  ],
  "vendor-3": [
    {
      id: "prod-7",
      nama: "Jeruk Nipis 2kg",
      kategori: "Buah",
      harga: "Rp 35.000",
      hargaNumber: 35000,
      gambar: "/images/products/beras.png",
      badge: "Segar",
      vendorId: "vendor-3",
    },
    {
      id: "prod-8",
      nama: "Mangga Harum Manis 5kg",
      kategori: "Buah",
      harga: "Rp 60.000",
      hargaNumber: 60000,
      gambar: "/images/products/beras.png",
      vendorId: "vendor-3",
    },
    {
      id: "prod-9",
      nama: "Pisang Emas 3kg",
      kategori: "Buah",
      harga: "Rp 25.000",
      hargaNumber: 25000,
      gambar: "/images/products/beras.png",
      vendorId: "vendor-3",
    },
  ],
}

// Featured & Flash Sale Products
const featuredProducts: Product[] = [
  {
    id: "featured-1",
    nama: "Beras Premium 5kg",
    kategori: "Beras",
    harga: "Rp 150.000",
    hargaNumber: 150000,
    gambar: "/images/products/beras.png",
    badge: "Unggulan",
    vendorId: "vendor-1",
  },
  {
    id: "featured-2",
    nama: "Bayam Organik 500g",
    kategori: "Sayuran",
    harga: "Rp 20.000",
    hargaNumber: 20000,
    gambar: "/images/products/beras.png",
    badge: "Unggulan",
    vendorId: "vendor-2",
  },
  {
    id: "featured-3",
    nama: "Mangga Harum Manis 5kg",
    kategori: "Buah",
    harga: "Rp 60.000",
    hargaNumber: 60000,
    gambar: "/images/products/beras.png",
    badge: "Unggulan",
    vendorId: "vendor-3",
  },
]

const flashSaleProducts: Product[] = [
  {
    id: "flash-1",
    nama: "Beras Organik 10kg",
    kategori: "Beras",
    harga: "Rp 200.000",
    hargaNumber: 200000,
    gambar: "/images/products/beras.png",
    badge: "Flash Sale 30%",
    vendorId: "vendor-1",
  },
  {
    id: "flash-2",
    nama: "Tomat Merah 2kg",
    kategori: "Sayuran",
    harga: "Rp 20.000",
    hargaNumber: 20000,
    gambar: "/images/products/beras.png",
    badge: "Flash Sale 50%",
    vendorId: "vendor-2",
  },
  {
    id: "flash-3",
    nama: "Jeruk Nipis 2kg",
    kategori: "Buah",
    harga: "Rp 25.000",
    hargaNumber: 25000,
    gambar: "/images/products/beras.png",
    badge: "Flash Sale 25%",
    vendorId: "vendor-3",
  },
  {
    id: "flash-4",
    nama: "Pisang Emas 3kg",
    kategori: "Buah",
    harga: "Rp 18.000",
    hargaNumber: 18000,
    gambar: "/images/products/beras.png",
    badge: "Flash Sale 40%",
    vendorId: "vendor-3",
  },
]

function ProductCardComponent({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.nama,
      price: product.hargaNumber,
      image: product.gambar,
      category: product.kategori,
      quantity: 1,
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <div className="relative h-40 bg-gray-100 overflow-hidden group">
        {product.badge && (
          <Badge className="absolute top-2 left-2 z-10 bg-red-500">
            {product.badge}
          </Badge>
        )}
        <Image
          src={product.gambar}
          alt={product.nama}
          fill
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <p className="text-xs text-gray-500 mb-1">{product.kategori}</p>
        <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">
          {product.nama}
        </h3>
        <p className="text-base font-bold text-emerald-600 mb-3">
          {product.harga}
        </p>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition text-sm"
          >
            <ShoppingCart size={14} />
            Tambah
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 transition">
            <Share2 size={14} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MarketplaceVendorPage() {
  const [selectedVendor, setSelectedVendor] = useState<string>("vendor-1")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const cartItems = useCartStore((s) => s.items)

  const currentVendor = vendors.find((v) => v.id === selectedVendor)
  const currentProducts = productsData[selectedVendor] || []
  const filteredProducts = currentProducts.filter((p) =>
    p.nama.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Marketplace Pembelian</h1>
            <p className="text-sm text-gray-500 mt-1">Dashboard Koperasi - Belanja Produk dari Vendor</p>
          </div>
          <Link href="/dashboard/koperasi/marketplace/cart">
            <Button variant="outline" className="relative">
              <ShoppingCart size={18} />
              Keranjang
              {cartItems.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500">
                  {cartItems.length}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Flash Sale Section */}
      <Card className="border-2 border-red-200 bg-linear-to-r from-red-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Flame className="text-red-600" size={24} />
            <CardTitle className="text-red-600">Flash Sale</CardTitle>
          </div>
          <CardDescription>Penawaran terbatas, jangan sampai terlewat!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {flashSaleProducts.map((product) => (
              <ProductCardComponent key={product.id} product={product} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Featured Products Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="text-yellow-500" size={24} />
            <CardTitle>Produk Unggulan</CardTitle>
          </div>
          <CardDescription>Produk pilihan dengan kualitas terbaik</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredProducts.map((product) => (
              <ProductCardComponent key={product.id} product={product} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vendor Selection & Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Vendor untuk Berbelanja</CardTitle>
          <CardDescription>Lihat dan pilih produk dari vendor terpercaya</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Vendor</label>
            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.nama} ({vendor.rating} ⭐)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentVendor && (
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Image
                src={currentVendor.image}
                alt={currentVendor.nama}
                width={80}
                height={80}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{currentVendor.nama}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-500 font-semibold">
                    {currentVendor.rating} ⭐
                  </span>
                  <span className="text-sm text-gray-600">
                    {filteredProducts.length} produk tersedia
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Cari Produk</label>
            <Input
              placeholder="Cari nama produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Produk {currentVendor?.nama}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCardComponent key={product.id} product={product} />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {searchQuery
                ? "Produk tidak ditemukan"
                : "Pilih vendor untuk melihat produk"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
