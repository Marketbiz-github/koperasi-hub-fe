import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export { cloudinary };

export interface UploadResponse {
    url: string;
    public_id: string;
    secure_url: string;
}

export async function uploadToCloudinary(
    file: Buffer | string,
    folder: string,
    fileName?: string
): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
        const uploadOptions: any = {
            folder: folder,
            resource_type: 'auto',
        };

        if (fileName) {
            // Remove extension and special characters from filename for public_id
            const publicId = fileName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
            uploadOptions.public_id = publicId;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error('Cloudinary upload result is undefined'));
                resolve({
                    url: result.url,
                    public_id: result.public_id,
                    secure_url: result.secure_url,
                });
            }
        );

        if (Buffer.isBuffer(file)) {
            uploadStream.end(file);
        } else {
            // If it's a base64 string or URL
            cloudinary.uploader.upload(file, uploadOptions)
                .then(result => resolve({
                    url: result.url,
                    public_id: result.public_id,
                    secure_url: result.secure_url,
                }))
                .catch(reject);
        }
    });
}
