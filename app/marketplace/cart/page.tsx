'use client';

import Link from 'next/link';
import { useState } from 'react';
import CartItem from '../components/CartItem';
import { useCartStore } from '@/store/cartStore';
import { useMounted } from '@/hooks/useMounted';
import { Search, X, CreditCard, Clock, CheckCircle2, Loader2, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const mounted = useMounted();

  const items = useCartStore((s) => s.items);
  const selectedItems = useCartStore((s) => s.selectedItems);
  const total = useCartStore((s) => s.selectedTotalPrice)();
  const clearCart = useCartStore((s) => s.clearCart);
  const selectAll = useCartStore((s) => s.selectAll);
  const removeItems = useCartStore((s) => s.removeItems);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentCategory, setPaymentCategory] = useState<"instant" | "piutang">("instant");
  const [checkoutSuccessData, setCheckoutSuccessData] = useState<{ orderId: number, paymentUrl: string | null } | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Update shipping cost based on kurir selection
    if (name === 'kurir') {
      switch (value) {
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

  const handleCheckout = async () => {
    if (selectedItems.size === 0) {
      toast.error("Pilih minimal satu item untuk checkout");
      return;
    }

    if (!formData.nama || !formData.alamatLengkap || !formData.kurir || !formData.area) {
      toast.error("Mohon lengkapi data diri dan informasi pengiriman");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCartItems = items.filter(it => selectedItems.has(it.id));

      const orderData = {
        store_id: selectedCartItems[0]?.storeId || 1,
        shipping_address: {
          name: formData.nama,
          email: formData.email,
          phone: formData.noTelp,
          address: formData.alamatLengkap,
          province: formData.area.split(', ')[2] || '',
          city: formData.area.split(', ')[1] || '',
          district: formData.area.split(', ')[0] || '',
          subdistrict: '',
          zipcode: ''
        },
        items: selectedCartItems.map(item => ({
          product_id: parseInt(item.id),
          product_variant_id: item.variantId || 0,
          quantity: item.quantity
        })),
        shipping_cost: shippingCost,
        courier_name: formData.kurir.toUpperCase(),
        courier_code: formData.kurir,
        courier_service: 'REG',
        warehouse_id: 1,
        customer_notes: note,
        payment_category: paymentCategory,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal membuat pesanan");
      }

      toast.success("Pesanan berhasil dibuat!");

      if (paymentCategory === "instant" && result.data?.payment_url) {
        window.open(result.data.payment_url, '_blank');
        setCheckoutSuccessData({
          orderId: result.data?.order?.id || 0,
          paymentUrl: result.data.payment_url
        });
      } else {
        setCheckoutSuccessData({
          orderId: result.data?.order?.id || result.data?.id || 0,
          paymentUrl: null
        });
      }

      // Remove selected items from cart AFTER showing modal/redirect
      removeItems(Array.from(selectedItems));
    } catch (error: any) {
      console.error("Checkout Error:", error);
      toast.error(error.message || "Terjadi kesalahan saat checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAllSelected = items.length > 0 && items.every(it => selectedItems.has(it.id));

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat keranjang...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 py-12">
      {/* Success Modal */}
      {checkoutSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md bg-white shadow-xl animate-in zoom-in-95 fade-in-0">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-xl">Pesanan Berhasil!</CardTitle>
              <div className="text-sm text-gray-500 mt-2">
                {checkoutSuccessData.paymentUrl ? (
                  <p>Silahkan selesaikan pembayaran Instan Anda.</p>
                ) : (
                  <p>Pesanan Piutang Anda sedang menunggu approval dari Admin/Vendor.</p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {checkoutSuccessData.paymentUrl && (
                <Button
                  onClick={() => {
                    if (checkoutSuccessData.paymentUrl) {
                      window.open(checkoutSuccessData.paymentUrl, '_blank')
                    }
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
                >
                  Lanjut Bayar
                </Button>
              )}
              <Link href="/dashboard/reseller/marketplace/pembelian" className="block w-full">
                <Button variant="outline" className="w-full h-11" onClick={() => setCheckoutSuccessData(null)}>
                  Lihat Pesanan
                </Button>
              </Link>
              <div className="block w-full text-center mt-2">
                <button onClick={() => setCheckoutSuccessData(null)} className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4">
                  Tetap di Keranjang
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Keranjang Belanja</h1>
          <Link href="/marketplace" className="text-[#2F5755] hover:text-[#10b981]">Lanjut Belanja</Link>
        </div>


        {items.length === 0 ? (
          <div className="bg-white p-8 rounded-lg text-center">
            <div className="text-gray-600">Keranjangmu masih kosong.</div>
            <Link href="/marketplace" className="inline-block mt-4 bg-[#10b981] text-white px-5 py-2 rounded-lg">Kembali ke toko</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Select All */}
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={isAllSelected}
                    onChange={(e) => selectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#10b981] focus:ring-[#10b981] cursor-pointer"
                  />
                  <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">Pilih Semua ({items.length})</label>
                </div>
                {selectedItems.size > 0 && (
                  <button
                    onClick={() => removeItems(Array.from(selectedItems))}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Hapus Terpilih
                  </button>
                )}
              </div>

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

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-4">Metode Pembayaran</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setPaymentCategory("instant")}
                    className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${paymentCategory === "instant" ? "border-[#10b981] bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="mt-1">
                      {paymentCategory === "instant" ? (
                        <CheckCircle2 size={16} className="text-[#10b981]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium">
                        <CreditCard size={16} className={paymentCategory === "instant" ? "text-[#10b981]" : "text-gray-500"} />
                        <span>Pembayaran Instan</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">Bayar sekarang menggunakan iPaymu</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentCategory("piutang")}
                    className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${paymentCategory === "piutang" ? "border-[#10b981] bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="mt-1">
                      {paymentCategory === "piutang" ? (
                        <CheckCircle2 size={16} className="text-[#10b981]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium">
                        <Clock size={16} className={paymentCategory === "piutang" ? "text-[#10b981]" : "text-gray-500"} />
                        <span>Bayar Piutang</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">Ajukan pembayaran kredit (Membutuhkan Approval)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ringkasan Pesanan */}
            <aside className="bg-white p-6 rounded-lg shadow-sm h-max">
              <h3 className="font-bold text-lg mb-4">Ringkasan Pesanan</h3>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Jumlah item terpilih</span>
                  <span className="font-medium">{selectedItems.size}</span>
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

              <Button
                onClick={handleCheckout}
                disabled={selectedItems.size === 0 || isSubmitting}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-6 rounded-lg font-medium mb-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  paymentCategory === "instant" ? "Bayar Sekarang" : "Ajukan Pesanan"
                )}
              </Button>
              <button onClick={() => clearCart()} className="w-full border border-gray-200 py-2 rounded-lg text-gray-700 hover:bg-gray-50">Kosongkan Keranjang</button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
