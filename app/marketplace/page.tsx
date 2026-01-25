'use client';

import Header from './components/Header';
import Footer from './components/Footer';
import Filter from './components/Filter';
import ProductCard from './components/ProductCard';
import BannerCarousel from './components/BannerCarousel';

type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  badge?: string;
  image: string;
  description?: string;
  rating?: number;
  reviews?: number;
  sold?: number;
  owner: {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviews: number;
    verified: boolean;
    address?: string;
    phone?: string;
  };
};

export default function Home() {
  // Mock store owner
  const storeOwner = {
    id: 'toko-beras-premium',
    name: 'Toko Beras Premium',
    image: '/images/products/beras.png',
    rating: 4.8,
    reviews: 2453,
    verified: true,
    address: 'Jl. Merdeka No. 123, Jakarta Pusat',
    phone: '+62 812-3456-7890',
  };

  const products: Product[] = Array(12).fill(null).map((_, index) => ({
    id: `product-${index + 1}`,
    name: 'Beras Premium',
    category: 'Bulog',
    price: 'Rp 100.000',
    badge: index % 3 === 0 ? 'Best' : undefined,
    image: '/images/products/beras.png',
    description: 'Beras premium berkualitas tinggi dari hasil panen terbaik. Cocok untuk kebutuhan sehari-hari dengan tekstur pulen dan rasa yang lezat.',
    rating: 4.8,
    reviews: 234,
    sold: 1250,
    owner: storeOwner,
  }));

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 flex flex-col">
      <Header />

      <div className="max-w-7xl mx-auto w-full">
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Main Content */}
        <main className="grow">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <Filter />

              <div className="grow">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center space-x-4 mt-12">
                  <button className="px-4 py-2 text-gray-600 hover:text-[#10b981] transition">
                    prev
                  </button>
                  <button className="px-4 py-2 bg-[#10b981] text-white rounded-lg font-semibold">
                    1
                  </button>
                  <button className="px-4 py-2 text-gray-600 hover:text-[#10b981] transition">
                    2
                  </button>
                  <span className="px-2 text-gray-600">...</span>
                  <button className="px-4 py-2 text-gray-600 hover:text-[#10b981] transition">
                    4
                  </button>
                  <button className="px-4 py-2 text-gray-600 hover:text-[#10b981] transition">
                    next
                  </button>
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