'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

interface FormErrors {
  [key: string]: string;
}

import Link from 'next/link';

export default function RegisterVendorPage() {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({
    subdomain: '',
    name: '',
    email: '',
    phone: '',
    minishop_name: '',
    password: '',
    confirmPassword: '',
    flag_id: '',
  });

  const [flags, setFlags] = useState<any[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch flags on mount
  useEffect(() => {
    async function fetchFlags() {
      try {
        const response = await fetch('/api/flags');
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setFlags(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching flags:', error);
      }
    }
    fetchFlags();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      if (name === 'minishop_name') {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        const prevSlug = prev.minishop_name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        if (!prev.subdomain || prev.subdomain === prevSlug) {
          newData.subdomain = slug;
        }
      }

      return newData;
    });

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'Subdomain harus diisi';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Nama lengkap harus diisi';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon harus diisi';
    }
    if (!formData.minishop_name.trim()) {
      newErrors.minishop_name = 'Nama toko harus diisi';
    }
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }
    if (!agreeTerms) {
      newErrors.agreeTerms = 'Anda harus menyetujui syarat & ketentuan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage('');
    setErrors({});

    if (!validateForm()) {
      return;
    }

    if (!executeRecaptcha) {
      setErrors({ submit: 'CAPTCHA belum siap, silakan tunggu sebentar' });
      return;
    }

    const token = await executeRecaptcha('register');

    if (!token) {
      setErrors({ submit: 'Gagal mendapatkan token CAPTCHA' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/register/vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          subdomain: formData.subdomain,
          store_name: formData.minishop_name,
          flag_id: formData.flag_id || null,
          captchaToken: token,
          role: 'vendor'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage('Registrasi berhasil! Silakan cek email Anda untuk aktivasi akun.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setErrors({ submit: result.message || 'Terjadi kesalahan saat registrasi' });
      }
    } catch (error: any) {
      console.error(error);
      setErrors({ submit: 'Terjadi kesalahan sistem saat registrasi' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans py-12">
      <div className="w-full max-w-2xl">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="transition-transform hover:scale-105">
            <div className="relative w-48 h-16">
              <Image
                src="/images/koperasihub.png"
                alt="KoperasiHub Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-10">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Daftar Sebagai Vendor</h2>
            <p className="text-slate-500 mt-1">Mulai kelola produk dan jangkau pasar lebih luas.</p>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{errors.submit}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
              <p className="text-emerald-600 text-sm font-medium flex items-center gap-2">
                <Check className="w-5 h-5" />
                {successMessage}
              </p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-8">
            {/* Section 1: Data Pribadi */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">1</div>
                <h3 className="text-lg font-bold text-slate-800">Informasi Pribadi</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    placeholder="Nama Lengkap"
                    required
                  />
                  {errors.name && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    placeholder="email@anda.com"
                    required
                  />
                  {errors.email && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-500 font-medium">
                      +62
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-r-xl border border-slate-300 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                      placeholder="81234xxx"
                      required
                    />
                  </div>
                  {errors.phone && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="flag_id" className="block text-sm font-semibold text-slate-700 mb-2">
                    Referal / Flag Group
                  </label>
                  <select
                    id="flag_id"
                    name="flag_id"
                    value={formData.flag_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                  >
                    <option value="">Pilih Jika Ada</option>
                    {flags.map((flag) => (
                      <option key={flag.id} value={flag.id}>{flag.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Data Toko */}
            <div className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">2</div>
                <h3 className="text-lg font-bold text-slate-800">Detail Toko</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label htmlFor="minishop_name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Nama Toko / Bisnis <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="minishop_name"
                    name="minishop_name"
                    type="text"
                    value={formData.minishop_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    placeholder="Nama Toko Anda"
                    required
                  />
                  {errors.minishop_name && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.minishop_name}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="subdomain" className="block text-sm font-semibold text-slate-700 mb-2">
                    Subdomain <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="subdomain"
                      name="subdomain"
                      type="text"
                      value={formData.subdomain}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none pr-32"
                      placeholder="subdomain"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      .koperasihub.com
                    </div>
                  </div>
                  {errors.subdomain && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.subdomain}</p>}
                </div>
              </div>
            </div>

            {/* Section 3: Keamanan */}
            <div className="space-y-5 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">3</div>
                <h3 className="text-lg font-bold text-slate-800">Keamanan Akun</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none pr-12"
                      placeholder="Minimal 6 karakter"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none pr-12"
                      placeholder="Masukkan ulang"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-sm text-slate-600">
                  Saya menyetujui <Link href="#" className="font-bold text-emerald-600 hover:underline">Syarat & Ketentuan</Link> serta <Link href="#" className="font-bold text-emerald-600 hover:underline">Kebijakan Privasi</Link> KoperasiHub.
                </label>
              </div>
              {errors.agreeTerms && <p className="mt-2 text-xs font-medium text-red-500">{errors.agreeTerms}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] text-lg flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? 'Memproses Registrasi...' : 'Daftar Sebagai Vendor'}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-8 mt-10 border-t border-slate-100">
            <p className="text-slate-500 font-medium">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-bold underline-offset-4 hover:underline transition-all">
                Login di sini
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-10">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} KoperasiHub Platform. Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}
