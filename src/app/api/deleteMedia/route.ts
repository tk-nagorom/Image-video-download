import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { mediaUrl } = await request.json();

    if (!mediaUrl) {
      return NextResponse.json({ error: 'Media URL is required.' }, { status: 400 });
    }

    // Extract public ID from the Cloudinary URL
    const publicIdMatch = mediaUrl.match(/v\d+\/(.+?)\.\w+$/);
    const publicId = publicIdMatch ? publicIdMatch[1] : null;

    if (!publicId) {
      return NextResponse.json({ error: 'Could not extract public ID from media URL.' }, { status: 400 });
    }

    // Determine resource type (image or video)
    const resourceType = mediaUrl.includes('/video/') ? 'video' : 'image';

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

    return NextResponse.json({ message: 'Media deleted successfully.' });
  } catch (error) {
    console.error('Cloudinary API delete error:', error);
    return NextResponse.json({ error: 'Failed to delete media.' }, { status: 500 });
  }
}
