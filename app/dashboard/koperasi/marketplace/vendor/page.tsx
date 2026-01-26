'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Star,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  ShoppingBag,
  TrendingUp,
  Search,
} from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  image: string;
  rating: number;
  totalReviews: number;
  products: number;
  location: string;
  phone: string;
  email: string;
  whatsapp: string;
  status: 'active' | 'inactive';
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
}

const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Vendor Beras Premium',
    image: '/images/products/beras.png',
    rating: 4.8,
    totalReviews: 156,
    products: 12,
    location: 'Bandung, Jawa Barat',
    phone: '+62-274-1234567',
    email: 'info@berasepremium.com',
    whatsapp: '62895123456789',
    status: 'active',
    joinDate: '2024-01-15',
    totalOrders: 24,
    totalSpent: 18500000,
  },
  {
    id: '2',
    name: 'Vendor Sayuran Segar',
    image: '/images/products/beras.png',
    rating: 4.5,
    totalReviews: 98,
    products: 18,
    location: 'Jakarta, DKI Jakarta',
    phone: '+62-21-5678901',
    email: 'sales@sayuransegar.com',
    whatsapp: '62812345678901',
    status: 'active',
    joinDate: '2024-02-20',
    totalOrders: 15,
    totalSpent: 9750000,
  },
  {
    id: '3',
    name: 'Vendor Buah Organik',
    image: '/images/products/beras.png',
    rating: 4.7,
    totalReviews: 203,
    products: 24,
    location: 'Yogyakarta, DI Yogyakarta',
    phone: '+62-274-9876543',
    email: 'hello@buahorganik.id',
    whatsapp: '62898765432109',
    status: 'active',
    joinDate: '2023-12-10',
    totalOrders: 32,
    totalSpent: 28900000,
  },
  {
    id: '4',
    name: 'Vendor Kebutuhan Pokok',
    image: '/images/products/beras.png',
    rating: 4.3,
    totalReviews: 67,
    products: 8,
    location: 'Surabaya, Jawa Timur',
    phone: '+62-31-4567890',
    email: 'contact@kebutuhranpokok.com',
    whatsapp: '62856543210987',
    status: 'inactive',
    joinDate: '2024-03-05',
    totalOrders: 8,
    totalSpent: 5200000,
  },
];

export default function VendorPage() {
  const [vendors] = useState<Vendor[]>(mockVendors);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeVendors = vendors.filter((v) => v.status === 'active').length;
  const totalOrders = vendors.reduce((sum, v) => sum + v.totalOrders, 0);
  const totalSpent = vendors.reduce((sum, v) => sum + v.totalSpent, 0);

  const formatCurrency = (value: number) => {
    return `Rp${value.toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Daftar Vendor</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola vendor yang bekerja sama dengan koperasi Anda
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vendor Aktif</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {activeVendors}
                </p>
              </div>
              <div className="w-12 h-12 gradient-green rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pesanan</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pengeluaran</p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Cari Vendor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Cari nama vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVendors.map((vendor) => (
          <Card key={vendor.id} className="hover:shadow-lg transition">
            <CardContent className="pt-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b">
                <div className="flex items-start gap-4 flex-1">
                  <Image
                    src={vendor.image}
                    alt={vendor.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {vendor.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">
                          {vendor.rating}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        ({vendor.totalReviews} review)
                      </span>
                    </div>
                    <Badge
                      className={
                        vendor.status === 'active'
                          ? 'bg-green-100 text-green-800 border-0'
                          : 'bg-gray-100 text-gray-800 border-0'
                      }
                    >
                      {vendor.status === 'active' ? '🟢 Aktif' : '⚫ Tidak Aktif'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{vendor.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <ShoppingBag className="w-4 h-4 text-gray-400" />
                  <span>{vendor.products} produk tersedia</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 py-3 px-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Pesanan</p>
                  <p className="font-bold text-gray-900">{vendor.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Pengeluaran</p>
                  <p className="font-bold text-green-600">
                    {formatCurrency(vendor.totalSpent)}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  title={vendor.phone}
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">Telepon</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  title={vendor.email}
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Email</span>
                </Button>
                <Button
                  size="sm"
                  className="gradient-green text-white flex-1 gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Chat</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Vendor tidak ditemukan</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
