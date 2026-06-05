'use client';
import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EmptyState from '@/components/EmptyState';
import { roommateAPI } from '@/lib/api';
import { useLocationStore } from '@/lib/store';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Heart, MapPin, Briefcase, Users, Sparkles, ChevronDown, SlidersHorizontal } from 'lucide-react';

function CompatibilityRing({ score }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#f97316';
  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="6" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-extrabold" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
}

function RoommateCard({ roommate }) {
  const [activeImage, setActiveImage] = useState(0);
  const photos = roommate.photos?.length
    ? roommate.photos
    : [roommate.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=700&fit=crop&crop=face'];

  const handleImageScroll = (e) => {
    const { scrollLeft, clientWidth } = e.currentTarget;
    if (!clientWidth) return;
    setActiveImage(Math.round(scrollLeft / clientWidth));
  };

  return (
    <Link href={`/roommate/${roommate.id}`}>
      <div className="card-hover overflow-hidden text-center group">
        <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
          <div className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide" onScroll={handleImageScroll}>
            {photos.map((photo, idx) => (
              <img
                key={`${roommate.id || 'roommate'}-${idx}`}
                src={photo}
                alt={`${roommate.name || roommate.user?.name || 'Roommate'} ${idx + 1}`}
                className="h-full w-full shrink-0 snap-center object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=700&fit=crop&crop=face';
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-transparent" />
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/35 backdrop-blur-sm">
              {photos.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${activeImage === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/65'}`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="p-5">
        <h3 className="font-bold text-gray-900 text-sm">{roommate.name || roommate.user?.name}, {roommate.age}</h3>
        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full mt-1">{roommate.profession}</span>
        <div className="flex justify-center my-3">
          <CompatibilityRing score={roommate.compatibility?.score || roommate.compatibilityScore || 75} />
        </div>
        <div className="flex justify-center gap-2 mb-3">
          <span className="text-lg" title={roommate.food === 'VEG' || roommate.food === 'Veg' ? 'Vegetarian' : 'Non-Veg'}>
            {roommate.food === 'VEG' || roommate.food === 'Veg' ? '🥗' : '🍖'}
          </span>
          <span className="text-lg" title={roommate.sleep}>
            {roommate.sleep === 'EARLY_BIRD' || roommate.sleep === 'Early Bird' ? '🌅' : '🌙'}
          </span>
          <span className="text-lg" title={roommate.smoking === 'NO' || !roommate.smoking ? 'Non-smoker' : 'Smoker'}>
            {roommate.smoking === 'NO' || !roommate.smoking ? '🚫' : '🚬'}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-2">₹{(roommate.budgetMin || 0).toLocaleString()}-{(roommate.budgetMax || 0).toLocaleString()}/mo</p>
        {roommate.hasRoom && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full">
            Has Room
          </span>
        )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-orange-100/60 p-5 text-center shadow-sm">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 animate-pulse mx-auto mb-3" />
      <div className="h-4 bg-orange-50 animate-pulse rounded-full w-2/3 mx-auto mb-2" />
      <div className="h-3 bg-orange-50 animate-pulse rounded-full w-1/2 mx-auto mb-3" />
      <div className="w-24 h-24 rounded-full bg-orange-50 animate-pulse mx-auto mb-3" />
      <div className="h-3 bg-orange-50 animate-pulse rounded-full w-1/3 mx-auto" />
    </div>
  );
}

export default function RoommateBrowse() {
  const { city } = useLocationStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const effectiveCity = isHydrated ? (city || 'Bhopal') : 'Bhopal';

  const fetchProfiles = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const params = { city: effectiveCity, page: pageNum, limit: 12 };
      if (activeFilter === 'Male') params.gender = 'MALE';
      if (activeFilter === 'Female') params.gender = 'FEMALE';
      if (activeFilter === 'Has Room') params.hasRoom = 'true';
      if (activeFilter === 'Student') params.profession = 'STUDENT';
      if (activeFilter === 'Working') params.profession = 'WORKING_PROFESSIONAL';

      const { data } = await roommateAPI.browse(params);
      const list = data.profiles || data.roommates || data.data || data._list || [];
      setProfiles(prev => append ? [...prev, ...list] : list);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Failed to load roommate profiles');
    }
    setLoading(false);
  }, [effectiveCity, activeFilter]);

  useEffect(() => {
    setPage(1);
    fetchProfiles(1);
  }, [effectiveCity, activeFilter, fetchProfiles]);

  const loadMore = () => {
    if (page < totalPages) {
      const next = page + 1;
      setPage(next);
      fetchProfiles(next, true);
    }
  };

  const filters = ['All', 'Male', 'Female', 'Has Room', 'Student', 'Working'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Find Roommates in <span className="text-orange-500">{effectiveCity}</span></h1>
            <p className="text-sm text-gray-400 mt-0.5">Smart matching based on lifestyle & preferences</p>
          </div>
          <Link href="/roommate/create-profile" className="btn-primary text-sm">Create Profile</Link>
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === f ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_6px_14px_-6px_rgba(249,115,22,0.7)]' : 'bg-white border border-orange-100 text-gray-600 hover:bg-orange-50 hover:text-orange-500'
              }`}>{f}</button>
          ))}
        </div>

        {loading && profiles.length === 0 ? (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="min-w-[82vw] max-w-[82vw] snap-center sm:min-w-0 sm:max-w-none">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <EmptyState icon="👥" title="No roommates found" description={`Be the first to create a roommate profile in ${effectiveCity}!`}
            ctaLabel="Create Profile" ctaHref="/roommate/create-profile" />
        ) : (
          <>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 sm:gap-4">
              {profiles.map((r) => (
                <div key={r.id} className="min-w-[82vw] max-w-[82vw] snap-center sm:min-w-0 sm:max-w-none">
                  <RoommateCard roommate={r} />
                </div>
              ))}
            </div>
            {page < totalPages && (
              <div className="text-center mt-8">
                <button onClick={loadMore} disabled={loading}
                  className="btn-secondary inline-flex items-center gap-2">
                  {loading ? 'Loading...' : 'Load More'}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
