'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Eye } from 'lucide-react'
import { useState } from 'react'

interface LoginShareCommissionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess?: () => void
}

export default function LoginShareCommission({
  open,
  onOpenChange,
  onLoginSuccess,
}: LoginShareCommissionProps) {
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = () => {
    // TODO: Implement actual login logic here
    // For now, just call the success callback
    if (onLoginSuccess) {
      onLoginSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            Bagikan dan Dapatkan Komisinya!!
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            {/* <X className="w-5 h-5" /> */}
          </button>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Dapatkan fee share sebesar{' '}
            <span className="font-semibold text-gray-800">Rp.2.000</span> dan
            Dapatkan Komisinya hingga{' '}
            <span className="font-semibold text-gray-800">
              Rp.10.000
            </span>{' '}
            per transaksi
          </p>

          <Input
            type="email"
            placeholder="Email"
            className="bg-blue-50 border-blue-100 focus-visible:ring-blue-200"
          />

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="bg-blue-50 border-blue-100 pr-10 focus-visible:ring-blue-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-gray-600">
            Belum punya akun?{' '}
            <a
              href="#"
              className="text-red-500 hover:underline font-medium"
            >
              daftar disini
            </a>
          </p>

          <p className="text-xs text-gray-500 leading-relaxed">
            * Komisi Anda akan tertransfer otomatis dengan memasukkan nama,
            email dan nomer hp. Periksa email Anda untuk verifikasi proses
            pembayaran selanjutnya
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-xs text-gray-400 font-semibold">
            b<span className="text-blue-600">t</span>n
          </div>

          <button 
            onClick={handleLogin}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white font-medium"
          >
            Bagikan →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
