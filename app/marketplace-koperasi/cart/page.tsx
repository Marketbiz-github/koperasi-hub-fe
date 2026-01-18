'use client';

import Link from 'next/link';
import { useState } from 'react';
import CartItem from '../components/CartItem';
import { useCartStore } from '@/store/cartStore';
import { useMounted } from '@/hooks/useMounted';
import { Search, X } from 'lucide-react';

export default function CartPage() {
  const mounted = useMounted();

  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.totalPrice)();
  const clearCart = useCartStore((s) => s.clearCart);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    noTelp: '',
    areaSearch: '',
    area: '',
    alamatLengkap: '',
    gudang: '',
    kurir: '',
  });

  const [shippingCost, setShippingCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState('');
  const [voucher, setVoucher] = useState('');
  const [areaOptions, setAreaOptions] = useState<string[]>([]);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Update shipping cost based on kurir selection
    if (name === 'kurir') {
      switch(value) {
        case 'jne':
          setShippingCost(25000);
          break;
        case 'gojek':
          setShippingCost(30000);
          break;
        case 'grab':
          setShippingCost(28000);
          break;
        case 'pos':
          setShippingCost(20000);
          break;
        default:
          setShippingCost(0);
      }
    }
  };

  const handleAreaSearch = (value: string) => {
    setFormData(prev => ({ ...prev, areaSearch: value }));
    // Mock data - replace dengan API call
    if (value.length > 0) {
      const mockAreas = ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Barat', 'Jakarta Utara', 'Tangerang', 'Bogor'].filter(
        area => area.toLowerCase().includes(value.toLowerCase())
      );
      setAreaOptions(mockAreas);
      setShowAreaDropdown(true);
    } else {
      setAreaOptions([]);
      setShowAreaDropdown(false);
    }
  };

  const handleSelectArea = (area: string) => {
    setFormData(prev => ({ ...prev, area, areaSearch: '' }));
    setShowAreaDropdown(false);
  };

  const handleApplyVoucher = () => {
    // Mock voucher logic
    if (voucher.toUpperCase() === 'DISKON10') {
      const discountAmount = Math.floor(total * 0.1);
      setDiscount(discountAmount);
    } else if (voucher.toUpperCase() === 'DISKON20') {
      const discountAmount = Math.floor(total * 0.2);
      setDiscount(discountAmount);
    } else {
      alert('Voucher tidak valid');
      setDiscount(0);
    }
  };

  const calculateFinalTotal = () => {
    return total + shippingCost - discount;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat keranjang...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Keranjang Belanja</h1>
          <Link href="/marketplace-koperasi" className="text-[#2F5755] hover:text-[#10b981]">Lanjut Belanja</Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white p-8 rounded-lg text-center">
            <div className="text-gray-600">Keranjangmu masih kosong.</div>
            <Link href="/marketplace-koperasi" className="inline-block mt-4 bg-[#10b981] text-white px-5 py-2 rounded-lg">Kembali ke toko</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Items */}
              <div className="space-y-4">
                {items.map((it) => (
                  <CartItem key={it.id} item={it} />
                ))}
              </div>

              {/* Form Data Diri */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-4">Data Diri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="nama"
                    placeholder="Nama Lengkap"
                    value={formData.nama}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#10b981] outline-none"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#10b981] outline-none"
                  />
                  <input
                    type="tel"
                    name="noTelp"
                    placeholder="Nomor Telepon"
                    value={formData.noTelp}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#10b981] outline-none md:col-span-2"
                  />
                </div>
              </div>

              {/* Form Pengiriman */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-4">Pengiriman</h3>
                
                {/* Area Search */}
                <div className="mb-4 relative">
                  <label className="text-sm text-gray-600 block mb-2">Cari Area</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Cari area..."
                      value={formData.areaSearch}
                      onChange={(e) => handleAreaSearch(e.target.value)}
                      className="w-full border rounded-lg px-10 py-2 focus:ring-2 focus:ring-[#10b981] outline-none"
                    />
                  </div>
                  
                  {/* Area Dropdown */}
                  {showAreaDropdown && areaOptions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-t-0 rounded-b-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {areaOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSelectArea(option)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Area */}
                {formData.area && (
                  <div className="mb-4 flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">{formData.area}</span>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, area: '' }))}
                      className="ml-auto text-blue-600 hover:text-blue-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <textarea
                    name="alamatLengkap"
                    placeholder="Alamat Lengkap"
                    value={formData.alamatLengkap}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#10b981] outline-none md:col-span-2"
                  />
                  
                  <select
                    name="gudang"
                    value={formData.gudang}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#10b981] outline-none"
                  >
                    <option value="">Pilih Gudang</option>
                    <option value="gudang-jakarta">Gudang Jakarta</option>
                    <option value="gudang-surabaya">Gudang Surabaya</option>
                    <option value="gudang-bandung">Gudang Bandung</option>
                    <option value="gudang-medan">Gudang Medan</option>
                  </select>

                  <select
                    name="kurir"
                    value={formData.kurir}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#10b981] outline-none"
                  >
                    <option value="">Pilih Kurir</option>
                    <option value="jne">JNE - Rp 25.000</option>
                    <option value="gojek">Gojek - Rp 30.000</option>
                    <option value="grab">Grab - Rp 28.000</option>
                    <option value="pos">POS Indonesia - Rp 20.000</option>
                  </select>
                </div>

                {/* Update shipping cost berdasarkan kurir */}
              </div>

              {/* Note */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-4">Catatan</h3>
                <textarea
                  placeholder="Tambahkan catatan untuk penjual (opsional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#10b981] outline-none"
                />
              </div>

              {/* Voucher */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-4">Kode Voucher</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan kode voucher"
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value.toUpperCase())}
                    className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#10b981] outline-none"
                  />
                  <button
                    onClick={handleApplyVoucher}
                    className="bg-[#2F5755] hover:bg-[#244746] text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Terapkan
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Coba: DISKON10 atau DISKON20</p>
              </div>
            </div>

            {/* Ringkasan Pesanan */}
            <aside className="bg-white p-6 rounded-lg shadow-sm h-max">
              <h3 className="font-bold text-lg mb-4">Ringkasan Pesanan</h3>
              
              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Jumlah item</span>
                  <span className="font-medium">{items.reduce((s, i) => s + i.quantity, 0)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rp {total.toLocaleString('id-ID')}</span>
                </div>

                {shippingCost > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ongkir</span>
                    <span className="font-medium">Rp {shippingCost.toLocaleString('id-ID')}</span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Potongan Diskon</span>
                    <span className="font-medium text-red-600">-Rp {discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-6 pt-2">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-xl text-[#10b981]">Rp {calculateFinalTotal().toLocaleString('id-ID')}</span>
              </div>

              <button className="w-full bg-[#2F5755] hover:bg-[#244746] text-white py-3 rounded-lg font-medium mb-2">Checkout</button>
              <button onClick={() => clearCart()} className="w-full border border-gray-200 py-2 rounded-lg text-gray-700 hover:bg-gray-50">Kosongkan Keranjang</button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
