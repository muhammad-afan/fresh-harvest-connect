import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Product from '@/models/Product';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get farmer's products
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ email: session?.user.email });
    if (!user || user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get farmer's products
    const products = await Product.find({ farmer: user.id }).sort({ createdAt: -1 });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

// Create a new product
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ email: session?.user.email });
    if (!user || user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.description || !data.category || !data.price || !data.unit || data.images.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Name, description, category, price, unit, and at least one image are required'
      }, { status: 400 });
    }

    // Create product
    const product = await Product.create({
      ...data,
      farmer: user.id,
    });

    return NextResponse.json({
      message: 'Product created successfully',
      product
    }, { status: 201 });
  } catch (error: any) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}