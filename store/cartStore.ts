import { create } from 'zustand';

export type CartItem = {
  id: string;
  quantity: number;
  variantId?: number;
  selected?: boolean;
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
  removeItems: (ids: string[]) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleSelectItem: (id: string) => void;
  selectAll: (select: boolean) => void;
  totalPrice: () => number;
  selectedTotalPrice: () => number;
  totalCount: () => number;
};

const STORAGE_KEY = 'kh_cart_v1';

const persist = (items: CartItem[]) => {
  try {
    const persistedItems = items.map(({ id, quantity, variantId, storeId, selected }) => ({
      id,
      quantity,
      variantId,
      storeId,
      selected
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedItems));
  } catch { }
};

const load = (): CartItem[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const useCartStore = create<CartState>((set, get) => {
  const initialItems = load();
  const initialSelected = new Set(
    initialItems.filter(i => i.selected).map(i => i.id)
  );

  return {
    items: initialItems,
    selectedItems: initialSelected,

    addItem: (item) => {
      const items = get().items.slice();
      const idx = items.findIndex((i) => i.id === item.id);

      // Default to selected when newly added if not specified
      const newItem = { ...item, selected: item.selected ?? true };

      if (idx > -1) {
        items[idx].quantity += item.quantity;
      } else {
        items.push(newItem);
      }

      const nextSelected = new Set(get().selectedItems);
      if (newItem.selected) {
        nextSelected.add(newItem.id);
      }

      set({ items, selectedItems: nextSelected });
      persist(items);
    },

    removeItem: (id) => {
      const items = get().items.filter((i) => i.id !== id);
      const nextSelected = new Set(get().selectedItems);
      nextSelected.delete(id);
      set({ items, selectedItems: nextSelected });
      persist(items);
    },

    removeItems: (ids) => {
      const items = get().items.filter((i) => !ids.includes(i.id));
      const nextSelected = new Set(get().selectedItems);
      ids.forEach((id) => nextSelected.delete(id));
      set({ items, selectedItems: nextSelected });
      persist(items);
    },

    updateQuantity: (id, quantity) => {
      const items = get().items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i));
      set({ items });
      persist(items);
    },

    clearCart: () => {
      set({ items: [], selectedItems: new Set() });
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch { }
    },

    toggleSelectItem: (id) => {
      const nextSelected = new Set(get().selectedItems);
      let isSelected = false;
      if (nextSelected.has(id)) {
        nextSelected.delete(id);
        isSelected = false;
      } else {
        nextSelected.add(id);
        isSelected = true;
      }

      const items = get().items.map(i => i.id === id ? { ...i, selected: isSelected } : i);
      set({ items, selectedItems: nextSelected });
      persist(items);
    },

    selectAll: (select) => {
      const items = get().items.map(i => ({ ...i, selected: select }));
      if (select) {
        set({ items, selectedItems: new Set(items.map((i) => i.id)) });
      } else {
        set({ items, selectedItems: new Set() });
      }
      persist(items);
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
  };
});
