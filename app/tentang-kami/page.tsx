'use client';

import Navbar from '@/components/landingpage/Navbar';
import Footer from '@/components/landingpage/Footer';

export default function TentangKami() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-green-100">
          <div className="bg-green-600 py-12 px-8 text-white text-center">
            <h1 className="text-4xl font-extrabold mb-4">Tentang Kami</h1>
            <p className="text-green-50 text-lg max-w-2xl mx-auto">
              Menghubungkan Potensi, Membangun Ekonomi Bersama KoperasiHub.
            </p>
          </div>
          
          <div className="p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-green-700 mb-4">Visi Kami</h2>
              <p>
                Menjadi platform digital terdepan yang memberdayakan ekosistem koperasi di Indonesia melalui teknologi inovatif, menghubungkan vendor berkualitas dengan jaringan koperasi yang luas untuk kemajuan ekonomi nasional.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-700 mb-4">Misi Kami</h2>
              <ul className="list-disc pl-6 space-y-3">
                <li>Menyediakan akses pasar yang lebih luas bagi vendor dan UMKM untuk menjangkau anggota koperasi.</li>
                <li>Digitalisasi proses bisnis koperasi agar lebih efisien, transparan, dan kompetitif.</li>
                <li>Meningkatkan kesejahteraan anggota koperasi melalui ketersediaan produk berkualitas dengan harga bersaing.</li>
                <li>Membangun ekosistem ekonomi gotong royong yang modern dan berkelanjutan.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-700 mb-4">Apa Itu KoperasiHub?</h2>
              <p>
                KoperasiHub adalah platform Marketplace B2B & B2C yang dirancang khusus untuk memenuhi kebutuhan ekosistem koperasi. Kami memahami bahwa koperasi memiliki peran vital dalam ekonomi Indonesia, namun seringkali menghadapi tantangan dalam digitalisasi dan akses ke vendor berkualitas.
              </p>
              <p className="mt-4">
                Melalui platform kami, koperasi dapat dengan mudah mengelola pengadaan barang, menawarkan produk ke anggota, dan menjalin kemitraan strategis dengan vendor-vendor terpercaya di seluruh Indonesia.
              </p>
            </section>

            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 italic text-center">
              "Kekuatan kita ada pada kebersamaan. KoperasiHub hadir untuk memperkuat kebersamaan itu melalui teknologi."
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
