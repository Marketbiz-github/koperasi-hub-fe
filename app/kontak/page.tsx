'use client';

import Navbar from '@/components/landingpage/Navbar';
import Footer from '@/components/landingpage/Footer';

export default function Kontak() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Hubungi Kami</h1>
                <p className="text-gray-600 text-lg">
                  Ada pertanyaan atau masukan? Tim kami siap mendengarkan dan membantu Anda.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-xl text-green-600">
                    <i className="fas fa-map-marker-alt text-xl w-6 text-center"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Alamat Kantor</h3>
                    <p className="text-gray-600">Jl. Raya Koperasi No. 123, Jakarta Selatan, Indonesia 12345</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-xl text-green-600">
                    <i className="fas fa-phone-alt text-xl w-6 text-center"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Telepon / WhatsApp</h3>
                    <p className="text-gray-600">0857-3727-8721</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-xl text-green-600">
                    <i className="fas fa-envelope text-xl w-6 text-center"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Email</h3>
                    <p className="text-gray-600">support@koperasihub.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Jam Operasional</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Senin - Jumat</span>
                    <span className="font-medium text-gray-950">09:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sabtu</span>
                    <span className="font-medium text-gray-950">09:00 - 13:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minggu</span>
                    <span className="font-medium text-red-500">Tutup</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-green-50/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Kirim Pesan</h3>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                    <input 
                      type="text" 
                      placeholder="Masukkan nama"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                    <input 
                      type="email" 
                      placeholder="email@anda.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Subjek</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition">
                    <option>Pertanyaan Umum</option>
                    <option>Bantuan Teknis</option>
                    <option>Kerjasama Vendor</option>
                    <option>Lainnya</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Pesan</label>
                  <textarea 
                    rows={4}
                    placeholder="Tuliskan pesan Anda..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition"
                >
                  Kirim Pesan Sekarang
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
