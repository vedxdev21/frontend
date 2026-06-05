'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, MapPin, ArrowRight, BadgeCheck, Sparkles } from 'lucide-react';
import { propertyAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1549499090-c9203d2b20ad?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1610123172763-1f587473048f?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=250&fit=crop',
];

export default function PropertyCard({ property, onSaveToggle }) {
  const [saved, setSaved] = useState(property?.isSaved || false);
  const [activeImage, setActiveImage] = useState(0);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data } = await propertyAPI.save(property.id);
      setSaved(data.saved);
      toast.success(data.saved ? 'Saved!' : 'Removed from saved');
      if (onSaveToggle) onSaveToggle(property.id, data.saved);
    } catch {
      toast.error('Please login to save');
    }
  };

  const photos = property?.photos?.length
    ? property.photos
    : [PLACEHOLDER_IMAGES[Math.floor(Math.random() * 3)]];
  const amenityIcons = (property?.amenities || []).slice(0, 5);

  const handleImageScroll = (e) => {
    const { scrollLeft, clientWidth } = e.currentTarget;
    if (!clientWidth) return;
    const idx = Math.round(scrollLeft / clientWidth);
    if (idx !== activeImage) setActiveImage(idx);
  };

  return (
    <Link href={`/properties/${property?.id}`} className="block">
      <div className="card-hover overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[4/5] md:aspect-[16/10] overflow-hidden bg-gray-100">
          <div
            className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            onScroll={handleImageScroll}
          >
            {photos.map((photo, idx) => (
              <img
                key={`${property?.id || 'property'}-${idx}`}
                src={photo}
                alt={`${property?.title || 'Property'} ${idx + 1}`}
                className="h-full w-full shrink-0 snap-center object-cover group-hover:scale-[1.02] transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length];
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-transparent opacity-70 group-hover:opacity-85 transition-opacity" />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {property?.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            )}
            {property?.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
                <Sparkles className="w-3 h-3" /> Featured
              </span>
            )}
            {property?.negotiable && (
              <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">Negotiable</span>
            )}
          </div>
          {/* Actions */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            <button onClick={handleSave}
              className={`p-1.5 rounded-full ${saved ? 'bg-red-500 text-white' : 'bg-white/95 text-gray-600'} shadow-sm hover:scale-110 transition-all`}>
              <Heart className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
          {/* Views */}
          {property?.views > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-black/50 text-white text-[10px] rounded-full">
              <Eye className="w-3 h-3" /> {property.views}
            </div>
          )}
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

        {/* Content */}
        <div className="p-4 bg-gradient-to-b from-white to-orange-50/25">
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
            <MapPin className="w-3 h-3" />
            <span>{property?.area || 'Area'}, {property?.city || 'City'}</span>
          </div>
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
            {property?.title || 'Beautiful Property'}
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-[10px] px-2 py-0.5 bg-orange-100/80 text-orange-700 rounded-full font-semibold">{property?.propertyType || '2BHK'}</span>
            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">{property?.furnishing || 'Semi Furnished'}</span>
            {property?.availableFor && (
              <span className="text-[10px] px-2 py-0.5 bg-blue-100/80 text-blue-700 rounded-full font-medium">{property.availableFor}</span>
            )}
          </div>
          {/* Amenities */}
          {amenityIcons.length > 0 && (
            <div className="flex gap-1.5 mb-3">
              {amenityIcons.map((a, i) => (
                <span key={i} className="text-sm" title={typeof a === 'string' ? a : a.label}>
                  {typeof a === 'string' ? a : a.icon}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-orange-100/80">
            <div>
              <span className="text-lg font-extrabold text-gray-900">₹{(property?.rent || 0).toLocaleString('en-IN')}</span>
              <span className="text-xs text-gray-400 font-medium">/month</span>
            </div>
            <span className="text-xs font-bold text-orange-500 flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-wider">
              View <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
