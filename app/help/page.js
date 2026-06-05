'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HelpCircle, Mail, Phone, MessageCircle, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const faqs = [
    { q: 'How do I list my property?', a: 'Click on the "List Property" button on the top right corner. Fill in the details, upload photos, and submit. Our team will verify and activate your listing.' },
    { q: 'Is fyndkro completely free?', a: 'Yes! fyndkro is a 100% broker-free platform. We do not charge any brokerage from tenants or owners.' },
    { q: 'How do I contact an owner?', a: 'Once you find a property you like, click on "Show Number" to view the owner\'s contact details, or use the in-app chat to send them a message.' },
    { q: 'Can I find roommates here?', a: 'Absolutely! Navigate to the Roommate section, create your profile, and start matching with compatible roommates based on your preferences.' },
    { q: 'How do I book a mess or tiffin service?', a: 'Go to the Mess section, browse local providers, check their menu and prices, and contact them directly to subscribe.' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-4xl font-extrabold mb-4">How can we help you?</h1>
          <p className="text-orange-100 text-lg max-w-xl mx-auto">
            Search our knowledge base or get in touch with our support team. We're here to help you find your perfect stay.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 -mt-8">
        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Email Support</h3>
            <p className="text-sm text-gray-500 mb-3">Get answers within 24 hours</p>
            <a href="mailto:support@fyndkro.com" className="text-sm font-semibold text-orange-500 hover:text-orange-600">support@fyndkro.com</a>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
            <p className="text-sm text-gray-500 mb-3">Mon-Sat, 9AM to 6PM</p>
            <a href="tel:+919876543210" className="text-sm font-semibold text-orange-500 hover:text-orange-600">+91 98765 43210</a>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Live Chat</h3>
            <p className="text-sm text-gray-500 mb-3">Chat with our support team</p>
            <button className="text-sm font-semibold text-orange-500 hover:text-orange-600">Start Chat</button>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-800">
                  {faq.q}
                  <span className="transition group-open:rotate-180">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </span>
                </summary>
                <p className="text-gray-600 mt-4 leading-relaxed pl-2 border-l-2 border-orange-200">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">Still have questions?</p>
          <Link href="/contact" className="btn-primary inline-flex">Contact Support</Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
