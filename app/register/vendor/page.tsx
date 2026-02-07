'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check } from 'lucide-react';
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore';

interface FormErrors {
  [key: string]: string;
}

export default function RegisterVendorPage() {
  const router = useRouter();

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
  useState(() => {
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
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Auto-generate subdomain from minishop_name if subdomain hasn't been manually edited
      // or if it's currently empty
      if (name === 'minishop_name') {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        // Only auto-fill if subdomain is empty or was previously auto-generated from minishop_name
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

    // Clear error for this field when user starts typing
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
    <div className="relative min-h-screen flex items-center justify-center bg-black/70 p-4 overflow-hidden py-8">

      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/vendor.jpg"
          alt="Auth Background"
          fill
          priority
          className="object-cover opacity-20"
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 -z-10" />

      {/* content */}
      <div className="w-full max-w-2xl z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center space-x-3 justify-center mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 gradient-green rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                <span className="text-white font-bold text-xl md:text-2xl">K</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">KoperasiHub</div>
            </div>
            <p className="text-gray-600">Daftar Sebagai Vendor</p>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm flex items-center gap-2">
                <Check className="w-4 h-4" />
                {successMessage}
              </p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-6 mb-8">

            {/* Section 1: Data Pribadi */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-green-200">Data Pribadi</h3>

              {/* Nama Lengkap dan Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none`}
                    placeholder="Nama Lengkap Anda"
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none`}
                    placeholder="email@example.com"
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Phone dan Flag selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 font-medium">
                      +62
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`flex-1 px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'} bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none`}
                      placeholder="8123456789"
                      required
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="flag_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Grup / Flag (Opsional)
                  </label>
                  <select
                    id="flag_id"
                    name="flag_id"
                    value={formData.flag_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  >
                    <option value="">Pilih Flag (Jika Ada)</option>
                    {flags.map((flag) => (
                      <option key={flag.id} value={flag.id}>
                        {flag.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Section 2: Data Toko */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-green-200">Data Toko</h3>

              {/* Nama Toko */}
              <div className="mb-4">
                <label htmlFor="minishop_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Toko <span className="text-red-500">*</span>
                </label>
                <input
                  id="minishop_name"
                  name="minishop_name"
                  type="text"
                  value={formData.minishop_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.minishop_name ? 'border-red-500' : 'border-gray-300'} bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none`}
                  placeholder="Nama Toko Anda"
                  required
                />
                {errors.minishop_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.minishop_name}</p>
                )}
              </div>

              {/* Subdomain */}
              <div className="mb-4">
                <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain Toko Anda <span className="text-red-500">*</span>
                </label>
                <input
                  id="subdomain"
                  name="subdomain"
                  type="text"
                  value={formData.subdomain}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.subdomain ? 'border-red-500' : 'border-gray-300'} bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none`}
                  placeholder="subdomain-toko-anda"
                  required
                />
                {formData.subdomain && (
                  <p className="mt-2 text-sm text-gray-600">
                    Link toko Anda: https://<span className="font-semibold text-green-600">{formData.subdomain}</span>.koperasi.hub
                  </p>
                )}
                {errors.subdomain && (
                  <p className="mt-1 text-sm text-red-600">{errors.subdomain}</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Section 3: Keamanan */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-green-200">Keamanan</h3>

              {/* Password */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none pr-12`}
                    placeholder="Minimal 6 karakter"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none pr-12`}
                    placeholder="Ulang password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.agreeTerms) {
                    setErrors(prev => ({
                      ...prev,
                      agreeTerms: ''
                    }));
                  }
                }}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 cursor-pointer"
              />
              <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                Saya menyetujui <a href="#" className="text-green-600 font-medium hover:underline">Syarat & Ketentuan</a> dan <a href="#" className="text-green-600 font-medium hover:underline">Kebijakan Privasi</a>
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-sm text-red-600">{errors.agreeTerms}</p>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 gradient-green disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              {isLoading ? 'Memproses Registrasi...' : 'Daftar Sebagai Vendor'}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-3">
              Sudah memiliki akun?
            </p>
            <a
              href="/login"
              className="text-green-600 font-medium hover:underline"
            >
              Login di sini
            </a>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              © 2025 KoperasiHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
