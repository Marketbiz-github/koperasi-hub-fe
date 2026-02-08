import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ token: null }, { status: 200 });
        }

        return NextResponse.json({ token }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ token: null }, { status: 200 });
    }
}
