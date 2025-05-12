"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Sign out
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {session?.user.name || 'User'}</h2>
        <p className="text-gray-700 mb-2">
          You are signed in as: {session?.user.email} 
        </p>
        <p className="text-gray-700">
          Role: {session?.user.role || 'Not specified'}
        </p>
      </div>
      
      {session?.user.role === 'FARMER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3">Farm Profile</h2>
            <p className="text-gray-600 mb-4">
              Create or update your farm profile to showcase your farm to potential customers.
            </p>
            <Link
              href="/farmer/profile"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Manage Farm Profile
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3">Products</h2>
            <p className="text-gray-600 mb-4">
              Manage your product listings, add new products, and update inventory.
            </p>
            <Link
              href="/farmer/products"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Manage Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}