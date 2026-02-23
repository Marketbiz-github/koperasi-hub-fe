import { create } from 'zustand';

export type CartItem = {
  id: string;
  quantity: number;
  variantId?: number;
  // Use optional fields for runtime UI display while loading/fallback
  name?: string;
  price?: number;
  image?: string;
  category?: string;
  storeId?: number;
};

type CartState = {
  items: CartItem[];
  selectedItems: Set<string>;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleSelectItem: (id: string) => void;
  selectAll: (select: boolean) => void;
  totalPrice: () => number;
  selectedTotalPrice: () => number;
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
  selectedItems: new Set(),

  addItem: (item) => {
    const items = get().items.slice();
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx > -1) {
      items[idx].quantity += item.quantity;
    } else {
      items.push({ ...item });
    }
    set({ items });

    // Automatically select newly added items
    const nextSelected = new Set(get().selectedItems);
    nextSelected.add(item.id);
    set({ selectedItems: nextSelected });

    try {
      const persistedItems = items.map(({ id, quantity, variantId, storeId }) => ({ id, quantity, variantId, storeId }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedItems));
    } catch { }
  },

  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    const nextSelected = new Set(get().selectedItems);
    nextSelected.delete(id);
    set({ items, selectedItems: nextSelected });
    try {
      const persistedItems = items.map(({ id, quantity, variantId, storeId }) => ({ id, quantity, variantId, storeId }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedItems));
    } catch { }
  },

  updateQuantity: (id, quantity) => {
    const items = get().items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i));
    set({ items });
    try {
      const persistedItems = items.map(({ id, quantity, variantId, storeId }) => ({ id, quantity, variantId, storeId }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedItems));
    } catch { }
  },

  clearCart: () => {
    set({ items: [], selectedItems: new Set() });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { }
  },

  toggleSelectItem: (id) => {
    const next = new Set(get().selectedItems);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    set({ selectedItems: next });
  },

  selectAll: (select) => {
    if (select) {
      set({ selectedItems: new Set(get().items.map((i) => i.id)) });
    } else {
      set({ selectedItems: new Set() });
    }
  },

  totalPrice: () => {
    return get().items.reduce((sum, it) => sum + (it.price || 0) * it.quantity, 0);
  },

  selectedTotalPrice: () => {
    const { items, selectedItems } = get();
    return items
      .filter((it) => selectedItems.has(it.id))
      .reduce((sum, it) => sum + (it.price || 0) * it.quantity, 0);
  },

  totalCount: () => {
    return get().items.reduce((sum, it) => sum + it.quantity, 0);
  },
}));
