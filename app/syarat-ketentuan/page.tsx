'use client';

import Navbar from '@/components/landingpage/Navbar';
import Footer from '@/components/landingpage/Footer';

export default function SyaratKetentuan() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gray-100 py-10 px-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Syarat & Ketentuan</h1>
            <p className="text-gray-500 mt-2">Terakhir diperbarui: 24 Maret 2026</p>
          </div>
          
          <div className="p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed text-sm md:text-base">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Pendahuluan</h2>
              <p>
                Selamat datang di KoperasiHub. Dengan mengakses dan menggunakan platform kami, Anda setuju untuk terikat oleh Syarat dan Ketentuan berikut. Harap baca dengan seksama sebelum menggunakan layanan kami.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Akun Pengguna</h2>
              <p>
                Untuk menggunakan fitur tertentu, Anda harus mendaftarkan akun. Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun dan kata sandi Anda. Anda setuju untuk memberikan informasi yang akurat, terkini, dan lengkap selama proses pendaftaran.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Penggunaan Layanan</h2>
              <p>
                Anda setuju untuk menggunakan layanan KoperasiHub hanya untuk tujuan yang sah dan sesuai dengan Syarat dan Ketentuan ini. Anda dilarang keras menggunakan platform untuk kegiatan yang melanggar hukum, menipu, atau merugikan pihak lain.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Transaksi dan Pembayaran</h2>
              <p>
                KoperasiHub memfasilitasi transaksi antara Vendor, Koperasi, dan Anggota. Segala bentuk transaksi pembayaran harus dilakukan melalui metode yang telah disediakan di platform untuk menjamin keamanan dan transparansi.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Hak Kekayaan Intelektual</h2>
              <p>
                Seluruh konten dalam platform KoperasiHub, termasuk namun tidak terbatas pada teks, grafik, logo, dan perangkat lunak, adalah properti KoperasiHub atau pemberi lisensinya dan dilindungi oleh undang-undang hak cipta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Pembatalan dan Pengembalian</h2>
              <p>
                Kebijakan pembatalan pesanan dan pengembalian barang mengikuti kebijakan masing-masing vendor yang terdaftar, namun tetap dimediasi oleh KoperasiHub demi perlindungan konsumen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Perubahan Syarat dan Ketentuan</h2>
              <p>
                Kami berhak untuk mengubah atau memperbarui Syarat dan Ketentuan ini dari waktu ke waktu tanpa pemberitahuan sebelumnya. Perubahan akan berlaku segera setelah diposting di halaman ini.
              </p>
            </section>

            <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 text-yellow-800 text-sm italic">
              Jika Anda memiliki pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi kami melalui halaman Kontak.
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
