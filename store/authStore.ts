import { create } from 'zustand'
import { User } from '@/types/user'

interface AuthState {
  user: User | null
  isHydrated: boolean
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  hydrate: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>
  register: (data: any) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isHydrated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  clearError: () => set({ error: null }),

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

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMessage = data.message || 'Email atau password salah'
        set({ error: errorMessage, isLoading: false })
        return { success: false, message: errorMessage }
      }

      set({ user: data.user, isLoading: false })
      return { success: true, user: data.user }
    } catch (err: any) {
      const errorMessage = 'Terjadi kesalahan sistem saat login'
      set({ error: errorMessage, isLoading: false })
      return { success: false, message: errorMessage }
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const responseData = await res.json()

      if (!res.ok) {
        const errorMessage = responseData.message || 'Registrasi gagal'
        set({ error: errorMessage, isLoading: false })
        return { success: false, message: errorMessage }
      }

      // Jika auto-login berhasil setelah register, set user
      if (responseData.data?.user) {
        set({ user: responseData.data.user })
      }

      set({ isLoading: false })
      return { success: true, message: responseData.message }
    } catch (err: any) {
      const errorMessage = 'Terjadi kesalahan sistem saat registrasi'
      set({ error: errorMessage, isLoading: false })
      return { success: false, message: errorMessage }
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch { }

    set({ user: null })

    // Hapus cookies di sisi client (sama seperti di proxy logic)
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    document.cookie = 'user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'

    window.location.href = '/login'
  },
}))
