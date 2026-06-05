'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { roommateAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Check, X, MessageCircle, Clock, ArrowRight } from 'lucide-react';

export default function RoommateInterests() {
  const [tab, setTab] = useState('received');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterests = async () => {
    setLoading(true);
    try {
      const { data } = await roommateAPI.getInterests();
      setInterests(data.interests || []);
    } catch { toast.error('Failed to load interests'); }
    setLoading(false);
  };

  useEffect(() => { fetchInterests(); }, []);

  const handleRespond = async (id, status) => {
    try {
      await roommateAPI.respondInterest(id, { status });
      toast.success(status === 'ACCEPTED' ? 'Interest accepted! You are now connected.' : 'Interest declined');
      fetchInterests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to respond');
    }
  };

  const received = interests.filter(i => i.type === 'RECEIVED' || i.direction === 'received');
  const sent = interests.filter(i => i.type === 'SENT' || i.direction === 'sent');
  const current = tab === 'received' ? received : sent;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Roommate Interests</h1>
          <p className="text-sm text-gray-500 mb-6">Manage your interest requests</p>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button onClick={() => setTab('received')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === 'received' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'}`}>
              Received {received.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[10px] rounded-full">{received.length}</span>}
            </button>
            <button onClick={() => setTab('sent')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === 'sent' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'}`}>
              Sent {sent.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[10px] rounded-full">{sent.length}</span>}
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 flex gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3" />
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : current.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">{tab === 'received' ? '📥' : '📤'}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No {tab} interests</h3>
              <p className="text-sm text-gray-500 mb-4">
                {tab === 'received' ? 'When someone sends you interest, it will show here' : 'Send interest to roommates you like'}
              </p>
              <Link href="/roommate" className="btn-primary inline-flex items-center gap-2">
                Browse Roommates <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {current.map(interest => {
                const profile = interest.fromProfile || interest.toProfile || interest.profile || {};
                const name = profile.name || profile.user?.name || 'Roommate';
                return (
                  <div key={interest.id} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-start gap-4">
                      <Link href={`/roommate/${profile.id}`}>
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 ring-2 ring-orange-200 shrink-0">
                          <img src={profile.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'}
                            alt={name} className="w-full h-full object-cover" />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/roommate/${profile.id}`}>
                          <h3 className="font-bold text-gray-900 text-sm hover:text-orange-500">{name}, {profile.age || '?'}</h3>
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">{profile.profession?.replace(/_/g, ' ')} • {profile.city}</p>
                        {interest.message && (
                          <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-2.5 italic">&ldquo;{interest.message}&rdquo;</p>
                        )}
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="w-3 h-3 text-gray-300" />
                          <span className="text-[10px] text-gray-400">
                            {interest.createdAt ? new Date(interest.createdAt).toLocaleDateString('en-IN') : 'Recently'}
                          </span>
                          {interest.status && (
                            <span className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              interest.status === 'ACCEPTED' ? 'bg-green-100 text-green-600' :
                              interest.status === 'REJECTED' ? 'bg-red-100 text-red-500' : 'bg-yellow-100 text-yellow-600'
                            }`}>{interest.status}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {tab === 'received' && (!interest.status || interest.status === 'PENDING') && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                        <button onClick={() => handleRespond(interest.id, 'ACCEPTED')}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600">
                          <Check className="w-4 h-4" /> Accept
                        </button>
                        <button onClick={() => handleRespond(interest.id, 'REJECTED')}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200">
                          <X className="w-4 h-4" /> Decline
                        </button>
                      </div>
                    )}
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
