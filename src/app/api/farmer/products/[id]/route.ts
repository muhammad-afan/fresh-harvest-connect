import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Product from '@/models/Product';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get a specific product
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;
    
    // Get product
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product belongs to farmer
    const user = await User.findOne({ email: session?.user.email });
    if (user.role !== 'ADMIN' && product.farmer.toString() !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('Product fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch product' }, { status: 500 });
  }
}

// Update a product
export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    const productId = params.id;
    const data = await request.json();
    
    // Get existing product
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Check ownership
    if (product.farmer.toString() !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { ...data },
      { new: true }
    );

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

// Delete a product
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const productId = params.id;
    
    // Get existing product
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Check ownership
    if (product.farmer.toString() !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Delete product
    await Product.findByIdAndDelete(productId);

    return NextResponse.json({
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Product deletion error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}