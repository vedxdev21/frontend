'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { roommateAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { MessageCircle, Phone, MapPin } from 'lucide-react';

export default function RoommateConnections() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roommateAPI.getConnections()
      .then(({ data }) => setConnections(data.connections || []))
      .catch(() => toast.error('Failed to load connections'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">My Connections</h1>
          <p className="text-sm text-gray-500 mb-6">Roommates you&apos;ve connected with</p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-5 flex gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-1/2" />
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No connections yet</h3>
              <p className="text-sm text-gray-500 mb-4">Accept interest requests to connect with roommates</p>
              <Link href="/roommate/interests" className="btn-primary">View Interests</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {connections.map(conn => {
                const profile = conn.profile || conn;
                const name = profile.name || profile.user?.name || 'Roommate';
                return (
                  <div key={conn.id || profile.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-4 mb-3">
                      <Link href={`/roommate/${profile.id}`}>
                        <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-green-200 shrink-0">
                          <img src={profile.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'}
                            alt={name} className="w-full h-full object-cover" />
                        </div>
                      </Link>
                      <div>
                        <h3 className="font-bold text-gray-900">{name}, {profile.age || '?'}</h3>
                        <p className="text-xs text-gray-400">{profile.profession?.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {profile.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                      <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full">Connected</span>
                      <div className="flex-1" />
                      <Link href="/chat" className="p-2 bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-100">
                        <MessageCircle className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
