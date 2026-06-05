'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) { toast.error('Fill all fields'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent! We\u2019ll get back to you soon.');
    setForm({ name: '', email: '', message: '' });
    setLoading(false);
  };

  const faqs = [
    { q: 'Is fyndkaro free to use?', a: 'Yes! Listing and browsing is completely free. We charge zero brokerage.' },
    { q: 'How do I list my property?', a: 'Sign up, go to Properties > List Property, fill in the details and publish.' },
    { q: 'How does roommate matching work?', a: 'We compare lifestyle preferences, budget, and habits to calculate a compatibility score.' },
    { q: 'Is my phone number safe?', a: 'Your number is hidden until you choose to share it via the Show Number feature.' },
    { q: 'Which cities are covered?', a: 'We\u2019re live in 21+ cities including Bhopal, Indore, Patna, Jaipur, Delhi, Bangalore, and more.' },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-gradient-to-br from-orange-500 to-amber-400 py-16 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-2">Contact Us</h1>
        <p className="text-orange-100">We&apos;d love to hear from you</p>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Send us a Message</h2>
          <div className="space-y-4">
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your Name" className="input-field" />
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="Your Email" className="input-field" />
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Your Message" className="input-field min-h-[120px] resize-none" />
            <button onClick={handleSubmit} disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? '...' : <><Send className="w-4 h-4" /> Send Message</>}
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Get in Touch</h2>
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-orange-50/50 border border-orange-100/60 rounded-xl hover:bg-orange-50 transition-colors">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">+91 98765 43210</p>
                <p className="text-xs text-gray-400">Mon-Sat, 9am-6pm</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-orange-50/50 border border-orange-100/60 rounded-xl hover:bg-orange-50 transition-colors">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-sm font-semibold text-gray-900">support@fyndkaro.in</p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-orange-50/50 border border-orange-100/60 rounded-xl hover:bg-orange-50 transition-colors">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-sm font-semibold text-gray-900">MP Nagar Zone-1, Bhopal, MP 462011</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4">FAQs</h3>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-orange-100/60 rounded-xl overflow-hidden bg-white hover:border-orange-200 transition-colors">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-900 text-left hover:bg-orange-50/50 transition-colors">
                  {faq.q}
                  <span className={`text-orange-400 font-bold text-lg transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3 text-sm text-gray-500 animate-fadeIn">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
