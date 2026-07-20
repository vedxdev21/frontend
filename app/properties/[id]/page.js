'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { propertyAPI, chatAPI } from '@/lib/api';
import { AMENITIES } from '@/lib/constants';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Heart, Share2, MapPin, Eye, BadgeCheck, Sparkles, Phone as PhoneIcon,
  MessageCircle, ChevronLeft, ChevronRight, Copy, Check, Star, Shield, Clock, Home
} from 'lucide-react';

export default function PropertyDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showNumber, setShowNumber] = useState(null);
  const [copied, setCopied] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    propertyAPI.getById(id)
      .then(({ data }) => {
        const prop = data.property || data;
        setProperty(prop);
        setSaved(prop?.isSaved || data?.isSaved || false);
      })
      .catch(() => toast.error('Property not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      const { data } = await propertyAPI.save(id);
      setSaved(data.saved);
      toast.success(data.saved ? 'Saved!' : 'Removed');
    } catch { toast.error('Please login'); }
  };

  const handleShowNumber = async () => {
    try {
      const { data } = await propertyAPI.showNumber(id);
      setShowNumber(data.phone);
    } catch { toast.error('Please login to view number'); }
  };

  const handleCopyNumber = () => {
    if (showNumber) {
      navigator.clipboard.writeText(showNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Number copied!');
    }
  };

  const handleChat = async () => {
    try {
      const { data } = await chatAPI.startConversation({
        recipientId: property?.owner?.id || property?.ownerId,
        propertyId: property?.id,
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

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      navigator.share({ title: property?.title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
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
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-200 animate-pulse rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">\ud83d\udea7</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <button onClick={() => router.push('/properties')} className="btn-primary mt-4">Browse Properties</button>
        </div>
      </div>
    );
  }

  const photos = property.photos?.length ? property.photos : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop'];
  const amenityDetails = (property.amenities || []).map(a => {
    const found = AMENITIES.find(am => am.id === a);
    return found || { id: a, label: a, icon: '\u2728' };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </button>

        {/* Rented Banner */}
        {property.status === 'RENTED' && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-red-900">This property is rented out</p>
              <p className="text-xs text-red-600">It is no longer available for booking, chat, or inquiry.</p>
            </div>
          </div>
        )}

        {/* Photo Gallery */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 mb-6">
          <div className="aspect-[16/9] relative flex items-center justify-center">
            <img src={photos[currentPhoto]} alt={property.title} className="max-h-full max-w-full object-contain" />
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
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2 mb-6">
          <button onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              saved ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <Heart className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
            {saved ? 'Saved' : 'Save'}
          </button>
          <button onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        {/* Title & Price */}
        <div className="flex flex-wrap items-start gap-2 mb-2">
          {property.verified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full">
              <BadgeCheck className="w-3.5 h-3.5" /> Verified
            </span>
          )}
          {property.featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> Featured
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">{property.title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <MapPin className="w-4 h-4 text-orange-400" />
          <span>{property.area}, {property.city}</span>
          <span className="text-gray-300">|</span>
          <Eye className="w-4 h-4" /> <span>{property.viewCount || property.views || 0} views</span>
        </div>

        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-3xl font-extrabold text-gray-900">₹{(property.rent || 0).toLocaleString('en-IN')}</span>
          <span className="text-gray-400">/month</span>
          {property.deposit > 0 && (
            <span className="text-sm text-gray-500 ml-2">Deposit: ₹{(property.deposit || 0).toLocaleString('en-IN')}</span>
          )}
          {property.negotiable === 'NEGOTIABLE' && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-bold rounded-full ml-2">Negotiable</span>
          )}
        </div>

        {/* Quick Info Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl text-sm font-medium">{property.propertyType}</span>
          <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium">{property.furnishing}</span>
          {property.availableFor && (
            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium">For {property.availableFor}</span>
          )}
          {property.dependency && (
            <span className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-xl text-sm font-medium">{property.dependency}</span>
          )}
        </div>

        {/* Description */}
        {property.description && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
          </div>
        )}

        {/* Amenities */}
        {amenityDetails.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-3">Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {amenityDetails.map(a => (
                <div key={a.id} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                  <span className="text-lg">{a.icon}</span>
                  <span className="text-sm text-gray-700">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-3">Location</h3>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">{property.address}</p>
                <p className="text-sm text-gray-500">{property.area}, {property.city} - {property.pincode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nearby */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-3">Nearby Places</h3>
          <div className="flex flex-wrap gap-2">
            {['\ud83c\udf93 College', '\ud83c\udfe5 Hospital', '\ud83d\uded2 Market', '\ud83d\ude8c Bus Stop', '\ud83d\ude87 Metro', '\ud83c\udfea Mall'].map(p => (
              <span key={p} className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-600">{p}</span>
            ))}
          </div>
        </div>

        {/* Owner Info */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-3">Owner</h3>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center">
              {property?.owner?.profilePhoto ? (
                <img src={property.owner.profilePhoto} alt={property?.owner?.name || property?.ownerName || 'Property Owner'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-orange-600 font-bold text-lg">
                  {(property?.owner?.name || property?.ownerName || 'Property Owner')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{property?.owner?.name || property?.ownerName || 'Property Owner'}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {property?.owner?.isPhoneVerified && (
                  <span className="flex items-center gap-1 text-green-500">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Member since {property?.owner?.createdAt ? new Date(property.owner.createdAt).getFullYear() : '2024'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 md:max-w-4xl md:mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="shrink-0">
            <span className="text-lg sm:text-xl font-extrabold text-gray-900">₹{(property.rent || 0).toLocaleString('en-IN')}</span>
            <span className="text-xs sm:text-sm text-gray-400">/mo</span>
          </div>
          {property.status === 'RENTED' ? (
            <div className="flex-1 text-right">
              <span className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-red-100 text-red-700 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                RENTED OUT
              </span>
            </div>
          ) : (
            <div className="flex gap-2 flex-1 justify-end min-w-0">
              {showNumber ? (
                <button onClick={handleCopyNumber}
                  className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 bg-green-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex-1 sm:flex-initial min-w-0">
                  {copied ? <Check className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                  <span className="truncate">{showNumber}</span>
                </button>
              ) : (
                <button onClick={handleShowNumber}
                  className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 bg-green-500 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-green-600 flex-1 sm:flex-initial min-w-0">
                  <PhoneIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">Show Number</span>
                </button>
              )}
              <button onClick={handleChat} className="btn-primary flex items-center justify-center gap-1.5 !px-3 sm:!px-5 !py-2.5 flex-1 sm:flex-initial min-w-0">
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="h-20" /> {/* Spacer for bottom bar */}
      <Footer />
    </div>
  );
}
