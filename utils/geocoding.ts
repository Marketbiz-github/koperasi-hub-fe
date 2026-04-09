/**
 * Utility to fetch latitude and longitude from OpenStreetMap Nominatim API
 */

interface GeocodeParams {
    street?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    postalcode?: string;
}

async function fetchWithRetry(url: string, options: RequestInit, retries: number = 3, delay: number = 2000): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 425 || response.status === 429) {
                console.warn(`Geocoding rate limited (${response.status}). Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
                continue;
            }
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
    return null;
}

export async function getLatLong(params: GeocodeParams): Promise<{ lat: string; lon: string } | null> {
    try {
        const country = params.country || 'Indonesia';
        // Strategy 1: Use internal API bridge to Google Maps (Secure)
        const address = [
            params.street,
            params.county,
            params.city,
            params.state,
            country,
            params.postalcode
        ].filter(Boolean).join(', ');

        try {
            const internalUrl = `/api/geocode?address=${encodeURIComponent(address)}`;
            const response = await fetch(internalUrl);
            const data = await response.json();

            if (data.status === 'success') {
                return { lat: String(data.lat), lon: String(data.lng) };
            }
            console.warn('Internal geocoding bridge failed:', data.error);
        } catch (err) {
            console.error('Error calling internal geocoding bridge:', err);
        }

        // Strategy 2: Fallback to Nominatim (OpenStreetMap)
        // Sanitize street: remove 'Jl.', 'Jalan', 'Gg.', etc. for better Nominatim matching
        const sanitizedStreet = params.street
            ? params.street.replace(/^(jl\.?|jalan|gg\.?|gang)\s+/i, '').trim()
            : params.street;

        // Strategy 1: Try structured search with combined parameters in 'q'
        const fullAddress = [
            sanitizedStreet,
            params.county,
            params.city,
            params.state,
            country,
            params.postalcode
        ].filter(Boolean).join(', ');

        const qParams = new URLSearchParams();
        qParams.append('q', fullAddress);
        qParams.append('format', 'jsonv2');
        qParams.append('limit', '1');

        const qUrl = `https://nominatim.openstreetmap.org/search?${qParams.toString()}`;
        const dataOsm = await fetchWithRetry(qUrl, {
            headers: { 'User-Agent': 'KoperasiHub-FE/1.0' }
        });

        if (dataOsm && Array.isArray(dataOsm) && dataOsm.length > 0) {
            return { lat: dataOsm[0].lat, lon: dataOsm[0].lon };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}
