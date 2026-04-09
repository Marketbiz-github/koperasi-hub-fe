import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.error('GOOGLE_MAPS_API_KEY is not configured on the server');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await fetch(googleUrl);
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return NextResponse.json({
                lat: location.lat,
                lng: location.lng,
                status: 'success'
            });
        }

        return NextResponse.json({ 
            error: data.status || 'No results found',
            status: 'error' 
        }, { status: 404 });

    } catch (error) {
        console.error('Geocoding API Route Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
