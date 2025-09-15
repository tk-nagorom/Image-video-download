import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('mediaFile') as File;
    const resourceType = formData.get('mediaType') as 'image' | 'video';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: resourceType,
      folder: 'uploads',
    });

    console.log('Cloudinary secure_url:', result.secure_url);

    return NextResponse.json({ mediaUrl: result.secure_url });
  } catch (error) {
    console.error('Cloudinary API upload error:', error);
    return NextResponse.json({ error: 'Failed to upload media.' }, { status: 500 });
  }
}


