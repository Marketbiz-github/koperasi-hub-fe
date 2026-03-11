'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { affiliatorService } from '@/services/apiService'

function TrackerContent() {
    const searchParams = useSearchParams()
    const sh = searchParams.get('sh')

    useEffect(() => {
        const trackAffiliate = async () => {
            if (sh) {
                try {
                    // Call API to track the click
                    await affiliatorService.trackClick(sh);
                    
                    // Save to local storage for future reference (reshare/sale)
                    localStorage.setItem('last_share_code', sh);
                    console.log('Affiliate code tracked and stored:', sh);
                } catch (error) {
                    console.error('Failed to track affiliate click:', error);
                    // Still save to localStorage even if tracking fails, 
                    // so it can be used for reshare/sale later
                    localStorage.setItem('last_share_code', sh);
                }
            }
        };

        trackAffiliate();
    }, [sh])

    return null
}

export default function AffiliateTracker() {
    return (
        <Suspense fallback={null}>
            <TrackerContent />
        </Suspense>
    )
}
