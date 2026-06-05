'use client';
import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useUpload } from '@/hooks/useAPI';
import { userAPI } from '@/lib/api';
import { CITIES, CITY_AREAS, USER_INTEREST_OPTIONS } from '@/lib/constants';
import toast from 'react-hot-toast';
import { User, Phone, Mail, MapPin, Edit3, Save, Camera, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profilePhoto || null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const { upload, loading: uploading } = useUpload();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    city: user?.city || 'Bhopal',
    area: user?.area || '',
    interests: user?.interests || [],
  });
  const areas = CITY_AREAS[form.city] || [];

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const preview = event.target?.result;
      setPreviewImage(preview);

      // Upload image
      try {
        const result = await upload('/users/upload-image', file, { folder: 'projectx/profile-photos' });
        const imageUrl = result.imageUrl || preview;
        await userAPI.updateMe({ profilePhoto: imageUrl });
        setProfileImage(imageUrl);
        updateUser({ profilePhoto: imageUrl });
        toast.success('Profile image updated!');
      } catch (err) {
        toast.error('Failed to upload image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (form.interests.length === 0) {
      toast.error('Select at least one interest');
      return;
    }
    setLoading(true);
    try {
      const { data } = await userAPI.updateMe(form);
      updateUser(data.user || data.data?.user || data.data || data);
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Failed to update profile'); }
    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="glass-panel overflow-hidden">
            {/* Header with Image Upload */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-400 p-8 text-center relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={uploading}
              />

              <div className="relative inline-block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto overflow-hidden">
                  {previewImage || profileImage ? (
                    <img
                      src={previewImage || profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-extrabold text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  type="button"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-4 h-4 animate-spin">
                      <div className="w-full h-full rounded-full border-2 border-orange-200 border-t-orange-500" />
                    </div>
                  ) : (
                    <Camera className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>

              {profileImage && (
                <button
                  onClick={handleRemoveImage}
                  type="button"
                  className="absolute top-4 right-4 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <h2 className="text-xl font-bold text-white mt-3">{user?.name || 'User'}</h2>
              <p className="text-orange-100 text-sm">
                {user?.city || 'Set your city'} {user?.area ? `· ${user.area}` : ''}
              </p>
            </div>

            {/* Info */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Profile Info</h3>
                <button
                  onClick={() => (editing ? handleSave() : setEditing(true))}
                  className="flex items-center gap-1.5 text-sm text-orange-500 font-bold hover:text-orange-600 transition-colors"
                >
                  {editing ? (
                    loading ? (
                      '...'
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save
                      </>
                    )
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" /> Edit
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-orange-50/40 border border-orange-100/50 rounded-xl">
                  <User className="w-5 h-5 text-gray-400" />
                  {editing ? (
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="flex-1 bg-transparent outline-none text-sm"
                    />
                  ) : (
                    <span className="text-sm text-gray-700">{user?.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50/40 border border-orange-100/50 rounded-xl">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{user?.phone}</span>
                  <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full">
                    Verified
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50/40 border border-orange-100/50 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-400" />
                  {editing ? (
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="flex-1 bg-transparent outline-none text-sm"
                      placeholder="Add email"
                    />
                  ) : (
                    <span className="text-sm text-gray-700">{user?.email || 'Not set'}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50/40 border border-orange-100/50 rounded-xl">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  {editing ? (
                    <div className="flex-1 grid gap-2 sm:grid-cols-2">
                      <select
                        value={form.city}
                        onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value, area: '' }))}
                        className="bg-white border border-orange-100 rounded-lg px-3 py-2 text-sm outline-none"
                      >
                        {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                      </select>
                      <div>
                        <input
                          list="profile-page-area-options"
                          value={form.area}
                          onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
                          className="w-full bg-white border border-orange-100 rounded-lg px-3 py-2 text-sm outline-none"
                          placeholder="Area"
                        />
                        <datalist id="profile-page-area-options">
                          {areas.map((area) => <option key={area} value={area} />)}
                        </datalist>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-700">
                      {user?.city || 'Not set'}
                      {user?.area ? `, ${user.area}` : ''}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {(editing ? form.interests : (user?.interests || [])).map((i) => (
                    <span key={i} className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                      {i.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
                {editing && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {USER_INTEREST_OPTIONS.map((option) => {
                      const selected = form.interests.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setForm((prev) => ({
                            ...prev,
                            interests: selected
                              ? prev.interests.filter((item) => item !== option.id)
                              : [...prev.interests, option.id],
                          }))}
                          className={`rounded-xl border p-3 text-left text-xs transition-colors ${
                            selected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'
                          }`}
                        >
                          <div className="text-lg mb-1">{option.icon}</div>
                          <div className="font-semibold text-gray-800">{option.label}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {!editing && user?.interests?.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Area based onboarding emails use these interests.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
