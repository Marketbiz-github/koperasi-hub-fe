import { create } from 'zustand'
import { User } from '@/types/user'

interface AuthState {
  user: User | null
  userDetail: User | null
  store: any | null
  isHydrated: boolean
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setUserDetail: (detail: User | null) => void
  setStore: (store: any | null) => void
  hydrate: () => Promise<void>
  fetchUserDetail: () => Promise<void>
  fetchStore: () => Promise<void>
  login: (email: string, password: string, captchaToken?: string) => Promise<{ success: boolean; message?: string; user?: User }>
  register: (data: any, captchaToken?: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userDetail: null,
  store: null,
  isHydrated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setUserDetail: (userDetail) => set({ userDetail }),
  setStore: (store) => set({ store }),

  clearError: () => set({ error: null }),

  hydrate: async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (!res.ok) {
        set({ user: null, userDetail: null, isHydrated: true })
        return
      }

      const data = await res.json()

      set({
        user: data.user ?? null,
        userDetail: data.user ?? null, // Sync initially from /api/auth/me
        isHydrated: true,
      })

      if (data.user) {
        await get().fetchStore();
      }
    } catch (error) {
      console.error('Auth hydrate error:', error)
      set({ user: null, userDetail: null, isHydrated: true })
    }
  },

  fetchUserDetail: async () => {
    const { user } = get();
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/users/${user.id}`);
      const data = await response.json();

      if (response.ok && data.data) {
        set({ userDetail: data.data });
      }
    } catch (err) {
      console.error('Failed to fetch user detail:', err);
    }
  },

  fetchStore: async () => {
    const { user } = get();
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/stores/user/${user.id}`);

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Store API returned non-JSON response:", await response.text());
        return;
      }

      const data = await response.json();

      if (response.ok && data.data && data.data.length > 0) {
        set({ store: data.data[0] });
      } else {
        console.warn('Store not found or empty for user:', user.id);
      }
    } catch (err) {
      console.error('Failed to fetch store detail:', err);
    }
  },

  login: async (email, password, captchaToken) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captchaToken }),
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

  register: async (data, captchaToken) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, captchaToken }),
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
