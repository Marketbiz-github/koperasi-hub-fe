'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { authService, affiliatorService, userService, productService, storeService, affiliationService } from '@/services/apiService'
import { toast } from 'sonner'

interface LoginShareCommissionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess?: (shareUrl: string) => void
  productId: string | number
  productSlug?: string
  storeSubdomain?: string
  storeDomain?: string
}

export default function LoginShareCommission({
  open,
  onOpenChange,
  onLoginSuccess,
  productId,
  productSlug,
  storeSubdomain,
  storeDomain,
}: LoginShareCommissionProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  // Login State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Register State (Onboarding)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Email and password are required')
      return
    }

    setLoading(true)
    try {
      const response = await authService.login(email, password)
      const { token, role } = response.data

      if (role !== 'affiliator') {
        toast.error('Hanya akun Promotor (Affiliate) yang dapat membagikan link komisi ini.')
        setLoading(false)
        return
      }

      // Save to localStorage
      localStorage.setItem('affiliate_token', token)
      localStorage.setItem('affiliate_user', JSON.stringify(response.data))

      // Auto check and request affiliation
      try {
        const prodRes = await productService.getProductDetail(productId, token);
        let vendorId = null;
        let pType = 'affiliator_koperasi';
        if (prodRes.data) {
          const sId = prodRes.data.store_id || prodRes.data.store?.id;
          if (sId) {
            const storeRes = await storeService.getDetail(token, sId);
            vendorId = storeRes.data?.user_id;
            const role = storeRes.data?.user?.role || storeRes.data?.user?.roles?.[0]?.name;
            if (role === 'koperasi') {
              pType = 'affiliator_koperasi';
            } else if (role === 'reseller') {
              pType = 'affiliator_reseller';
            }
          }
        }

        if (vendorId) {
          const childId = response.data?.user_id || response.data?.user?.id || response.data?.id;
          const affRes = await userService.checkAffiliation(token, vendorId, childId);
          if (affRes.data && !affRes.data.is_affiliated) {
            await affiliationService.create(token, { parent_id: vendorId, type: pType });
          }
        }
      } catch (err) {
        console.error('Failed to auto-request affiliation:', err);
      }

      // Generate Share Link (with reshare logic)
      const parentShareCode = localStorage.getItem('last_share_code') || undefined;
      const shareRes = await affiliatorService.generateShareLink(productId, token, parentShareCode)

      // Store the generated share info for attribution and future reshares
      if (shareRes.data) {
        localStorage.setItem('shared_product_id', shareRes.data.id.toString());
        localStorage.setItem('share_code', shareRes.data.share_code);
      }
      const finalSlug = productSlug || productId.toString();
      let finalSubdomain = storeSubdomain || 'www';
      let finalDomain = storeDomain || '';

      if ((!storeSubdomain || storeSubdomain === 'www') && !storeDomain) {
        const storeId = response.data.store_id || response.data.user?.store_id || (response.data.user?.store?.id);
        if (storeId) {
          try {
            const { storeService } = await import('@/services/apiService');
            const sRes = await storeService.getDetail(token, storeId);
            if (sRes.data) {
              if (sRes.data.subdomain) finalSubdomain = sRes.data.subdomain;
              if (sRes.data.domain) finalDomain = sRes.data.domain;
            }
          } catch (err) {
            console.error('Failed to fetch store detail in handleLogin:', err);
          }
        }
      }

      const baseAppDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || window.location.host.split('.').slice(-2).join('.');
      const shareUrl = finalDomain
        ? `https://${finalDomain}/produk/${finalSlug}?sh=${shareRes.data.share_code}`
        : `https://${finalSubdomain}.${baseAppDomain}/produk/${finalSlug}?sh=${shareRes.data.share_code}`;

      toast.success('Berhasil login sebagai Promotor!')
      if (onLoginSuccess) {
        onLoginSuccess(shareUrl)
      }
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Gagal login')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      toast.error('Semua field harus diisi')
      return
    }

    setLoading(true)
    try {
      const onboardingData = {
        name,
        email,
        password,
        phone,
        role: 'affiliator',
        ipaymu_password: password,
        plan_id: 1,
      }

      try {
        await authService.onboarding(onboardingData)
      } catch (err: any) {
        if (err?.message?.includes('duplicate key value violates unique constraint "idx_users_email"') || err?.data?.error?.includes('duplicate key')) {
          toast.error('Email ini sudah terdaftar. Silakan gunakan email lain atau login jika Anda sudah memiliki akun.');
          setLoading(false);
          return;
        }
        throw err;
      }

      // Show email activation notice
      setRegisteredEmail(email)
    } catch (error: any) {
      toast.error(error.message || 'Gagal mendaftar')
    } finally {
      setLoading(false)
    }
  }

  // Email activation notice state
  if (registeredEmail) {
    return (
      <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setRegisteredEmail(''); }}>
        <DialogContent aria-describedby="activation-description" className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
            <DialogTitle className="text-lg font-semibold">Pendaftaran Berhasil!</DialogTitle>
          </DialogHeader>
          <div id="activation-description" className="px-6 py-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <MailCheck className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900 text-base">Silakan aktivasi email Anda dahulu</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Kami telah mengirimkan link aktivasi ke{' '}
                <span className="font-medium text-gray-800">{registeredEmail}</span>.
                Periksa inbox atau folder spam Anda.
              </p>
            </div>
            <button
              onClick={() => { onOpenChange(false); setRegisteredEmail(''); }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Mengerti
            </button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="dialog-description" className="max-w-md p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            {isRegister ? 'Daftar Jadi Promotor' : 'Bagikan dan Dapatkan Komisinya!!'}
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div id="dialog-description" className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {!isRegister && (
            <p className="text-sm text-gray-600 leading-relaxed">
              Dapatkan fee share sebesar{' '}
              <span className="font-semibold text-gray-800">Rp.2.000</span> dan
              Dapatkan Komisinya hingga{' '}
              <span className="font-semibold text-gray-800">
                Rp.10.000
              </span>{' '}
              per transaksi
            </p>
          )}

          {isRegister ? (
            <>
              <Input
                placeholder="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-blue-50 border-blue-100 focus-visible:ring-blue-200"
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-blue-50 border-blue-100 focus-visible:ring-blue-200"
              />
              <Input
                placeholder="Nomor HP"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-blue-50 border-blue-100 focus-visible:ring-blue-200"
              />
            </>
          ) : (
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-blue-50 border-blue-100 focus-visible:ring-blue-200"
            />
          )}

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-blue-50 border-blue-100 pr-10 focus-visible:ring-blue-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-sm text-gray-600">
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-red-500 hover:underline font-medium"
            >
              {isRegister ? 'login disini' : 'daftar disini'}
            </button>
          </p>

          <p className="text-xs text-gray-500 leading-relaxed">
            * Komisi Anda akan tertransfer otomatis dengan memasukkan nama,
            email dan nomer hp. Periksa email Anda untuk verifikasi proses
            pembayaran selanjutnya
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-xs text-gray-400 font-semibold uppercase">
            koperasi<span className="text-blue-600">hub</span>
          </div>

          <button
            onClick={isRegister ? handleRegister : handleLogin}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isRegister ? 'Daftar & Bagikan' : 'Bagikan →'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
