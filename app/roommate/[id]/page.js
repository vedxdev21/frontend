'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { roommateAPI, chatAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Heart, Share2, MapPin, MessageCircle, Send,
  Briefcase, Moon, Sun, Cigarette, Coffee, Wine, Music, Sparkles, Users
} from 'lucide-react';

function CompatibilityRing({ score }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#f97316';
  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold" style={{ color }}>{score}%</span>
        <span className="text-[10px] text-gray-400 font-medium">Match</span>
      </div>
    </div>
  );
}

function LifestyleChip({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-[10px] text-gray-400 uppercase font-semibold">{label}</p>
        <p className="text-sm font-medium text-gray-700">{value}</p>
      </div>
    </div>
  );
}

export default function RoommateDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interestMsg, setInterestMsg] = useState('');
  const [showInterest, setShowInterest] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    roommateAPI.getById(id)
      .then(({ data }) => setProfile(data.profile || data.roommate || data))
      .catch(() => toast.error('Profile not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendInterest = async () => {
    if (!interestMsg.trim()) { toast.error('Write a message'); return; }
    setSending(true);
    try {
      await roommateAPI.sendInterest(id, { message: interestMsg });
      toast.success('Interest sent! They will be notified.');
      setShowInterest(false);
      setInterestMsg('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send interest');
    }
    setSending(false);
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) navigator.share({ title: `${profile?.name || 'Roommate'} on fyndkaro`, url });
    else { navigator.clipboard.writeText(url); toast.success('Link copied!'); }
  };

  const handleChat = async () => {
    try {
      const { data } = await chatAPI.startConversation({
        recipientId: profile?.user?.id || profile?.userId || profile?.id,
        roommateProfileId: profile?.id,
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
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3" />
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-28 h-28 rounded-full bg-gray-200 animate-pulse mx-auto mb-4" />
            <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3 mx-auto" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <button onClick={() => router.push('/roommate')} className="btn-primary mt-4">Browse Roommates</button>
        </div>
      </div>
    );
  }

  const name = profile.name || profile.user?.name || 'Roommate';
  const food = profile.food || 'Both';
  const sleep = profile.sleep || 'Night Owl';
  const smoking = profile.smoking || 'NO';
  const drinking = profile.drinking || 'NO';
  const personality = profile.personality || 'Ambivert';
  const cleanliness = profile.cleanliness || 'Normal';
  const guests = profile.guests || 'Sometimes';
  const noise = profile.noise || 'Okay';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="bg-gradient-to-br from-orange-500 to-amber-400 p-6 text-center">
            <div className="w-28 h-28 rounded-full overflow-hidden mx-auto ring-4 ring-white/30 mb-3">
              <img src={profile.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'}
                alt={name} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">{name}, {profile.age}</h1>
            <p className="text-orange-100 text-sm mt-1 flex items-center justify-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> {profile.profession?.replace(/_/g, ' ') || 'Professional'}
            </p>
            {profile.collegeName && (
              <p className="text-orange-100 text-xs mt-0.5">🎓 {profile.collegeName}</p>
            )}
            <p className="text-orange-100 text-xs mt-1 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" /> {profile.area || ''} {profile.city || ''}
            </p>
          </div>

          {/* Compatibility */}
          <div className="flex justify-center py-6 border-b border-gray-50">
            <CompatibilityRing score={profile.compatibility?.score || profile.compatibilityScore || 75} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 p-4">
            <button onClick={() => setShowInterest(true)}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" /> Send Interest
            </button>
            <button onClick={handleChat}
              className="btn-primary flex items-center justify-center gap-2 px-4">
              <MessageCircle className="w-4 h-4" /> Chat
            </button>
            <button onClick={handleShare}
              className="btn-secondary flex items-center justify-center gap-2 px-4">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interest Form */}
        {showInterest && (
          <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-4 mb-4 animate-fadeIn">
            <h3 className="font-bold text-gray-900 text-sm mb-2">Send Interest to {name}</h3>
            <textarea value={interestMsg} onChange={e => setInterestMsg(e.target.value)}
              placeholder="Introduce yourself briefly..."
              className="input-field min-h-[80px] resize-none mb-3" maxLength={300} />
            <div className="flex gap-2">
              <button onClick={() => setShowInterest(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSendInterest} disabled={sending}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {sending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Send</>}
              </button>
            </div>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="font-bold text-gray-900 mb-2">About</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Lifestyle */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3">Lifestyle</h3>
          <div className="grid grid-cols-2 gap-2">
            <LifestyleChip icon={food === 'VEG' || food === 'Veg' ? '🥗' : food === 'NON_VEG' ? '🍖' : '🍽️'} label="Food" value={food.replace(/_/g, ' ')} />
            <LifestyleChip icon={sleep === 'EARLY_BIRD' ? '🌅' : '🌙'} label="Sleep" value={sleep.replace(/_/g, ' ')} />
            <LifestyleChip icon={smoking === 'NO' ? '🚫' : '🚬'} label="Smoking" value={smoking === 'NO' ? 'Non-smoker' : smoking} />
            <LifestyleChip icon={drinking === 'NO' ? '🚫' : '🍺'} label="Drinking" value={drinking === 'NO' ? 'Non-drinker' : drinking} />
            <LifestyleChip icon="🧑" label="Personality" value={personality.replace(/_/g, ' ')} />
            <LifestyleChip icon="🧹" label="Cleanliness" value={cleanliness.replace(/_/g, ' ')} />
            <LifestyleChip icon="👥" label="Guests" value={guests.replace(/_/g, ' ')} />
            <LifestyleChip icon="🔊" label="Noise" value={noise.replace(/_/g, ' ')} />
          </div>
        </div>

        {/* Budget & Areas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3">Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-500">Budget</span>
              <span className="text-sm font-bold text-gray-900">
                ₹{(profile.budgetMin || 0).toLocaleString()} - ₹{(profile.budgetMax || 0).toLocaleString()}/mo
              </span>
            </div>
            {profile.hasRoom && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                <span className="text-green-500 font-bold text-sm">✓ Already has a room</span>
              </div>
            )}
            {profile.preferredAreas?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Preferred Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.preferredAreas.map(a => (
                    <span key={a} className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-4" />
      <Footer />
    </div>
  );
}
