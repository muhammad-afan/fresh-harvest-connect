import { NextResponse } from 'next/server';
import Category from '@/models/Category';

// Get all categories
export async function GET(request: Request) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Categories fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

// Create a new category (admin only)
export async function POST(request: Request) {
  try {
    const { name, description, imageUrl } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if category with this slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 });
    }
    
    // Create category
    const category = await Category.create({
      name,
      slug,
      description,
      imageUrl
    });
    
    return NextResponse.json({
      message: 'Category created successfully',
      category
    }, { status: 201 });
  } catch (error: any) {
    console.error('Category creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}