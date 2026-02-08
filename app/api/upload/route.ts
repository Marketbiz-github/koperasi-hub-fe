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
        const type = formData.get('type') as string;

        if (!file) {
            return NextResponse.json({ error: 'Missing file' }, { status: 400 });
        }

        let relativeDir = '';
        if (role === 'categories') {
            relativeDir = path.join('images', 'categories');
        } else {
            if (!role || !userId || !storeId || !type) {
                return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
            }
            relativeDir = path.join('images', role, userId, storeId, type);
        }

        const uploadDir = path.join(process.cwd(), 'public', relativeDir);
        await mkdir(uploadDir, { recursive: true });

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

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
