import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { TopSelling } from "@/components/top-selling";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reseller Dashboard</h1>
      <div className="my-6">
        <SectionCards
          items={[
            {
              title: "Penjualan Hari Ini",
              value: "Rp.250.00",
            },
            {
              title: "Transaksi Bulan Ini",
              value: "Rp. 5.000.234",
            },
            {
              title: "Penjualan Bulan Ini",
              value: "356",
            },
            {
              title: "Total Saldo",
              value: "Rp. 500.000",
            }
          ]}
        />
      </div>

      <div className="my-6 flex flex-col gap-6 lg:flex-row">
        <TopSelling
          title="Top Selling Produk"
          description="Produk terlaris"
          items={[
            {
              name: "Kaos Polos Premium",
              type: "Produk",
              image: "/images/products/kaos.jpg",
              sold: 120,
              revenue: "Rp. 3.200.000",
            },
            {
              name: "Paket Dropship Gold",
              type: "Paket",
              image: "/images/products/paket.jpg",
              sold: 85,
              revenue: "Rp. 5.500.000",
            },
            {
              name: "Jasa Admin Marketplace",
              type: "Jasa",
              image: "/images/products/jasa.jpg",
              sold: 42,
              revenue: "Rp. 2.100.000",
            },
          ]}
        />
        <TopSelling
          title="Top Customers"
          description="Customers terbaik"
          items={[
            {
              name: "Andi Wijaya",
              type: "Customers",
              image: "/images/users/andi.jpg",
              sold: 15,
              revenue: "Rp. 1.500.000",
            },
            {
              name: "Siti Aminah",
              type: "Customers",
              image: "/images/users/siti.jpg",
              sold: 12,
              revenue: "Rp. 1.200.000",
            },
          ]}
        />
      </div>


      <ChartAreaInteractive />
    </div>
  );
}
