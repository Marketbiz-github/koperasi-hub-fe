import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { orderService } from '@/services/apiService';

interface NotificationState {
    unreadOrderCounts: number;
    readOrderIds: string[];
    lastFetchedOrderIds: string[];
    fetchUnreadCounts: (role: string, params: any, token: string) => Promise<void>;
    markAsRead: (orderId: string | number) => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            unreadOrderCounts: 0,
            readOrderIds: [],
            lastFetchedOrderIds: [],

            fetchUnreadCounts: async (role, params, token) => {
                try {
                    const res = await orderService.getOrders({ ...params, limit: 20 }, token);
                    if (res.data && res.data.orders) {
                        const orders = res.data.orders;
                        const currentOrderIds = orders.map((o: any) => o.id.toString());
                        const readIds = get().readOrderIds;

                        const unreadOrders = currentOrderIds.filter((id: string) => !readIds.includes(id));

                        set({
                            unreadOrderCounts: unreadOrders.length,
                            lastFetchedOrderIds: currentOrderIds
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch unread counts:', err);
                }
            },

            markAsRead: (orderId) => {
                const idStr = orderId.toString();
                const { readOrderIds, unreadOrderCounts, lastFetchedOrderIds } = get();

                if (!readOrderIds.includes(idStr)) {
                    const newReadIds = [...readOrderIds, idStr];

                    // Recalculate count based on last fetched IDs
                    const newUnreadCount = lastFetchedOrderIds.filter(id => !newReadIds.includes(id)).length;

                    set({
                        readOrderIds: newReadIds,
                        unreadOrderCounts: newUnreadCount
                    });
                }
            },

            clearAll: () => set({ unreadOrderCounts: 0, readOrderIds: [], lastFetchedOrderIds: [] }),
        }),
        {
            name: 'notification-storage',
            partialize: (state) => ({ readOrderIds: state.readOrderIds }),
        }
    )
);
