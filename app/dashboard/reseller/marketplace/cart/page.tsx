"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, ChevronLeft, ShoppingCart } from "lucide-react"
import { useCartStore } from "@/store/cartStore"

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore()
  const [coupon, setCoupon] = useState("")

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.1)
  const total = subtotal + tax

  const formatCurrency = (value: number) => {
    return `Rp${value.toLocaleString("id-ID")}`
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/koperasi/marketplace">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Keranjang Belanja Koperasi</h1>
            <p className="text-sm text-gray-500">Lihat dan kelola pesanan Anda</p>
          </div>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">Keranjang Anda kosong</p>
            <Link href="/dashboard/koperasi/marketplace">
              <Button>Mulai Belanja</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/koperasi/marketplace">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Keranjang Belanja Koperasi</h1>
          <p className="text-sm text-gray-500">Lihat dan kelola pesanan Anda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Item Keranjang ({items.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                >
                  {/* Product Image */}
                  <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                    <p className="font-bold text-emerald-600">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col justify-between items-end">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="flex items-center border rounded-lg bg-gray-50">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>

              {/* Tax */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Pajak (10%)</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>

              {/* Coupon Section */}
              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-2 block">
                  Kode Promo
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Masukkan kode promo"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  <Button variant="outline" size="sm">
                    Terapkan
                  </Button>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-xl text-emerald-600">
                  {formatCurrency(total)}
                </span>
              </div>

              {/* Checkout Button */}
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-base py-6">
                Lanjut ke Pembayaran
              </Button>

              {/* Continue Shopping */}
              <Link href="/dashboard/koperasi/marketplace" className="block">
                <Button variant="outline" className="w-full">
                  Lanjut Belanja
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pengiriman</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Estimasi Tiba</p>
                <p className="font-semibold">2-3 hari kerja</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Biaya Ongkos</p>
                <p className="font-semibold text-emerald-600">Gratis Ongkir</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
