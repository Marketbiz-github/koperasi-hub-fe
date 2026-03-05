"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Truck, Check, Loader2, Package } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { shippingService, gudangService } from "@/services/apiService";
import { getPublicAccessToken as getAccessToken } from "@/utils/auth";
import { toast } from "sonner";

interface ShippingFormProps {
    onSelectRate: (rate: any, warehouseId: number, address: any, notes: string) => void;
    onAddressLocked?: (locked: boolean) => void;
    items: any[];
    storeId: number;
    storeCouriers?: string[] | string | null; // kurir yang terdaftar di toko
}

export default function ShippingForm({ onSelectRate, onAddressLocked, items, storeId, storeCouriers }: ShippingFormProps) {
    const { store, user } = useAuthStore();
    const [address, setAddress] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        province: "",
        city: "",
        district: "",
        subdistrict: "",
        zipcode: "",
        address_detail: "",
        notes: "",
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [rates, setRates] = useState<any[]>([]);
    const [isLoadingRates, setIsLoadingRates] = useState(false);
    const [selectedRateCode, setSelectedRateCode] = useState<string | null>(null);
    const [warehouseId, setWarehouseId] = useState<number | null>(null);
    const [warehouseInfo, setWarehouseInfo] = useState<any>(null);
    const [isLoadingWarehouse, setIsLoadingWarehouse] = useState(false);

    // Auto-populate from user store details
    useEffect(() => {
        if (store || user) {
            setAddress((prev) => ({
                ...prev,
                name: store?.name || prev.name,
                phone: store?.phone || prev.phone,
                address: store?.alamat || prev.address,
                email: user?.email || prev.email,
            }));
        }
    }, [store, user]);

    const handleSearchArea = async () => {
        if (searchQuery.length < 3) return;
        setIsSearching(true);
        try {
            const token = await getAccessToken();
            const res = await shippingService.searchArea(searchQuery, token || undefined);
            setSuggestions(res.data.areas || []);
        } catch (error) {
            console.error("Search Area Error:", error);
        } finally {
            setIsSearching(false);
        }
    };
    const handleSelectSuggestion = (suggestion: any) => {
        // Extract zipcode from name if postal_code is missing or not a simple number
        // Name format: "Denpasar Utara, Denpasar, Bali. 80111"
        let extractedZip = suggestion.postal_code?.toString() || "";
        if ((!extractedZip || extractedZip === "0") && suggestion.name) {
            const match = suggestion.name.match(/\.\s*(\d+)$/);
            if (match) extractedZip = match[1];
        }

        const newAddress = {
            ...address,
            address: suggestion.name,
            province: suggestion.administrative_division_level_1_name,
            city: suggestion.administrative_division_level_2_name,
            district: suggestion.administrative_division_level_3_name,
            subdistrict: suggestion.administrative_division_level_4_name || "",
            zipcode: extractedZip,
        };

        setAddress(newAddress);
        setSuggestions([]);
        setSearchQuery(suggestion.name);

        // Lock cart items
        if (onAddressLocked) onAddressLocked(true);

        // Auto fetch rates
        fetchRates(newAddress);
    };

    const fetchRates = async (overrideAddress?: any) => {
        const addr = overrideAddress || address;
        if (!addr.province || !addr.city || items.length === 0) {
            toast.error("Mohon lengkapi alamat dan pastikan ada item di keranjang");
            return;
        }

        setIsLoadingRates(true);
        try {
            const token = await getAccessToken();
            const payload = {
                store_id: storeId,
                shipping_address: {
                    address: addr.address,
                    province: addr.province,
                    city: addr.city,
                    district: addr.district,
                    subdistrict: addr.subdistrict,
                    zipcode: addr.zipcode,
                },
                items: items.map((it) => ({
                    product_id: parseInt(it.id),
                    product_variant_id: it.variantId || 0,
                    quantity: it.quantity,
                })),
            };

            const res = await shippingService.getRates(payload, token || undefined);
            const allRates = res.data.rates || [];

            // Filter rates berdasarkan storeCouriers jika ada
            const allowedCouriers = Array.isArray(storeCouriers)
                ? storeCouriers
                : typeof storeCouriers === 'string' && storeCouriers
                    ? storeCouriers.split(',')
                    : [];

            const filteredRates = allowedCouriers.length > 0
                ? allRates.filter((rate: any) =>
                    allowedCouriers.some((c: string) => {
                        const normalizedStore = c.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                        const normalizedRate = rate.courier_code?.toLowerCase().replace(/[^a-z0-9]/g, '');
                        return normalizedStore === normalizedRate;
                    })
                )
                : allRates;

            setRates(filteredRates);
            setWarehouseId(res.data.warehouse_id);

            // Fetch warehouse info if warehouse_id is returned
            if (res.data.warehouse_id) {
                fetchWarehouseDetail(res.data.warehouse_id, token || undefined);
            }

            if (filteredRates.length === 0) {
                if (allRates.length > 0 && allowedCouriers.length > 0) {
                    toast.warning("Kurir dari toko ini tidak tersedia untuk wilayah tujuan. (Tersedia di toko: " + allowedCouriers.join(', ') + ")");
                } else {
                    toast.warning("Tidak ada kurir tersedia untuk wilayah ini");
                }
            }
        } catch (error: any) {
            console.error("Fetch Rates Error:", error);
            toast.error(error.message || "Gagal mengambil tarif pengiriman");
        } finally {
            setIsLoadingRates(false);
        }
    };

    const fetchWarehouseDetail = async (id: number, token?: string) => {
        if (!token) return;
        setIsLoadingWarehouse(true);
        try {
            const res = await gudangService.getDetail(token, id);
            setWarehouseInfo(res.data);
        } catch (error) {
            console.error("Fetch Warehouse Detail Error:", error);
        } finally {
            setIsLoadingWarehouse(false);
        }
    };

    const handleRateSelect = (rate: any) => {
        setSelectedRateCode(`${rate.courier_code}-${rate.courier_service_code}`);
        onSelectRate(rate, warehouseId!, address, address.notes);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Pengiriman</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ship-name">Nama Penerima <span className="text-red-500">*</span></Label>
                            <Input
                                id="ship-name"
                                value={address.name}
                                onChange={(e) => setAddress({ ...address, name: e.target.value })}
                                placeholder="Nama Toko / Penerima"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ship-email">Email</Label>
                            <Input
                                id="ship-email"
                                type="email"
                                value={address.email}
                                onChange={(e) => setAddress({ ...address, email: e.target.value })}
                                placeholder="nama@email.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ship-phone">No. Telepon</Label>
                            <Input
                                id="ship-phone"
                                value={address.phone}
                                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                placeholder="0812..."
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="ship-address-detail">Alamat Lengkap <span className="text-red-500">*</span></Label>
                            <Input
                                id="ship-address-detail"
                                value={address.address_detail}
                                onChange={(e) => setAddress({ ...address, address_detail: e.target.value })}
                                placeholder="Jl. Nama Jalan, No. Rumah, RT/RW..."
                                required
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="ship-notes">Catatan Pesanan (Opsional)</Label>
                            <Input
                                id="ship-notes"
                                value={address.notes}
                                onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                                placeholder="Contoh: Titip di satpam / Packing kayu..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <Label>Cari Wilayah (Kecamatan/Kota)</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    className="pl-9"
                                    placeholder="Ketik min. 3 karakter..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearchArea()}
                                />
                            </div>
                            <Button onClick={handleSearchArea} disabled={isSearching}>
                                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cari"}
                            </Button>
                        </div>

                        {suggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                                {suggestions.map((s, idx) => (
                                    <button
                                        key={idx}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b last:border-0"
                                        onClick={() => handleSelectSuggestion(s)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-emerald-600" />
                                            <span>{s.name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {address.province && (
                        <div className="p-3 bg-emerald-50 rounded-lg text-xs space-y-1 border border-emerald-100">
                            <p><strong>Alamat:</strong> {address.address}</p>
                            <div className="flex flex-wrap gap-x-4">
                                <p><strong>Provinsi:</strong> {address.province}</p>
                                <p><strong>Kota:</strong> {address.city}</p>
                                <p><strong>Kecamatan:</strong> {address.district}</p>
                                {address.zipcode && <p><strong>Kodepos:</strong> {address.zipcode}</p>}
                            </div>
                        </div>
                    )}

                    {warehouseInfo && (
                        <div className="p-3 bg-blue-50 rounded-lg text-xs space-y-1 border border-blue-100">
                            <p className="font-semibold text-blue-700 flex items-center gap-1">
                                <Package size={12} /> Informasi Gudang Pengirim
                            </p>
                            <p><strong>Nama Gudang:</strong> {warehouseInfo.nama_gudang}</p>
                            <p><strong>Lokasi:</strong> {warehouseInfo.alamat || warehouseInfo.city}</p>
                        </div>
                    )}

                    {isLoadingRates && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-2 border-2 border-dashed rounded-lg">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                            <p className="text-sm text-gray-500 font-medium">Mencari pilihan kurir...</p>
                        </div>
                    )}

                    {!isLoadingRates && rates.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <Label>Pilih Layanan Kurir</Label>
                            <div className="grid gap-2">
                                {rates.map((rate, idx) => {
                                    const code = `${rate.courier_code}-${rate.courier_service_code}`;
                                    const isSelected = selectedRateCode === code;
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${isSelected ? "border-emerald-600 bg-emerald-50" : "hover:bg-gray-50"
                                                }`}
                                            onClick={() => handleRateSelect(rate)}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold uppercase text-sm">{rate.courier_name}</p>
                                                    <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded text-gray-700 font-medium">
                                                        {rate.courier_service_name}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">Estimasi: {rate.duration}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-emerald-600">Rp{rate.price.toLocaleString("id-ID")}</p>
                                                {isSelected && <Check className="h-4 w-4 text-emerald-600 ml-auto mt-1" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
