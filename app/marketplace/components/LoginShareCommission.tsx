'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { authService, affiliationService, affiliatorService } from '@/services/apiService'
import { toast } from 'sonner'

interface LoginShareCommissionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess?: (shareUrl: string) => void
  productId: string | number
  productSlug?: string
  storeSubdomain?: string
  storeDomain?: string
  affiliationType?: 'affiliator_koperasi' | 'affiliator_reseller'
}

export default function LoginShareCommission({
  open,
  onOpenChange,
  onLoginSuccess,
  productId,
  productSlug,
  storeSubdomain,
  storeDomain,
  affiliationType = 'affiliator_koperasi',
}: LoginShareCommissionProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)

  // Login State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Register State (Onboarding)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [storeName, setStoreName] = useState('')
  const [subdomain, setSubdomain] = useState('')

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Email and password are required')
      return
    }

    setLoading(true)
    try {
      const response = await authService.login(email, password)
      const { token, role, user_id } = response.data

      if (role !== 'affiliate') {
        toast.error('Hanya akun Promotor (Affiliate) yang dapat membagikan link komisi ini.')
        setLoading(false)
        return
      }

      // Save to localStorage
      localStorage.setItem('affiliate_token', token)
      localStorage.setItem('affiliate_user', JSON.stringify(response.data))

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
      const generatedSubdomain = name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7)

      const onboardingData = {
        name,
        email,
        password,
        phone,
        role: 'affiliator',
        store_name: `Promotor ${name}`,
        store_subdomain: generatedSubdomain,
        store_description: `Promotor store for ${name}`,
        store_phone: phone,
        store_alamat: 'N/A',
        ipaymu_password: 'password123',
        flag_ids: [1],
        plan_id: 3,
      }

      const response = await authService.onboarding(onboardingData)
      const token = response.data.token || response.data.user.token // Adjust based on actual API response structure

      if (token) {
        localStorage.setItem('affiliate_token', token)
        localStorage.setItem('affiliate_user', JSON.stringify(response.data.user))

        try {
          // Attempt to request affiliation if we have the parent info
          // We can try to derive parentUserId from the product's store if needed
          // For now, if we don't have it, we skip but keep the flow going
          // If the user provided a parent ID or it's available in product context:
          // await affiliationService.create(token, {
          //   parent_id: ...
          //   type: affiliationType
          // })
        } catch (affError) {
          console.error('Affiliation request failed:', affError)
        }

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
          const storeId = (response.data.store_id || (response.data.user?.store?.id));
          if (storeId) {
            try {
              const { storeService } = await import('@/services/apiService');
              const sRes = await storeService.getDetail(token, storeId);
              if (sRes.data) {
                if (sRes.data.subdomain) finalSubdomain = sRes.data.subdomain;
                if (sRes.data.domain) finalDomain = sRes.data.domain;
              }
            } catch (err) {
              console.error('Failed to fetch store detail for subdomain:', err);
            }
          }
        }

        const baseAppDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || window.location.host.split('.').slice(-2).join('.');
        const shareUrl = finalDomain
          ? `https://${finalDomain}/produk/${finalSlug}?sh=${shareRes.data.share_code}`
          : `https://${finalSubdomain}.${baseAppDomain}/produk/${finalSlug}?sh=${shareRes.data.share_code}`;

        toast.success('Pendaftaran berhasil! Anda sekarang adalah Promotor.')
        if (onLoginSuccess) {
          onLoginSuccess(shareUrl)
        }
        onOpenChange(false)
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal mendaftar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            {isRegister ? 'Daftar Jadi Promotor' : 'Bagikan dan Dapatkan Komisinya!!'}
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
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
