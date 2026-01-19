import { create } from 'zustand'
import { User } from '@/types/user'

interface AuthState {
  user: User | null
  isHydrated: boolean
  setUser: (user: User | null) => void
  hydrate: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,

  setUser: (user) => set({ user }),

  hydrate: async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (!res.ok) {
        set({ user: null, isHydrated: true })
        return
      }

      const data = await res.json()

      set({
        user: data.user ?? null,
        isHydrated: true,
      })
    } catch (error) {
      console.error('Auth hydrate error:', error)
      set({ user: null, isHydrated: true })
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}

    set({ user: null })

    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'

    window.location.href = '/login'
  },
}))
