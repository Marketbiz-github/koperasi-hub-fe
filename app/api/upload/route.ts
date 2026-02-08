import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const role = formData.get('role') as string;
        const userId = formData.get('userId') as string;
        const storeId = formData.get('storeId') as string;
        const type = formData.get('type') as string; // 'logo' or 'cover'

        if (!file || !role || !userId || !storeId || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name;

        // Target directory: public/images/{role}/{userId}/{storeId}/{type}/
        const relativeDir = path.join('images', role, userId, storeId, type);
        const uploadDir = path.join(process.cwd(), 'public', relativeDir);

        // Create directory recursively
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // Generate full URL
        const appUrl = process.env.APP_URL?.replace(/\/$/, '') || '';
        const fileUrl = `${appUrl}/${relativeDir.replace(/\\/g, '/')}/${filename}`;

        return NextResponse.json({
            success: true,
            url: fileUrl,
            path: `/${relativeDir.replace(/\\/g, '/')}/${filename}`
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
