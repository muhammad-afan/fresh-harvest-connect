"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { CldUploadWidget } from 'next-cloudinary';

export default function FarmerProfileForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({
    farmName: '',
    description: '',
    profileImage: '',
    coverImage: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    contactInfo: {
      phone: '',
      email: '',
      website: '',
    },
    farmingMethods: [] as string[],
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
    },
    establishedYear: '',
    farmSize: '',
    gallery: [] as string[],
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
    
    // Fetch existing profile if available
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/farmer/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setProfile(data.profile);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    
    fetchProfile();
  }, [status, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        }
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFarmingMethodChange = (method: string) => {
    setProfile(prev => {
      const methods = prev.farmingMethods.includes(method)
        ? prev.farmingMethods.filter(m => m !== method)
        : [...prev.farmingMethods, method];
      
      return { ...prev, farmingMethods: methods };
    });
  };

  const handleImageUpload = (result: any, field: 'profileImage' | 'coverImage' | 'gallery') => {
    if (result.event === 'success') {
      if (field === 'gallery') {
        setProfile(prev => ({
          ...prev,
          gallery: [...prev.gallery, result.info.secure_url]
        }));
      } else {
        setProfile(prev => ({
          ...prev,
          [field]: result.info.secure_url
        }));
      }
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setProfile(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/farmer/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }
      
      setSuccess('Profile saved successfully!');
      setTimeout(() => {
        router.refresh();
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Farmer Profile</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">{success}</div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <section className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="farmName" className="block text-sm font-medium mb-1">Farm Name*</label>
              <input
                type="text"
                id="farmName"
                name="farmName"
                value={profile.farmName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="establishedYear" className="block text-sm font-medium mb-1">Year Established</label>
              <input
                type="number"
                id="establishedYear"
                name="establishedYear"
                value={profile.establishedYear}
                onChange={handleInputChange}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium mb-1">Farm Description*</label>
              <textarea
                id="description"
                name="description"
                value={profile.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="farmSize" className="block text-sm font-medium mb-1">Farm Size</label>
              <input
                type="text"
                id="farmSize"
                name="farmSize"
                value={profile.farmSize}
                onChange={handleInputChange}
                placeholder="e.g., 5 acres"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </section>
        
        {/* Farm Images */}
        <section className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Farm Images</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Profile Image*</label>
              {profile.profileImage ? (
                <div className="relative h-40 w-40 mb-2">
                  <Image
                    src={profile.profileImage}
                    alt="Profile"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-md"
                  />
                </div>
              ) : null}
              
              <CldUploadWidget 
                uploadPreset="farmer-profiles"
                onUpload={(result) => handleImageUpload(result, 'profileImage')}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    {profile.profileImage ? 'Change Profile Image' : 'Upload Profile Image'}
                  </button>
                )}
              </CldUploadWidget>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Cover Image</label>
              {profile.coverImage ? (
                <div className="relative h-40 w-full mb-2">
                  <Image
                    src={profile.coverImage}
                    alt="Cover"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-md"
                  />
                </div>
              ) : null}
              
              <CldUploadWidget 
                uploadPreset="farmer-covers"
                onUpload={(result) => handleImageUpload(result, 'coverImage')}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    {profile.coverImage ? 'Change Cover Image' : 'Upload Cover Image'}
                  </button>
                )}
              </CldUploadWidget>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Farm Gallery</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {profile.gallery.map((image, index) => (
                  <div key={index} className="relative h-32">
                    <Image
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <CldUploadWidget 
                uploadPreset="farmer-gallery"
                onUpload={(result) => handleImageUpload(result, 'gallery')}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Add Gallery Image
                  </button>
                )}
              </CldUploadWidget>
            </div>
          </div>
        </section>
        
        {/* Farm Address */}
        <section className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Farm Address</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="address.street" className="block text-sm font-medium mb-1">Street*</label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={profile.address.street}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="address.city" className="block text-sm font-medium mb-1">City*</label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={profile.address.city}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="address.state" className="block text-sm font-medium mb-1">State/Province*</label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                value={profile.address.state}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="address.zipCode" className="block text-sm font-medium mb-1">Zip/Postal Code*</label>
              <input
                type="text"
                id="address.zipCode"
                name="address.zipCode"
                value={profile.address.zipCode}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="address.country" className="block text-sm font-medium mb-1">Country*</label>
              <input
                type="text"
                id="address.country"
                name="address.country"
                value={profile.address.country}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </section>
        
        {/* Contact Information */}
        <section className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="contactInfo.phone" className="block text-sm font-medium mb-1">Phone*</label>
              <input
                type="tel"
                id="contactInfo.phone"
                name="contactInfo.phone"
                value={profile.contactInfo.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="contactInfo.email" className="block text-sm font-medium mb-1">Email*</label>
              <input
                type="email"
                id="contactInfo.email"
                name="contactInfo.email"
                value={profile.contactInfo.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="contactInfo.website" className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                id="contactInfo.website"
                name="contactInfo.website"
                value={profile.contactInfo.website}
                onChange={handleInputChange}
                placeholder="https://www.example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </section>
        
        {/* Farming Methods */}
        <section className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Farming Methods</h2>
          
          <div className="space-y-2">
            {['Organic', 'Conventional', 'Hydroponic', 'Permaculture', 'Biodynamic', 'Sustainable', 'Other'].map((method) => (
              <div key={method} className="flex items-center">
                <input
                  id={`method-${method}`}
                  type="checkbox"
                  checked={profile.farmingMethods.includes(method)}
                  onChange={() => handleFarmingMethodChange(method)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={`method-${method}`} className="ml-2 block text-sm text-gray-700">
                  {method}
                </label>
              </div>
            ))}
          </div>
        </section>
        
        {/* Social Media */}
        <section className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Social Media</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="socialMedia.facebook" className="block text-sm font-medium mb-1">Facebook</label>
              <input
                type="url"
                id="socialMedia.facebook"
                name="socialMedia.facebook"
                value={profile.socialMedia.facebook}
                onChange={handleInputChange}
                placeholder="https://facebook.com/yourfarm"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="socialMedia.instagram" className="block text-sm font-medium mb-1">Instagram</label>
              <input
                type="url"
                id="socialMedia.instagram"
                name="socialMedia.instagram"
                value={profile.socialMedia.instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/yourfarm"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="socialMedia.twitter" className="block text-sm font-medium mb-1">Twitter</label>
              <input
                type="url"
                id="socialMedia.twitter"
                name="socialMedia.twitter"
                value={profile.socialMedia.twitter}
                onChange={handleInputChange}
                placeholder="https://twitter.com/yourfarm"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="socialMedia.youtube" className="block text-sm font-medium mb-1">YouTube</label>
              <input
                type="url"
                id="socialMedia.youtube"
                name="socialMedia.youtube"
                value={profile.socialMedia.youtube}
                onChange={handleInputChange}
                placeholder="https://youtube.com/yourchannel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </section>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}