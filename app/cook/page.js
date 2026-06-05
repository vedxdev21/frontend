'use client';
import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EmptyState from '@/components/EmptyState';
import { cookAPI } from '@/lib/api';
import { useLocationStore } from '@/lib/store';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Star, MapPin, Heart, Clock, ChefHat, ChevronDown } from 'lucide-react';

function CookCard({ cook }) {
  const [saved, setSaved] = useState(cook.isSaved || false);
  const [activeImage, setActiveImage] = useState(0);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data } = await cookAPI.save(cook.id);
      setSaved(data.saved);
      toast.success(data.saved ? 'Saved!' : 'Removed from saved');
    } catch {
      toast.error('Please login to save');
    }
  };

  const cuisines = cook.cuisineTypes || cook.cuisines || [];
  const photos = cook.photos?.length
    ? cook.photos
    : [cook.photo || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&h=700&fit=crop&crop=face'];

  const handleImageScroll = (e) => {
    const { scrollLeft, clientWidth } = e.currentTarget;
    if (!clientWidth) return;
    setActiveImage(Math.round(scrollLeft / clientWidth));
  };

  return (
    <Link href={`/cook/${cook.id}`}>
      <div className="card-hover overflow-hidden group">
        <div className="relative aspect-[4/5] md:aspect-[16/10] bg-gray-100 overflow-hidden">
          <div className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide" onScroll={handleImageScroll}>
            {photos.map((photo, idx) => (
              <img
                key={`${cook.id || 'cook'}-${idx}`}
                src={photo}
                alt={`${cook.fullName || cook.name || 'Cook'} ${idx + 1}`}
                className="h-full w-full shrink-0 snap-center object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&h=700&fit=crop&crop=face';
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-transparent" />
          <button onClick={handleSave}
            className={`absolute top-3 right-3 p-1.5 rounded-full shadow-sm hover:scale-110 transition-all ${
              saved ? 'bg-red-500 text-white' : 'bg-white/95 text-gray-600'
            }`}>
            <Heart className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
          </button>
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
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 shrink-0 ring-2 ring-orange-200">
              <img src={cook.photo || photos[0]}
                alt={cook.fullName || cook.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm truncate">{cook.fullName || cook.name}</h3>
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 rounded-full shrink-0">
                  <Star className="w-3 h-3 text-green-500 fill-green-500" />
                  <span className="text-[10px] font-bold text-green-600">{cook.rating || cook.avgRating || '4.0'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  cook.speciality === 'VEG' || cook.speciality === 'Veg' ? 'bg-green-100 text-green-600' : 
                  cook.speciality === 'NON_VEG' || cook.speciality === 'Non-Veg' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                }`}>{cook.speciality?.replace('_', '-') || 'Both'}</span>
                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                  <Clock className="w-3 h-3" /> {cook.experience}yr exp
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {cuisines.slice(0, 3).map(c => (
                  <span key={c} className="text-[10px] px-2 py-0.5 bg-gray-50 rounded-full text-gray-500">
                    {c.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                <span className="text-sm font-bold text-gray-900">From ₹{cook.pricePerVisit || 250}/visit</span>
                <span className="text-xs text-gray-400">{cook.area || cook.city}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 animate-pulse rounded-full w-1/2" />
          <div className="h-3 bg-gray-200 animate-pulse rounded-full w-1/3" />
          <div className="h-3 bg-gray-200 animate-pulse rounded-full w-2/3" />
          <div className="h-4 bg-gray-200 animate-pulse rounded-full w-1/4 mt-2" />
        </div>
      </div>
    </div>
  );
}

export default function CookBrowse() {
  const { city } = useLocationStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [cooks, setCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const effectiveCity = isHydrated ? (city || 'Bhopal') : 'Bhopal';

  const fetchCooks = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const params = { city: effectiveCity, page: pageNum, limit: 12 };
      if (activeFilter === 'Veg') params.speciality = 'VEG';
      if (activeFilter === 'Non-Veg') params.speciality = 'NON_VEG';
      if (activeFilter === 'North Indian') params.cuisine = 'NORTH_INDIAN';
      if (activeFilter === 'South Indian') params.cuisine = 'SOUTH_INDIAN';
      if (activeFilter === 'Chinese') params.cuisine = 'CHINESE';

      const { data } = await cookAPI.browse(params);
      const list = data.cooks || data.data || data._list || [];
      setCooks(prev => append ? [...prev, ...list] : list);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || list.length);
    } catch {
      toast.error('Failed to load cooks');
    }
    setLoading(false);
  }, [effectiveCity, activeFilter]);

  useEffect(() => {
    setPage(1);
    fetchCooks(1);
  }, [fetchCooks]);

  const loadMore = () => {
    if (page < totalPages) {
      const next = page + 1;
      setPage(next);
      fetchCooks(next, true);
    }
  };

  const filters = ['All', 'Veg', 'Non-Veg', 'North Indian', 'South Indian', 'Chinese'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{total || cooks.length} Cooks in {effectiveCity}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Hire personal cooks for daily or monthly service</p>
          </div>
          <Link href="/cook/register" className="btn-primary text-sm">Register as Cook</Link>
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-500'
              }`}>{f}</button>
          ))}
        </div>

        {loading && cooks.length === 0 ? (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-col md:gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="min-w-[86vw] max-w-[86vw] snap-center md:min-w-0 md:max-w-none">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : cooks.length === 0 ? (
          <EmptyState icon="👨‍🍳" title={`No cooks found in ${effectiveCity}`}
            description="Register as a cook and start getting bookings!"
            ctaLabel="Register as Cook" ctaHref="/cook/register" />
        ) : (
          <>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-col md:gap-3">
              {cooks.map((c) => (
                <div key={c.id} className="min-w-[86vw] max-w-[86vw] snap-center md:min-w-0 md:max-w-none">
                  <CookCard cook={c} />
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
