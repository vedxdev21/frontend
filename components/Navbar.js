'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocationStore, useLangStore, useNotificationStore } from '@/lib/store';
import { notificationAPI } from '@/lib/api';
import { useThrottle } from '@/hooks/useDebounce';
import { Menu, X, Bell, ChevronDown, MapPin, Home, Users, UtensilsCrossed, ChefHat, LogOut, User, Settings, MessageCircle, Heart } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function Navbar() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { city } = useLocationStore();
  const { lang, setLang } = useLangStore();
  const displayLang = isHydrated ? lang : 'en';
  const { t } = useTranslation(displayLang);
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const profileRef = useRef(null);
  const hasInitializedRef = useRef(false);

  // Throttle unread count fetches to max once per 30 seconds
  const fetchUnreadCount = useThrottle(async () => {
    try {
      const { data } = await notificationAPI.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      // Silently handle errors
    }
  }, 30000);

  // Fetch unread notification count on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [pathname]);
  useEffect(() => { setIsHydrated(true); }, []);

  const navLinks = [
    { href: '/properties', label: t('navProperties'), icon: Home },
    { href: '/roommate', label: t('navRoommate'), icon: Users },
    { href: '/mess', label: t('navMess'), icon: UtensilsCrossed },
    { href: '/cook', label: t('navCook'), icon: ChefHat },
  ];

  const isActive = (href) => pathname?.startsWith(href);
  const displayCity = isHydrated ? (city || 'Bhopal') : 'Bhopal';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-orange-100/60 shadow-[0_10px_28px_-24px_rgba(30,41,59,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[4.25rem] py-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="fyndkaro logo"
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-orange-200/70 shadow-[0_8px_20px_-12px_rgba(249,115,22,0.8)] group-hover:shadow-[0_12px_26px_-12px_rgba(249,115,22,0.9)] transition-shadow"
            />
            <span className="font-extrabold text-lg text-gray-900 hidden sm:block tracking-tight">fynd<span className="text-orange-500">karo</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/70 border border-orange-100/70">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive(link.href)
                    ? 'text-orange-600 bg-orange-50 shadow-sm'
                    : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50/70'
                  }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* City Chip */}
            <button className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-white/80 border border-orange-100 rounded-full text-sm text-gray-600 hover:bg-orange-50 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span className="max-w-[80px] truncate">{displayCity}</span>
            </button>

            {/* Language Toggle */}
            <button onClick={() => setLang(displayLang === 'en' ? 'hi' : 'en')}
              className="px-2.5 py-1.5 text-xs font-semibold bg-white/80 border border-orange-100 rounded-full hover:bg-orange-50 transition-colors">
              {displayLang === 'en' ? 'हिं' : 'EN'}
            </button>

            {isAuthenticated ? (
              <>
                {/* Chat */}
                <Link href="/chat" className={`p-2 rounded-lg transition-colors ${pathname === '/chat' ? 'bg-orange-50 text-orange-600' : 'hover:bg-orange-50/70 text-gray-600'}`}>
                  <MessageCircle className="w-5 h-5" />
                </Link>

                {/* Notification Bell */}
                <Link href="/notifications" className={`relative p-2 rounded-lg transition-colors ${pathname === '/notifications' ? 'bg-orange-50 text-orange-600' : 'hover:bg-orange-50/70 text-gray-600'}`}>
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-orange-50/70 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center ring-2 ring-orange-100 shadow-[0_8px_18px_-12px_rgba(249,115,22,0.9)]">
                      <span className="text-white font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 hidden sm:block transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-orange-100/60 border border-orange-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2.5 border-b border-orange-100/60">
                        <p className="font-semibold text-sm text-gray-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.phone || user?.email}</p>
                      </div>
                      <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50/80 transition-colors">
                        <User className="w-4 h-4" /> {t('navProfile')}
                      </Link>
                      <Link href="/properties/my-listings" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50/80 transition-colors">
                        <Home className="w-4 h-4" /> {t('navMyListings')}
                      </Link>
                      <Link href="/roommate/interests" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50/80 transition-colors">
                        <Heart className="w-4 h-4" /> {t('navRoommateInterests')}
                      </Link>
                      <Link href="/chat" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50/80 transition-colors">
                        <MessageCircle className="w-4 h-4" /> {t('navMessages')}
                      </Link>
                      <Link href="/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50/80 transition-colors">
                        <Settings className="w-4 h-4" /> {t('navSettings')}
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50/80 transition-colors">
                          <Settings className="w-4 h-4" /> {t('navAdminPanel')}
                        </Link>
                      )}
                      <hr className="my-1 border-orange-100/60" />
                      <button onClick={logout}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors">
                        <LogOut className="w-4 h-4" /> {t('navLogout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-orange-500 transition-colors">
                  {t('navLogin')}
                </Link>
                <Link href="/register" className="btn-primary text-sm !px-4 !py-2">
                  {t('navSignUp')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-orange-50/80 transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-orange-100/70 pt-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-600">{displayCity}</span>
            </div>
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}
                  className={`flex items-center gap-3 px-2 py-3 text-sm font-medium rounded-lg transition-colors ${isActive(link.href)
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-700 hover:bg-orange-50/90 hover:text-orange-500'
                    }`}>
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
