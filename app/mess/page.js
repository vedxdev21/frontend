'use client';
import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EmptyState from '@/components/EmptyState';
import { messAPI } from '@/lib/api';
import { useLocationStore } from '@/lib/store';
import { CITY_AREAS } from '@/lib/constants';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Star, MapPin, Heart, Bike, ChevronDown, Clock } from 'lucide-react';

function MessCard({ mess }) {
  const [saved, setSaved] = useState(mess.isSaved || false);
  const [activeImage, setActiveImage] = useState(0);
  const photos = mess.photos?.length
    ? mess.photos
    : ['https://images.unsplash.com/photo-1725483990150-61a9fbd746d1?w=400&h=250&fit=crop'];

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data } = await messAPI.save(mess.id);
      setSaved(data.saved);
      toast.success(data.saved ? 'Saved!' : 'Removed from saved');
    } catch {
      toast.error('Please login to save');
    }
  };

  const handleImageScroll = (e) => {
    const { scrollLeft, clientWidth } = e.currentTarget;
    if (!clientWidth) return;
    setActiveImage(Math.round(scrollLeft / clientWidth));
  };

  return (
    <Link href={`/mess/${mess.id}`}>
      <div className="card-hover overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
        <div className="relative aspect-[4/5] md:aspect-[16/10] bg-gray-100 overflow-hidden">
          <div className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide" onScroll={handleImageScroll}>
            {photos.map((photo, idx) => (
              <img
                key={`${mess.id || 'mess'}-${idx}`}
                src={photo}
                alt={`${mess.name || 'Mess'} ${idx + 1}`}
                className="h-full w-full shrink-0 snap-center object-cover group-hover:scale-[1.02] transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1725483990150-61a9fbd746d1?w=400&h=250&fit=crop';
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-transparent opacity-70 group-hover:opacity-85 transition-opacity" />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
              mess.foodType === 'VEG' || mess.foodType === 'Veg' ? 'bg-green-500 text-white' : 
              mess.foodType === 'NON_VEG' || mess.foodType === 'Non-Veg' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
            }`}>{mess.foodType?.replace('_', '-') || 'Veg'}</span>
            {(mess.deliveryAvailable || mess.delivery) && (
              <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center gap-0.5">
                <Bike className="w-3 h-3" /> Delivery
              </span>
            )}
          </div>
          <button onClick={handleSave}
            className={`absolute top-3 right-3 p-1.5 rounded-full shadow-sm hover:scale-110 transition-all ${
              saved ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600'
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
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{mess.name}</h3>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded-full shrink-0">
              <Star className="w-3 h-3 text-green-500 fill-green-500" />
              <span className="text-xs font-bold text-green-600">{mess.rating || mess.avgRating || '4.0'}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3" /> {mess.area}, {mess.city}
          </p>
          {mess.tiffinService && (
            <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-full mb-2">
              Tiffin Service
            </span>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <span className="text-sm font-bold text-gray-900">From ₹{mess.pricePerMeal || 50}/meal</span>
            <span className="text-xs text-gray-400">₹{mess.monthlyOneMeal || mess.monthlyPrice || 2500}/mo</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-orange-100/60 overflow-hidden shadow-sm">
      <div className="aspect-[16/10] bg-gradient-to-br from-orange-50 to-amber-50 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-orange-50 animate-pulse rounded-full w-2/3" />
        <div className="h-3 bg-orange-50 animate-pulse rounded-full w-1/2" />
        <div className="h-4 bg-orange-50 animate-pulse rounded-full w-1/3 mt-2" />
      </div>
    </div>
  );
}

export default function MessBrowse() {
  const { city } = useLocationStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [messList, setMessList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedArea, setSelectedArea] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const effectiveCity = isHydrated ? (city || 'Bhopal') : 'Bhopal';

  // Reset local area filter when city changes
  useEffect(() => {
    setSelectedArea('');
  }, [effectiveCity]);

  const fetchMess = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const params = { city: effectiveCity, page: pageNum, limit: 12 };
      if (selectedArea) params.area = selectedArea;
      if (activeFilter === 'Veg') params.foodType = 'VEG';
      if (activeFilter === 'Non-Veg') params.foodType = 'NON_VEG';
      if (activeFilter === 'Delivery') params.delivery = 'true';
      if (activeFilter === 'Tiffin') params.tiffin = 'true';

      const { data } = await messAPI.browse(params);
      const list = data.mess || data.messList || data.data || data._list || [];
      setMessList(prev => append ? [...prev, ...list] : list);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || list.length);
    } catch {
      toast.error('Failed to load mess listings');
    }
    setLoading(false);
  }, [effectiveCity, selectedArea, activeFilter]);

  useEffect(() => {
    setPage(1);
    fetchMess(1);
  }, [effectiveCity, selectedArea, activeFilter, fetchMess]);

  const loadMore = () => {
    if (page < totalPages) {
      const next = page + 1;
      setPage(next);
      fetchMess(next, true);
    }
  };

  const filters = ['All', 'Veg', 'Non-Veg', 'Delivery', 'Tiffin'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900"><span className="text-orange-500">{total || messList.length}</span> Mess in {selectedArea ? `${selectedArea}, ${effectiveCity}` : effectiveCity}</h1>
            <p className="text-sm text-gray-400 mt-0.5">Home-style meals near you</p>
          </div>
          <Link href="/mess/register" className="btn-primary text-sm">Register Your Mess</Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeFilter === f ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_6px_14px_-6px_rgba(249,115,22,0.7)]' : 'bg-white border border-orange-100 text-gray-600 hover:bg-orange-50 hover:text-orange-500'
                }`}>{f}</button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Area:</span>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="text-xs font-semibold bg-white border border-orange-100 text-gray-600 rounded-full px-3 py-1.5 outline-none cursor-pointer hover:bg-orange-50 hover:text-orange-500 transition-all shadow-sm"
            >
              <option value="">All Areas</option>
              {CITY_AREAS[effectiveCity]?.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && messList.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : messList.length === 0 ? (
          <EmptyState icon="🍽️" title={`No mess found in ${effectiveCity}`}
            description="Be the first to register your mess here!"
            ctaLabel="Register Mess" ctaHref="/mess/register" />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {messList.map((m) => (
                <div key={m.id}>
                  <MessCard mess={m} />
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
