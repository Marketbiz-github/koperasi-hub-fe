'use client';

import Navbar from '@/components/landingpage/Navbar';
import Footer from '@/components/landingpage/Footer';
import { useState } from 'react';

const faqs = [
  {
    question: "Apa itu KoperasiHub?",
    answer: "KoperasiHub adalah platform digital yang menghubungkan vendor, koperasi, dan anggota koperasi dalam satu ekosistem terpadu untuk memudahkan pengadaan barang dan pemasaran produk."
  },
  {
    question: "Bagaimana cara mendaftar sebagai Vendor?",
    answer: "Anda dapat mendaftar melalui tombol 'Daftar' di navbar dan pilih 'Jadi Vendor'. Isi formulir pendaftaran dengan lengkap dan tim kami akan melakukan verifikasi akun Anda."
  },
  {
    question: "Apakah koperasi bisa menjual produk anggotanya di sini?",
    answer: "Ya, sangat bisa! Koperasi dapat mendaftarkan produk anggota dan menjualnya ke pasar yang lebih luas melalui jaringan KoperasiHub."
  },
  {
    question: "Apa keuntungan bagi Anggota Koperasi?",
    answer: "Anggota koperasi mendapatkan akses ke berbagai produk berkualitas dengan harga yang lebih terjangkau, serta kemudahan dalam proses pemesanan melalui aplikasi."
  },
  {
    question: "Bagaimana sistem pembayarannya?",
    answer: "Kami mendukung berbagai metode pembayaran mulai dari transfer bank, e-wallet, hingga sistem potong gaji (khusus anggota koperasi tertentu) yang terintegrasi aman di platform kami."
  },
  {
    question: "Bagaimana cara menghubungi layanan pelanggan?",
    answer: "Anda dapat menghubungi kami melalui halaman 'Kontak' atau langsung chat via WhatsApp di nomor yang tertera di bagian footer website."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">FAQ</h1>
            <p className="text-gray-600 text-lg">
              Pertanyaan yang sering diajukan seputar KoperasiHub.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-green-50 transition"
                >
                  <span className="font-semibold text-gray-800">{faq.question}</span>
                  <i className={`fas fa-chevron-${openIndex === index ? 'up' : 'down'} text-green-600 transition-transform`}></i>
                </button>
                
                {openIndex === index && (
                  <div className="px-6 pb-5 text-gray-600 border-t border-gray-50 pt-4 animate-fade-in text-sm md:text-base leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 bg-green-600 rounded-3xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Masih punya pertanyaan lain?</h3>
            <p className="mb-6 text-green-100">Tim kami siap membantu Anda kapan saja.</p>
            <a 
              href="/kontak" 
              className="inline-block bg-white text-green-600 px-8 py-3 rounded-xl font-bold hover:bg-green-50 transition shadow-lg"
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
