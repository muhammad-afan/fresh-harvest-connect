"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import FarmerProfileForm from '@/components/farmer/ProfileForm';

export default function FarmerProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState(false);
  
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
    
    // Check if farmer has a profile
    const checkProfile = async () => {
      try {
        const response = await fetch('/api/farmer/profile');
        if (response.ok) {
          const data = await response.json();
          setHasProfile(!!data.profile);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      }
    };
    
    checkProfile();
  }, [status, session, router]);

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            {!hasProfile ? (
              <div className="p-6 bg-white border-b border-gray-200">
                <h1 className="text-2xl font-bold mb-4">Create Your Farm Profile</h1>
                <p className="mb-6 text-gray-600">
                  Welcome to Fresh Harvest Connect! Please create your farm profile to start selling your products.
                  This information will be visible to customers browsing the platform.
                </p>
              </div>
            ) : (
              <div className="p-6 bg-white border-b border-gray-200">
                <h1 className="text-2xl font-bold mb-4">Edit Your Farm Profile</h1>
                <p className="mb-6 text-gray-600">
                  Update your farm information to keep your customers informed about your farm.
                </p>
              </div>
            )}
            
            <FarmerProfileForm />
          </div>
        </div>
      </div>
    </div>
  );
}