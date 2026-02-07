'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

const roleRouteMap: Record<string, string> = {
  vendor: '/dashboard/vendor',
  super_admin: '/dashboard/super_admin',
  koperasi: '/dashboard/koperasi',
  affiliator: '/dashboard/affiliator',
}

export default function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (user && user.role && roleRouteMap[user.role]) {
      router.replace(roleRouteMap[user.role])
    } else {
      router.replace('/login')
    }
  }, [user, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
