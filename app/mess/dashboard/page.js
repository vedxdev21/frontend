'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { messAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Eye, Users, Star, TrendingUp, Edit3 } from 'lucide-react';

export default function MessDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messAPI.getDashboard()
      .then(({ data }) => setDashboard(data.dashboard || data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const mess = dashboard?.mess;
  const savedCount = mess?._count?.savedBy || dashboard?.saves || 0;
  const reviewCount = mess?._count?.reviews || 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Mess Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your mess listing</p>
            </div>
            <Link href="/mess/register" className="btn-secondary text-sm flex items-center gap-1.5">
              <Edit3 className="w-4 h-4" /> Edit Profile
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />)}
            </div>
          ) : !dashboard ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No mess registered</h3>
              <p className="text-sm text-gray-500 mb-4">Register your mess to start receiving customers</p>
              <Link href="/mess/register" className="btn-primary">Register Mess</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <Eye className="w-5 h-5 text-orange-400 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{mess?.viewCount || dashboard.views || 0}</p>
                  <p className="text-xs text-gray-400">Total Views</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <Users className="w-5 h-5 text-blue-400 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{savedCount}</p>
                  <p className="text-xs text-gray-400">Saved by Users</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <Star className="w-5 h-5 text-green-400 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{reviewCount}</p>
                  <p className="text-xs text-gray-400">Reviews</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <TrendingUp className="w-5 h-5 text-purple-400 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{mess?.isVerified ? 'Yes' : 'No'}</p>
                  <p className="text-xs text-gray-400">Verified</p>
                </div>
              </div>

              {mess && (
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-3">Your Mess</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                      <img src={mess.photos?.[0] || 'https://images.unsplash.com/photo-1725483990150-61a9fbd746d1?w=200&h=200&fit=crop'}
                        alt={mess.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{mess.name}</h4>
                      <p className="text-xs text-gray-400">{mess.area}, {mess.city}</p>
                      <p className="text-sm font-bold text-orange-500 mt-1">₹{mess.pricePerMeal}/meal</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
