import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { affiliationService } from '@/services/apiService';

interface AffiliationNotificationState {
    unreadAffiliationCounts: number;
    readAffiliationIds: string[];
    lastFetchedAffiliationIds: string[];
    fetchUnreadCounts: (token: string, types?: string[]) => Promise<void>;
    markAsRead: (affiliationId: string | number) => void;
    clearAll: () => void;
}

export const useAffiliationNotificationStore = create<AffiliationNotificationState>()(
    persist(
        (set, get) => ({
            unreadAffiliationCounts: 0,
            readAffiliationIds: [],
            lastFetchedAffiliationIds: [],

            fetchUnreadCounts: async (token, types) => {
                try {
                    const res = await affiliationService.getIncoming(token, { types });
                    if (res.data) {
                        const affiliations = res.data;
                        const currentAffiliationIds = affiliations.map((a: any) => a.id.toString());
                        const readIds = get().readAffiliationIds;

                        const unreadAffiliations = currentAffiliationIds.filter((id: string) => !readIds.includes(id));

                        set({
                            unreadAffiliationCounts: unreadAffiliations.length,
                            lastFetchedAffiliationIds: currentAffiliationIds
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch unread affiliation counts:', err);
                }
            },

            markAsRead: (affiliationId) => {
                const idStr = affiliationId.toString();
                const { readAffiliationIds, unreadAffiliationCounts, lastFetchedAffiliationIds } = get();

                if (!readAffiliationIds.includes(idStr)) {
                    const newReadIds = [...readAffiliationIds, idStr];

                    // Recalculate count based on last fetched IDs
                    const newUnreadCount = lastFetchedAffiliationIds.filter(id => !newReadIds.includes(id)).length;

                    set({
                        readAffiliationIds: newReadIds,
                        unreadAffiliationCounts: newUnreadCount
                    });
                }
            },

            clearAll: () => set({ unreadAffiliationCounts: 0, readAffiliationIds: [], lastFetchedAffiliationIds: [] }),
        }),
        {
            name: 'affiliation-notification-storage',
            partialize: (state) => ({ readAffiliationIds: state.readAffiliationIds }),
        }
    )
);
