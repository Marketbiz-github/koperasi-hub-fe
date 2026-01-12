'use client';

import Header from './components/Header';
import Footer from './components/Footer';
import Filter from './components/Filter';
import ProductCard from './components/ProductCard';
import LogoCarousel from './components/LogoCarousel';

export default function Home() {

  const products = Array(12).fill({
    name: 'Beras',
    category: 'Bulog',
    price: 'Rp 100.000',
    badge: 'Best',
    image: '/products/beras.jpg'
  });

  const logos = [
    '/logos/logo-1.png',
    '/logos/logo-2.png',
    '/logos/logo-3.png',
    '/logos/logo-4.png',
    '/logos/logo-5.png',
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 flex flex-col">
      <Header />

      <div className="max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Bangun Kerjasama<br />dengan Vendor Ternama
            </h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Koperasi Anda bisa bekerja langsung dengan brand besar. Temukan vendor
              yang sesuai kebutuhan koperasi Anda dengan cepat
            </p>

            {/* Vendor Search */}
            <div className="max-w-xl mx-auto mb-12">
              <div className="relative">
                <input type="text" placeholder="cari vendor..." className="w-full px-6 py-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] text-gray-800 bg-white" />
              </div>
            </div>

            {/* Logo Partners */}
            <div className="max-w-3xl mx-auto mt-12">
              <LogoCarousel logos={logos} />
            </div>

          </div>
        </section>

        {/* Main Content */}
        <main className="grow">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <Filter />

              <div className="grow">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product, index) => (
                    <ProductCard key={index} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center space-x-4 mt-12">
                  <button className="px-4 py-2 text-gray-600 hover:text-[#10b981] transition">prev</button>
                  <button className="px-4 py-2 bg-[#10b981] text-white rounded-lg font-semibold">1</button>
                  <button className="px-4 py-2 text-gray-600 hover:text-[#10b981] transition">2</button>
                  <span className="px-2 text-gray-600">...</span>
                  <button className="px-4 py-2 text-gray-600 hover:text-[#10b981] transition">4</button>
                  <button className="px-4 py-2 text-gray-600 hover:text-[#10b981] transition">next</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}