'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Map, MapPin, Building, GraduationCap, Coffee, Train, Navigation, Search } from 'lucide-react';
import { useState } from 'react';

const areas = [
  {
    name: 'MP Nagar',
    type: 'Commercial & Educational',
    description: 'The commercial heart of Bhopal, packed with coaching institutes, offices, and restaurants. Perfect for students and working professionals.',
    rentStats: { min: '₹5,000', max: '₹15,000', avg: '₹8,500' },
    highlights: [
      { icon: GraduationCap, text: 'Hub of coaching centers' },
      { icon: Train, text: 'Near Rani Kamlapati Station' },
      { icon: Coffee, text: 'Vibrant cafe culture' }
    ],
    popularFor: ['Students', 'Professionals']
  },
  {
    name: 'Indrapuri',
    type: 'Student Hub',
    description: 'A massive residential area favored by engineering students. Known for affordable PGs, cheap food joints, and close proximity to colleges.',
    rentStats: { min: '₹3,500', max: '₹10,000', avg: '₹6,000' },
    highlights: [
      { icon: Building, text: 'High density of PGs and hostels' },
      { icon: Coffee, text: 'Affordable mess and street food' },
      { icon: Navigation, text: 'Well connected by public transport' }
    ],
    popularFor: ['Students', 'Bachelors']
  },
  {
    name: 'Arera Colony',
    type: 'Premium Residential',
    description: 'Bhopal\'s most posh and green residential area. Offers premium apartments, independent houses, and a peaceful environment.',
    rentStats: { min: '₹10,000', max: '₹40,000', avg: '₹20,000' },
    highlights: [
      { icon: Building, text: 'Spacious independent houses' },
      { icon: MapPin, text: 'Lush green parks and wide roads' },
      { icon: Coffee, text: 'Premium cafes and markets' }
    ],
    popularFor: ['Families', 'Executives']
  },
  {
    name: 'Awadhpuri',
    type: 'Developing Residential',
    description: 'A rapidly developing area offering affordable 1BHK/2BHK flats. Great for those looking for budget-friendly family housing.',
    rentStats: { min: '₹4,500', max: '₹12,000', avg: '₹7,500' },
    highlights: [
      { icon: Building, text: 'New apartment complexes' },
      { icon: MapPin, text: 'Quiet environment' },
      { icon: Navigation, text: 'Good connectivity to BHEL' }
    ],
    popularFor: ['Families', 'Working Professionals']
  }
];

export default function AreaGuidePage() {
  const [search, setSearch] = useState('');

  const filteredAreas = areas.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Map className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-4xl font-extrabold mb-4">Bhopal Area Guide</h1>
          <p className="text-orange-100 text-lg max-w-2xl mx-auto mb-8">
            Discover the best neighborhoods in Bhopal. Find the perfect area based on your lifestyle, budget, and commute.
          </p>
          
          <div className="max-w-xl mx-auto relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by area name or type (e.g., MP Nagar, Student Hub)" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-300/50 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAreas.map((area, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-orange-500" /> {area.name}
                    </h2>
                    <p className="text-sm font-semibold text-orange-500 mt-1">{area.type}</p>
                  </div>
                  <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-right">
                    <p className="text-xs text-gray-500 font-medium">Avg Rent</p>
                    <p className="font-bold text-gray-900">{area.rentStats.avg}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {area.description}
                </p>

                <div className="space-y-3 mb-6">
                  <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">Highlights</p>
                  {area.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <h.icon className="w-4 h-4 text-orange-500" />
                      </div>
                      <span className="text-sm">{h.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {area.popularFor.map(p => (
                    <span key={p} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-md">
                      Best for {p}
                    </span>
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium mb-0.5">Rent Range</p>
                  <p className="text-sm font-bold text-gray-700">{area.rentStats.min} - {area.rentStats.max}</p>
                </div>
              </div>
            </div>
          ))}

          {filteredAreas.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No areas found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
