export const ORDER_STATUS_CONFIG: Record<string, { label: string, color: string }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    waiting_approval: { label: 'Waiting Approval', color: 'bg-orange-100 text-orange-800' },
    paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-800' },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
    delivered: { label: 'Delivered', color: 'bg-indigo-100 text-indigo-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    refunded: { label: 'Refunded', color: 'bg-rose-100 text-rose-800' },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
    expired: { label: 'Expired', color: 'bg-gray-100 text-gray-800' },
};

/**
 * Standardize status labels to match API keys (English)
 * For piutang, we keep the special mapping requested by the user 
 * but align labels to English.
 */
export const getOrderStatusLabel = (status: string, paymentCategory?: string, paidAt?: string | null) => {
    if (status === 'paid' && paymentCategory === 'piutang') {
        if (!paidAt) return 'Approved';
        return 'Debt';
    }
    return ORDER_STATUS_CONFIG[status]?.label || status;
};
