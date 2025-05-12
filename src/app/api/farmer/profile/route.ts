import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import FarmerProfile from '@/models/FarmerProfile';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Create or update farmer profile
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    console.log("🚀 ~ POST ~ session:", session)
    const user = await User.findOne({email: session?.user.email});
    // console.log("🚀 ~ POST ~ farmer:", farmer)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user || user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    const userId = user.id;
    const data = await request.json();
    
    // Validate required fields
    if (!data.farmName || !data.description || !data.profileImage) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        details: 'Farm name, description, and profile image are required' 
      }, { status: 400 });
    }

    // Check if profile already exists
    let profile = await FarmerProfile.findOne({ user: userId });
    
    if (profile) {
      // Update existing profile
      profile = await FarmerProfile.findByIdAndUpdate(
        profile._id,
        { ...data },
        { new: true }
      );
    } else {
      // Create new profile
      profile = await FarmerProfile.create({
        user: userId,
        ...data
      });
    }

    return NextResponse.json({
      message: 'Profile saved successfully',
      profile
    });
    
  } catch (error: any) {
    console.error('Profile save error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save profile' }, { status: 500 });
  }
}

// Get farmer profile
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // await connectToDB();
    
    const userId = session.user.id;
    
    // Get profile
    const profile = await FarmerProfile.findOne({ user: userId });
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
    
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}