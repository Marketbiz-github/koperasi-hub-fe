import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { validateImage } from '@/utils/image-validation';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const role = formData.get('role') as string;
        const userId = formData.get('userId') as string;
        const storeId = formData.get('storeId') as string;
        const subject = formData.get('type') as string; // User calls it 'subject' in requirements, mapping from 'type'

        if (!file) {
            return NextResponse.json({ error: 'Missing file' }, { status: 400 });
        }

        // Validate image format and size
        const validation = validateImage(file);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        if (!role || !userId || !storeId || !subject) {
            // If some fields are missing, and it's not a generic category upload
            if (role === 'categories') {
                // handle special case if needed
            } else {
                return NextResponse.json({ error: 'Missing required fields for folder structure' }, { status: 400 });
            }
        }

        // Folder structure: images/role/userid/storeid/subject
        const folder = `images/${role}/${userId}/${storeId}/${subject}`.replace(/\/+$/, '');

        const buffer = Buffer.from(await file.arrayBuffer());

        const result = await uploadToCloudinary(buffer, folder, file.name);

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
