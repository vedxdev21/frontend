'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { messAPI, chatAPI } from '@/lib/api';
import { formatEnumLabel, toDisplayText } from '@/lib/display';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Heart, Share2, MapPin, Star,
  MessageCircle, ChevronLeft, ChevronRight, Clock, Bike, Users
} from 'lucide-react';

export default function MessDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [mess, setMess] = useState(null);
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      messAPI.getById(id).then(({ data }) => {
        const m = data.mess || data;
        setMess(m);
        setSaved(m?.isSaved || data?.isSaved || false);
      }),
      messAPI.getMenu(id).then(({ data }) => setMenu(data.menu || data)).catch(() => {}),
    ]).catch(() => toast.error('Mess not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      const { data } = await messAPI.save(id);
      setSaved(data.saved);
      toast.success(data.saved ? 'Saved!' : 'Removed');
    } catch { toast.error('Please login'); }
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) navigator.share({ title: mess?.name, url });
    else { navigator.clipboard.writeText(url); toast.success('Link copied!'); }
  };

  const handleChat = async () => {
    try {
      const { data } = await chatAPI.startConversation({
        recipientId: mess?.owner?.id || mess?.ownerId,
        messId: mess?.id,
      });
      const conversation = data.conversation || data.data?.conversation || data.data || data;
      toast.success('Chat started!');
      router.push(conversation?.id ? `/chat?conversation=${conversation.id}` : '/chat');
    } catch (error) {
      console.error('Failed to start chat:', error);
      const message = error.response?.data?.message || error.message || 'Failed to start chat';
      if (message.includes('token') || message.includes('unauthorized') || message.includes('Unauthorized')) {
        toast.error('Please login to chat');
      } else {
        toast.error(message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="aspect-[16/9] bg-gray-200 animate-pulse rounded-2xl mb-6" />
          <div className="h-8 bg-gray-200 animate-pulse rounded-xl w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 animate-pulse rounded-xl w-1/2 mb-8" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!mess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Mess Not Found</h2>
          <button onClick={() => router.push('/mess')} className="btn-primary mt-4">Browse Mess</button>
        </div>
      </div>
    );
  }

  const photos = mess.photos?.length ? mess.photos : ['https://images.unsplash.com/photo-1725483990150-61a9fbd746d1?w=800&h=500&fit=crop'];
  const features = mess.features || [];
  const mealTypes = mess.mealTypes || [];
  const timings = mess.timings || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Photo Gallery */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-100 mb-6">
          <div className="aspect-[16/9] relative">
            <img src={photos[currentPhoto]} alt={mess.name} className="w-full h-full object-cover" />
            {photos.length > 1 && (
              <>
                <button onClick={() => setCurrentPhoto(p => Math.max(0, p - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setCurrentPhoto(p => Math.min(photos.length - 1, p + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 text-white text-xs rounded-full">
                  {currentPhoto + 1}/{photos.length}
                </span>
              </>
            )}
            <div className="absolute top-3 left-3 flex gap-1.5">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                mess.foodType === 'VEG' ? 'bg-green-500 text-white' : mess.foodType === 'NON_VEG' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
              }`}>{formatEnumLabel(mess.foodType, 'Veg')}</span>
              {mess.deliveryAvailable && <span className="px-2.5 py-1 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center gap-1"><Bike className="w-3 h-3" /> Delivery</span>}
              {mess.tiffinService && <span className="px-2.5 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">Tiffin</span>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              saved ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <Heart className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save'}
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        {/* Title & Rating */}
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{mess.name}</h1>
          <div className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full shrink-0">
            <Star className="w-4 h-4 text-green-500 fill-green-500" />
            <span className="text-sm font-bold text-green-600">{mess.rating || mess.avgRating || '4.0'}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
          <MapPin className="w-4 h-4 text-orange-400" /> {mess.address || ''}, {mess.area}, {mess.city}
        </p>
        {mess.ownerName && <p className="text-xs text-gray-400 mb-4">By {mess.ownerName}</p>}

        {/* Description */}
        {mess.description && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 leading-relaxed">{mess.description}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 mb-3">Pricing</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {mess.pricePerMeal && (
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-extrabold text-gray-900">₹{mess.pricePerMeal}</p>
                <p className="text-xs text-gray-400 mt-1">Per Meal</p>
              </div>
            )}
            {mess.monthlyOneMeal && (
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-extrabold text-orange-500">₹{mess.monthlyOneMeal}</p>
                <p className="text-xs text-gray-400 mt-1">1 Meal/day</p>
              </div>
            )}
            {mess.monthlyTwoMeals && (
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-extrabold text-orange-500">₹{mess.monthlyTwoMeals}</p>
                <p className="text-xs text-gray-400 mt-1">2 Meals/day</p>
              </div>
            )}
            {mess.monthlyThreeMeals && (
              <div className="bg-orange-50 rounded-xl border-2 border-orange-200 p-4 text-center">
                <p className="text-xs text-orange-500 font-bold mb-1">BEST VALUE</p>
                <p className="text-2xl font-extrabold text-orange-600">₹{mess.monthlyThreeMeals}</p>
                <p className="text-xs text-gray-400 mt-1">3 Meals/day</p>
              </div>
            )}
            {mess.trialMealPrice && (
              <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
                <p className="text-2xl font-extrabold text-green-600">₹{mess.trialMealPrice}</p>
                <p className="text-xs text-gray-400 mt-1">Trial Meal</p>
              </div>
            )}
          </div>
        </div>

        {/* Timings */}
        {Object.keys(timings).length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Timings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(timings).map(([meal, time]) => (
                <div key={meal} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{meal}</p>
                    <p className="text-xs text-gray-400">{toDisplayText(time, 'Not set')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Menu */}
        {menu && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Today&apos;s Menu</h3>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              {Array.isArray(menu) ? menu.map((m, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <p className="text-xs text-orange-500 font-bold uppercase mb-1">{m.mealType}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(m.items || []).map((item, itemIndex) => (
                      <span key={`${m.mealType || 'item'}-${itemIndex}`} className="px-3 py-1 bg-orange-50 text-orange-700 text-xs rounded-full">{toDisplayText(item)}</span>
                    ))}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500">Menu data available on visit</p>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Features</h3>
            <div className="flex flex-wrap gap-2">
              {features.map((f, index) => (
                <span key={`${toDisplayText(f, 'feature')}-${index}`} className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-600">
                  {formatEnumLabel(f)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 mb-3">Details</h3>
          <div className="grid grid-cols-2 gap-3">
            {mess.seatingCapacity && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Seating</p>
                  <p className="text-sm font-medium">{mess.seatingCapacity} seats</p>
                </div>
              </div>
            )}
            {mess.deliveryRadius && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                <Bike className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Delivery Radius</p>
                  <p className="text-sm font-medium">{mess.deliveryRadius} km</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 md:max-w-4xl md:mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-extrabold text-gray-900">₹{(mess?.pricePerMeal || 0).toLocaleString('en-IN')}</span>
            <span className="text-sm text-gray-400">/meal</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleChat} className="btn-primary flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" /> Chat
            </button>
          </div>
        </div>
      </div>

      <div className="h-20" /> {/* Spacer for bottom bar */}
      <Footer />
    </div>
  );
}
