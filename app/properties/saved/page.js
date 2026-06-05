'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import EmptyState from '@/components/EmptyState';
import PropertyCard from '@/components/PropertyCard';
import { propertyAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SavedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyAPI.getSaved()
      .then(({ data }) => setProperties(data.properties || []))
      .catch(() => toast.error('Failed to load saved properties'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Saved Properties</h1>
          <p className="text-sm text-gray-500 mb-6">Your bookmarked listings</p>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-2xl" />)}
            </div>
          ) : properties.length === 0 ? (
            <EmptyState icon="\u2764\ufe0f" title="No saved properties" description="Save properties you like while browsing"
              ctaLabel="Browse Properties" ctaHref="/properties" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
