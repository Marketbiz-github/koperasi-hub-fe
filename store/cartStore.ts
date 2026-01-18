import { create } from 'zustand';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalCount: () => number;
};

const STORAGE_KEY = 'kh_cart_v1';

const load = (): CartItem[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: load(),

  addItem: (item) => {
    const items = get().items.slice();
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx > -1) {
      items[idx].quantity += item.quantity;
    } else {
      items.push({ ...item });
    }
    set({ items });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  },

  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    set({ items });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  },

  updateQuantity: (id, quantity) => {
    const items = get().items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i));
    set({ items });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  },

  clearCart: () => {
    set({ items: [] });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  },

  totalPrice: () => {
    return get().items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  },

  totalCount: () => {
    return get().items.reduce((sum, it) => sum + it.quantity, 0);
  },
}));
