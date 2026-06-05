'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CITIES } from '@/lib/constants';
import { useLangStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';

export default function Footer() {
  const { lang } = useLangStore();
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => { setIsHydrated(true); }, []);
  const displayLang = isHydrated ? lang : 'en';
  const { t } = useTranslation(displayLang);

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.22),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.16),transparent_40%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <img
                src="/logo.png"
                alt="fyndkaro logo"
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-orange-300/40 shadow-[0_10px_22px_-14px_rgba(249,115,22,0.9)]"
              />
              <span className="text-lg font-extrabold text-white">fynd<span className="text-orange-400">kro</span></span>
            </div>
            <p className="text-sm leading-relaxed text-slate-300/80">
              {t('footerSlogan')}
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-sm transition-colors hover:bg-orange-500">𝕏</a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-sm transition-colors hover:bg-orange-500">in</a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-sm transition-colors hover:bg-orange-500">IG</a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">{t('footerServices')}</h4>
            <div className="space-y-2.5">
              <Link href="/properties" className="block text-sm text-slate-300/80 transition-colors hover:text-orange-300">{t('navProperties')}</Link>
              <Link href="/roommate" className="block text-sm text-slate-300/80 transition-colors hover:text-orange-300">{t('navRoommate')}</Link>
              <Link href="/mess" className="block text-sm text-slate-300/80 transition-colors hover:text-orange-300">{t('navMess')}</Link>
              <Link href="/cook" className="block text-sm text-slate-300/80 transition-colors hover:text-orange-300">{t('navCook')}</Link>
              <Link href="/properties/create" className="block text-sm text-slate-300/80 transition-colors hover:text-orange-300">{t('footerListProperty')}</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">{t('footerCompany')}</h4>
            <div className="space-y-2.5">
              <Link href="/about" className="block text-sm text-slate-300/80 transition-colors hover:text-orange-300">{t('footerAbout')}</Link>
              <Link href="/contact" className="block text-sm text-slate-300/80 transition-colors hover:text-orange-300">{t('footerContact')}</Link>
              <Link href="/help" className="block text-sm text-slate-300/80 transition-colors hover:text-orange-300">{t('footerHelp')}</Link>
              <Link href="/area-guide" className="block text-sm text-slate-300/80 transition-colors hover:text-orange-300">{t('footerAreaGuide')}</Link>
              <Link href="/admin/login" className="block text-sm text-slate-300/80 transition-colors hover:text-orange-300">{t('navAdminPanel')}</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">{t('footerPopularCities')}</h4>
            <div className="flex flex-wrap gap-2">
              {CITIES.slice(0, 12).map((city) => (
                <Link
                  key={city}
                  href={`/properties?city=${encodeURIComponent(city)}`}
                  className="cursor-pointer rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs transition-colors hover:bg-orange-500 hover:text-white"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} {t('footerCopyright')}</p>
          <div className="flex gap-4 text-sm text-slate-400">
            <Link href="/privacy" className="transition-colors hover:text-orange-300">{t('footerPrivacy')}</Link>
            <Link href="/terms" className="transition-colors hover:text-orange-300">{t('footerTerms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
