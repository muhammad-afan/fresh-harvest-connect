"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { CldUploadWidget } from 'next-cloudinary';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  price: number;
  unit: string;
  quantityAvailable: number;
  isOrganic: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  harvestDate?: string;
  expiryDate?: string;
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const productId = params.id;
  
  const [product, setProduct] = useState({
    name: '',
    description: '',
    category: '',
    images: [] as string[],
    price: '',
    unit: 'kg',
    quantityAvailable: '',
    isOrganic: false,
    isFeatured: false,
    isAvailable: true,
    harvestDate: '',
    expiryDate: '',
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    if (session?.user.role !== "FARMER") {
      router.push("/dashboard");
      return;
    }
    
    // Fetch product and categories
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch product
        const productResponse = await fetch(`/api/farmer/products/${productId}`);
        if (!productResponse.ok) {
          throw new Error('Failed to fetch product');
        }
        const productData = await productResponse.json();
        
        // Format dates and numbers for form inputs
        const formattedProduct = {
          ...productData.product,
          price: productData.product.price.toString(),
          quantityAvailable: productData.product.quantityAvailable.toString(),
          harvestDate: productData.product.harvestDate ? new Date(productData.product.harvestDate).toISOString().split('T')[0] : '',
          expiryDate: productData.product.expiryDate ? new Date(productData.product.expiryDate).toISOString().split('T')[0] : '',
        };
        
        setProduct(formattedProduct);
        
        // Fetch categories
        const categoryResponse = await fetch('/api/categories');
        if (!categoryResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoryData = await categoryResponse.json();
        setCategories(categoryData.categories);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [status, session, router, productId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProduct(prev => ({ ...prev, [name]: checked }));
    } else {
      setProduct(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (result: any) => {
    if (result.event === 'success') {
      setProduct(prev => ({
        ...prev,
        images: [...prev.images, result.info.secure_url]
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Convert string values to numbers
      const productData = {
        ...product,
        price: parseFloat(product.price),
        quantityAvailable: parseInt(product.quantityAvailable),
      };
      
      const response = await fetch(`/api/farmer/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to update product');
      }
      
      setSuccess('Product updated successfully!');
      setTimeout(() => {
        router.push('/farmer/products');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <Link
          href="/farmer/products"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Back to Products
        </Link>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">{success}</div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form fields - same as new product form but with values populated */}
        {/* (Same form fields as in the new product form, just reused with the loaded product data) */}
        
        {/* Basic Information */}
        <section className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium mb-1">Product Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={product.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium mb-1">Description*</label>
              <textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">Category*</label>
              <select
                id="category"
                name="category"
                value={product.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <div className="flex items-center h-full mt-6">
                <input
                  type="checkbox"
                  id="isOrganic"
                  name="isOrganic"
                  checked={product.isOrganic}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isOrganic" className="ml-2 block text-sm text-gray-700">
                  This product is organically grown
                </label>
              </div>
            </div>
          </div>
        </section>
        
        {/* Product Images */}
        <section className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Product Images</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Images* (at least one required)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {product.images.map((image, index) => (
                <div key={index} className="relative h-32">
                  <Image
                    src={image}
                    alt={`Product ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <CldUploadWidget 
              uploadPreset="product-images"
              onUpload={handleImageUpload}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Upload Image
                </button>
              )}
            </CldUploadWidget>
          </div>
        </section>
        
        {/* Pricing & Inventory */}
        <section className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pricing & Inventory</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">Price*</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={product.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="unit" className="block text-sm font-medium mb-1">Unit*</label>
              <select
                id="unit"
                name="unit"
                value={product.unit}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="lb">Pound (lb)</option>
                <option value="piece">Piece</option>
                <option value="bunch">Bunch</option>
                <option value="dozen">Dozen</option>
                <option value="liter">Liter</option>
                <option value="pint">Pint</option>
                <option value="quart">Quart</option>
                <option value="gallon">Gallon</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="quantityAvailable" className="block text-sm font-medium mb-1">Available Quantity*</label>
              <input
                type="number"
                id="quantityAvailable"
                name="quantityAvailable"
                value={product.quantityAvailable}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={product.isAvailable}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                  Product is available for sale
                </label>
              </div>
            </div>
            
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={product.isFeatured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                  Feature this product
                </label>
              </div>
            </div>
          </div>
        </section>
        
        {/* Dates */}
        <section className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="harvestDate" className="block text-sm font-medium mb-1">Harvest Date</label>
              <input
                type="date"
                id="harvestDate"
                name="harvestDate"
                value={product.harvestDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium mb-1">Best Before Date</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={product.expiryDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </section>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}