'use client';

import { useState } from 'react';
import Navbar from '../components/landingpage/Navbar';
import Footer from '../components/landingpage/Footer';

export default function KoperasiHubPage() {
  const [activeTab, setActiveTab] = useState('vendor');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Font Awesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      

      <style jsx global>{`
        body {
          font-family: 'Inter', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Manrope', sans-serif;
        }
        
        .gradient-green {
          background: linear-gradient(135deg, #16a34a 0%, #059669 50%, #047857 100%);
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(22, 163, 74, 0.2);
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <section
        className="relative pt-20 md:pt-24 pb-8 md:pb-12 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center bg-cover bg-center"
        style={{
          backgroundImage: "url('images/market.webp')",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-black/70 via-black/60 to-green-900/50"></div>
        
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-3 text-white space-y-6">
              <div className="inline-block">
                <span className="px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-green-400/30">
                  <i className="fas fa-rocket mr-2"></i>
                  Platform Terpercaya Indonesia
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Bisnis Anda Berkembang
                <span className="block text-yellow-400">bersama Koperasi Indonesia</span>
              </h1>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 md:gap-8 pt-2">
                <div className="space-y-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl md:text-5xl font-bold">80</span>
                    <span className="text-green-200 text-lg">++</span>
                  </div>
                  <p className="text-green-100 text-sm">Ribuan Produk Tersedia</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl md:text-5xl font-bold">1.7</span>
                    <span className="text-green-200 text-lg">Jt</span>
                  </div>
                  <p className="text-green-100 text-sm">Juta Seller Aktif</p>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-2">
                {[
                  'Platform permudah usaha koperasi',
                  'Menghubungkan vendor dengan koperasi',
                  'Menjangkau dari Sabang sampai Merauke',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shrink-0">
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                    <span className="text-base md:text-lg text-green-50">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="tentang" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Mengapa Memilih <span className="text-green-600">KoperasiHub</span>?
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Platform terpercaya untuk ekosistem bisnis Indonesia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: 'fa-industry',
                title: 'Untuk Vendor',
                description:
                  'Jangkau ribuan koperasi di seluruh Indonesia. Kelola reseller, atur harga, dan pantau penjualan dalam satu platform.',
              },
              {
                icon: 'fa-handshake',
                title: 'Untuk Koperasi',
                description:
                  'Jadilah reseller produk berkualitas. Dapatkan harga khusus dan dukungan pemasaran online.',
              },
              {
                icon: 'fa-chart-line',
                title: 'Kemudahan Kelola',
                description:
                  'Dashboard lengkap untuk mengelola inventori, pesanan, dan laporan penjualan secara real-time.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group hover-lift bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100"
              >
                <div className="w-16 h-16 gradient-green rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition">
                  <i className={`fas ${feature.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" className="py-16 md:py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cara Kerja Platform
            </h2>
            <p className="text-lg md:text-xl text-gray-600">Pilih alur sesuai peran Anda</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center space-x-4 mb-10">
            {['vendor', 'koperasi'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold rounded-xl transition ${
                  activeTab === tab
                    ? 'gradient-green text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab === 'vendor' ? 'Vendor' : 'Koperasi'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Description */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {activeTab === 'vendor' ? 'Jadi Vendor' : 'Jadi Koperasi'}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {activeTab === 'vendor'
                  ? 'Vendor dapat bergabung dengan platform untuk memperluas distribusi produk melalui koperasi. Dengan sistem ini, vendor bisa mengelola reseller, memantau pesanan, dan meningkatkan penjualan.'
                  : 'Koperasi bisa memilih vendor yang sesuai kebutuhan anggotanya, menjual produk ke anggota, dan mendapatkan komisi dari setiap transaksi.'}
              </p>
              <a
                href={activeTab === 'vendor' ? '/register-vendor' : 'https://my.kooperasi.com/'}
                target={activeTab === 'koperasi' ? '_blank' : undefined}
                rel={activeTab === 'koperasi' ? 'noopener noreferrer' : undefined}
                className="inline-block gradient-green text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105"
              >
                Daftar {activeTab === 'vendor' ? 'Vendor' : 'Koperasi'}
              </a>
            </div>

            {/* Right Steps */}
            <div className="space-y-6">
              {activeTab === 'vendor'
                ? [
                    {
                      title: 'Terdaftar sebagai Merchant & Punya Produk',
                      description: 'Pastikan usaha Anda sudah memiliki produk yang siap dijual.',
                    },
                    {
                      title: 'Daftar sebagai Vendor',
                      description: 'Registrasi di platform dan lengkapi data usaha Anda.',
                    },
                    {
                      title: 'Pilih Paket',
                      description: 'Ada paket standard dan premium',
                    },
                    {
                      title: 'Pantau Penjualan',
                      description: 'Lacak transaksi, pesanan, dan perkembangan bisnis Anda.',
                    },
                  ].map((step, index) => (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-start space-x-4"
                    >
                      <div className="w-10 h-10 shrink-0 gradient-green text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                      </div>
                    </div>
                  ))
                : [
                    {
                      title: 'Daftar sebagai Koperasi di Kooperasi.com',
                      description: 'Registrasi dengan data & legalitas koperasi Anda.',
                    },
                    {
                      title: 'Pilih Produk Vendor',
                      description: 'Jelajahi Marketplace Hub dan pilih produk yang sesuai.',
                    },
                    {
                      title: 'Lakukan Pembelian',
                      description: 'Pesan produk dari vendor dan kelola stok koperasi.',
                    },
                    {
                      title: 'Jual Produk Anda',
                      description: 'Distribusikan produk kepada anggota atau masyarakat.',
                    },
                  ].map((step, index) => (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-start space-x-4"
                    >
                      <div className="w-10 h-10 shrink-0 gradient-green text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="gradient-green rounded-3xl p-8 md:p-12 lg:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 animate-float" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
                Butuh Informasi Layanan?
              </h2>
              <p className="text-lg md:text-xl text-green-100 mb-8 md:mb-10 max-w-2xl mx-auto">
                Hubungi tim kami untuk konsultasi & penawaran terbaik
              </p>
              <a
                href="https://wa.me/6285737278721/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 px-8 py-4 bg-white text-green-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition transform hover:scale-105 text-lg"
              >
                <i className="fab fa-whatsapp text-2xl"></i>
                <span>Hubungi Kami</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">FAQ</h2>
            <p className="text-lg md:text-xl text-gray-600">Pertanyaan yang sering diajukan</p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'Apa syarat untuk koperasi bisa bergabung di platform ini?',
                answer:
                  'Daftar sebagai koperasi di Kooperasi.com dengan melengkapi data dan legalitas yang diperlukan.',
              },
              {
                question: 'Bagaimana cara vendor mendaftarkan produk?',
                answer:
                  'Vendor cukup mendaftar, melengkapi profil, lalu mengunggah katalog produk melalui dashboard.',
              },
              {
                question: 'Apakah koperasi bisa memilih lebih dari satu vendor?',
                answer:
                  'Ya, koperasi bebas memilih dan bekerja sama dengan lebih dari satu vendor sekaligus.',
              },
              {
                question: 'Bagaimana sistem komisi atau keuntungan untuk koperasi?',
                answer:
                  'Koperasi akan mendapatkan komisi sesuai kesepakatan dengan vendor dari setiap transaksi yang berhasil.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center"
                >
                  <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                  <i
                    className={`fas fa-chevron-down text-green-600 transition-transform duration-300 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  ></i>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 fade-in">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}