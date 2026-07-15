'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BellRing,
  Building,
  ChefHat,
  Compass,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CITIES } from '@/lib/constants';
import { useLocationStore, useLangStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';

const globalStyles = `
  @keyframes float-img {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
  .animate-float-hero { animation: float-img 4s ease-in-out infinite; }
  .hero-bg { background: linear-gradient(135deg, #f97316 0%, #fb923c 38%, #facc15 100%); }
  .glass-tag {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.28);
  }
  .dotted-texture {
    background-image: radial-gradient(rgba(255,255,255,0.14) 1.2px, transparent 1.2px);
    background-size: 24px 24px;
  }
  .stats-dotted {
    background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
    background-size: 20px 20px;
  }
`;

function ShowcaseCarousel({ t }) {
  const slides = [
    { image: '/property.jpeg', title: t('slideRoomsTitle'), desc: t('slideRoomsDesc') },
    { image: '/roommate.jpeg', title: t('slideRoommateTitle'), desc: t('slideRoommateDesc') },
    { image: '/tiffin2.jpeg', title: t('slideMessTitle'), desc: t('slideMessDesc') },
    { image: '/cook.jpeg', title: t('slideCookTitle'), desc: t('slideCookDesc') },
    { image: '/students.png', title: t('slideCommunityTitle'), desc: t('slideCommunityDesc') }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 relative z-10 transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)]">
      {/* Browser Top Bar */}
      <div className="bg-slate-950 px-4 py-3 flex items-center gap-2 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 bg-slate-900/60 rounded-lg py-1 px-3 text-[10px] text-gray-400 font-mono text-center truncate select-none border border-white/5">
          fyndkaro.com/{['properties', 'roommate', 'mess', 'cook', 'community'][currentIndex]}
        </div>
      </div>
      
      {/* Slides Viewport */}
      <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden group">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Custom dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent flex flex-col justify-end p-5 text-white">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-400 bg-orange-950/60 border border-orange-500/20 px-2 py-0.5 rounded w-max mb-1.5">
                fyndkaro Platform
              </span>
              <h3 className="text-lg md:text-xl font-bold leading-tight mb-1 drop-shadow-md">
                {slide.title}
              </h3>
              <p className="text-xs text-gray-300 leading-normal drop-shadow-md">
                {slide.desc}
              </p>
            </div>
          </div>
        ))}

        {/* Arrow Buttons */}
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 font-bold"
        >
          &larr;
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 font-bold"
        >
          &rarr;
        </button>
      </div>

      {/* Progress Dots / Controls */}
      <div className="bg-slate-950 py-3 flex justify-center gap-2 border-t border-white/5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-6 bg-orange-500' : 'w-1.5 bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { city, area, setLocation } = useLocationStore();
  const { lang } = useLangStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      const mobileTarget = localStorage.getItem('mobileDefaultPage');
      if (isMobile && mobileTarget && mobileTarget !== '/') {
        router.replace(mobileTarget);
      }
    }
  }, [router]);
  const displayLang = isHydrated ? lang : 'en';
  const { t } = useTranslation(displayLang);

  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    if (isHydrated && city) {
      setSearchCity(city);
    }
  }, [isHydrated, city]);

  const serviceCards = [
    { title: t('cardRoomsTitle'), desc: t('cardRoomsDesc'), icon: Building, href: '/properties' },
    { title: t('cardRoommateTitle'), desc: t('cardRoommateDesc'), icon: Users, href: '/roommate' },
    { title: t('cardMessTitle'), desc: t('cardMessDesc'), icon: UtensilsCrossed, href: '/mess' },
    { title: t('cardCookTitle'), desc: t('cardCookDesc'), icon: ChefHat, href: '/cook' },
  ];

  const steps = [
    t('step1Desc'),
    t('step2Desc'),
    t('step3Desc'),
  ];

  const handleSearch = () => {
    if (!searchCity) {
      toast.error(displayLang === 'hi' ? 'कृपया एक शहर चुनें' : 'Please select a city');
      return;
    }
    setShowSearchModal(true);
  };

  const handleSelectService = (href) => {
    setLocation({ city: searchCity, area: '' });
    setShowSearchModal(false);
    router.push(href);
  };

  return (
    <>
      <style jsx global>{globalStyles}</style>
      <div className="min-h-screen bg-white">
        <Navbar />

        <section className="relative hero-bg pt-20 pb-16 md:pt-32 md:pb-28 overflow-hidden">
          <div className="absolute inset-0 dotted-texture pointer-events-none z-0" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 rounded-full blur-3xl -translate-y-1/2" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="w-full lg:w-3/5 text-left">
                <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/20">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-white text-xs font-bold uppercase tracking-wider">{t('heroBadge')}</span>
                </div>

                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white leading-[1.02] tracking-tighter mb-6 drop-shadow-lg">
                  {displayLang === 'hi' ? (
                    t('heroTitle')
                  ) : (
                    <>
                      FIND YOUR
                      <br />
                      PERFECT STAY.
                    </>
                  )}
                </h1>

                <div className="glass-tag max-w-2xl p-6 rounded-3xl mb-8 shadow-xl">
                  <p className="text-base md:text-xl text-white font-semibold leading-relaxed">
                    {t('heroSubtitle')}
                  </p>
                </div>

                <div className="bg-white p-2 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center gap-2 max-w-3xl">
                  <div className="flex items-center flex-1 w-full gap-3 px-4 py-2">
                    <MapPin className="w-6 h-6 text-orange-500" />
                    <select
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full bg-transparent outline-none font-bold text-gray-800 text-base md:text-lg cursor-pointer appearance-none tracking-wide"
                    >
                      <option value="">{t('heroSelectCity')}</option>
                      {searchCity && !CITIES.includes(searchCity) ? (
                        <option value={searchCity}>{searchCity}</option>
                      ) : null}
                      {CITIES.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="w-full md:w-auto bg-black hover:bg-orange-600 text-white px-8 md:px-10 py-3 md:py-4 rounded-[1.5rem] flex items-center justify-center gap-3 font-black text-base md:text-lg transition-all tracking-wide"
                  >
                    <Search className="w-5 h-5" />
                    {t('heroSearch')}
                  </button>
                </div>

                <div className="mt-4 text-sm text-white/85">
                  {isHydrated && city ? `${t('heroSelectionInfo')} ${city}${area ? `, ${area}` : ''}` : t('heroSelectionStart')}
                </div>
              </div>

              <div className="w-full lg:w-2/5 relative">
                <div className="animate-float-hero relative z-10">
                  <ShowcaseCarousel t={t} />
                </div>

                <div className="absolute -top-4 -left-4 bg-white/92 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-xl flex items-center gap-3 rotate-[-6deg] z-20 border border-white/50">
                  <div className="bg-orange-100 p-2 rounded-lg"><Home className="text-orange-600 w-5 h-5" /></div>
                  <span className="font-extrabold text-gray-800 text-sm md:text-base whitespace-nowrap">{t('heroAreaProperties')}</span>
                </div>

                <div className="absolute bottom-10 -right-4 bg-white/92 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-xl flex items-center gap-3 rotate-[4deg] z-20 border border-white/50">
                  <div className="bg-green-100 p-2 rounded-lg"><BellRing className="text-green-600 w-5 h-5" /></div>
                  <span className="font-extrabold text-gray-800 text-sm md:text-base whitespace-nowrap">{t('heroNewAlerts')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-black py-12 relative z-20 stats-dotted">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            {[
              ['12,400+', t('navProperties')],
              ['8,200+', t('statHappyUsers')],
              ['180+', t('statCities')],
              ['0%', t('statBrokerFree')],
            ].map(([value, label]) => (
              <div key={label} className="text-center">
                <div className="text-3xl md:text-5xl font-black text-white tracking-tight">{value}</div>
                <div className="text-orange-500 text-xs md:text-sm font-black uppercase tracking-[0.2em] mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <section className="bg-[#fff8f1] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-10">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500 mb-3">{t('servicesTag')}</p>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900">{t('servicesTitle')}</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {serviceCards.map(({ title, desc, icon: Icon, href }) => (
                <button
                  key={title}
                  onClick={() => router.push(href)}
                  className="rounded-3xl bg-white p-6 text-left border border-orange-100 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)] hover:border-orange-200 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500 mb-3">{t('stepsTag')}</p>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">{t('stepsTitle')}</h2>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-extrabold shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm md:text-base text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] bg-slate-950 text-white p-8 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.9)]">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
                <ShieldCheck className="w-7 h-7 text-orange-300" />
              </div>
              <h3 className="text-2xl font-black mb-3">{t('ctaCardTitle')}</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {t('ctaCardDesc')}
              </p>
              <button
                onClick={() => router.push('/register')}
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-extrabold text-white hover:bg-orange-400"
              >
                {t('ctaCardBtn')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="rounded-[2rem] bg-[linear-gradient(135deg,rgba(249,115,22,0.18),rgba(245,158,11,0.12))] border border-white/10 p-8 md:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-300 mb-2">{t('ctaTag')}</p>
                <h2 className="text-3xl md:text-4xl font-black text-white">{t('ctaTitle')}</h2>
              </div>
              <button
                onClick={() => router.push('/properties')}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 hover:bg-orange-50"
              >
                {t('ctaButton')}
                <Compass className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Visionary Leadership / Founders Section */}
        <section className="bg-white py-20 border-t border-slate-100 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500 mb-3">{t('leadTag')}</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-12">{t('leadTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-[#fff8f1] rounded-[2.5rem] p-8 border border-orange-100/60 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col sm:flex-row items-center gap-6 text-left">
                <div className="w-36 h-36 rounded-[2rem] overflow-hidden shrink-0 shadow-lg border-4 border-white">
                  <img
                    src="/prabhakr%20kr.%20founder.jpeg"
                    alt="Prabhakar Kumar - Founder & CEO"
                    className="w-full h-full object-cover animate-pulse-slow"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-1">Prabhakar Kumar</h3>
                  <p className="text-orange-500 font-bold text-xs uppercase tracking-wider mb-3">Founder & CEO</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t('leadPrabhakarDesc')}
                  </p>
                </div>
              </div>

              <div className="bg-[#fff8f1] rounded-[2.5rem] p-8 border border-orange-100/60 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col sm:flex-row items-center gap-6 text-left">
                <div className="w-36 h-36 rounded-[2rem] overflow-hidden shrink-0 shadow-lg border-4 border-white">
                  <img
                    src="/ved%20cofounder.jpeg"
                    alt="Ved Prakash - Co-Founder | CTO & COO"
                    className="w-full h-full object-cover animate-pulse-slow"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-1">Ved Prakash</h3>
                  <p className="text-orange-500 font-bold text-xs uppercase tracking-wider mb-3">Co-Founder | CTO & COO</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t('leadVedDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Search Options Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-orange-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="relative px-6 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black tracking-tight">
                  {displayLang === 'hi' ? `आप ${searchCity} में क्या ढूँढ रहे हैं?` : `What are you looking for in ${searchCity}?`}
                </h3>
                <p className="text-xs text-orange-100 mt-1">
                  {displayLang === 'hi' ? 'जारी रखने के लिए एक सेवा चुनें' : 'Select a service to continue'}
                </p>
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/35 transition-colors text-white outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
              {serviceCards.map(({ title, desc, icon: Icon, href }) => (
                <button
                  key={title}
                  onClick={() => handleSelectService(href)}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50/30 hover:bg-orange-50 border border-orange-100 hover:border-orange-300 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-800 text-base mb-1">{title}</h4>
                    <p className="text-xs text-gray-500 leading-normal">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
