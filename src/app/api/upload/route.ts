import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import cloudinary from '@/lib/cloudinary';
// import { connectToDB } from '@/lib/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'farmer-profiles';
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Base64 encode the buffer
    const fileStr = buffer.toString('base64');
    const fileURI = `data:${file.type};base64,${fileStr}`;
    
    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(fileURI, {
      folder: `fresh-harvest/${folder}`,
      resource_type: 'auto',
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}