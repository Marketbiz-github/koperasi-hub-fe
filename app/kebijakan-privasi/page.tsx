'use client';

import Navbar from '@/components/landingpage/Navbar';
import Footer from '@/components/landingpage/Footer';

export default function KebijakanPrivasi() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gray-100 py-10 px-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Kebijakan Privasi</h1>
            <p className="text-gray-500 mt-2">Terakhir diperbarui: 24 Maret 2026</p>
          </div>
          
          <div className="p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed text-sm md:text-base">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Informasi yang Kami Kumpulkan</h2>
              <p>
                Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat mendaftarkan akun, termasuk nama, alamat email, nomor telepon, dan data profil lainnya yang diperlukan untuk layanan KoperasiHub.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Penggunaan Informasi</h2>
              <p>
                Informasi yang kami kumpulkan digunakan untuk menyediakan, memelihara, dan meningkatkan layanan kami, memproses transaksi, mengirimkan pemberitahuan terkait akun, dan untuk keperluan keamanan serta verifikasi identitas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Keamanan Data</h2>
              <p>
                Kami menerapkan langkah-masing keamanan teknis dan organisasional yang wajar untuk melindungi informasi pribadi Anda dari akses yang tidak sah, pengungkapan, perubahan, atau penghancuran.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Berbagi Informasi</h2>
              <p>
                Kami tidak akan menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami hanya berbagi informasi dengan mitra terpercaya (seperti vendor atau penyedia jasa pengiriman) sejauh yang diperlukan untuk menjalankan transaksi yang Anda minta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Cookie</h2>
              <p>
                Kami menggunakan cookie dan teknologi serupa untuk meningkatkan pengalaman pengguna, menganalisis penggunaan platform, dan membantu upaya pemasaran kami.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Hak Anda</h2>
              <p>
                Anda memiliki hak untuk mengakses, memperbarui, atau menghapus informasi pribadi Anda yang kami simpan. Silakan hubungi tim dukungan kami jika Anda ingin melaksanakan hak-hak ini.
              </p>
            </section>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-800 text-sm italic">
              Privasi Anda adalah prioritas kami. Kami berkomitmen untuk melindungi data Anda dengan standar keamanan terbaik.
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
