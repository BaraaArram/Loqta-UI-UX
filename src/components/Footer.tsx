// Footer component: Displays site info, social links, quick links, newsletter, and copyright.
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaPinterestP, FaYoutube } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';

export default function Footer() {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const isRTL = i18n.language === 'ar';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    // Simulate subscription logic
    setTimeout(() => {
      setSubscribed(true);
      setSubscribing(false);
    }, 2000);
  };

  return (
    <footer className={`relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      
      {/* Main Content */}
      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accentC rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{t('loqta')}</h3>
            </div>
            <p className="text-zinc-300 mb-6 max-w-md leading-relaxed">
              {t('footer_description')}
            </p>
            <div className="flex gap-4">
              {/* Social Links */}
              <a href="#" className="w-10 h-10 bg-zinc-800 hover:bg-accentC rounded-lg flex items-center justify-center transition-colors group" aria-label={t('facebook')}>
                <svg className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-zinc-800 hover:bg-accentC rounded-lg flex items-center justify-center transition-colors group" aria-label={t('twitter')}>
                <svg className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-zinc-800 hover:bg-accentC rounded-lg flex items-center justify-center transition-colors group" aria-label={t('instagram')}>
                <svg className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">{t('quick_links')}</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-zinc-300 hover:text-accentC transition-colors">{t('about_us')}</a></li>
              <li><a href="#" className="text-zinc-300 hover:text-accentC transition-colors">{t('contact')}</a></li>
              <li><a href="#" className="text-zinc-300 hover:text-accentC transition-colors">{t('support')}</a></li>
              <li><a href="#" className="text-zinc-300 hover:text-accentC transition-colors">{t('faq')}</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">{t('newsletter')}</h4>
            <p className="text-zinc-300 mb-4 text-sm">{t('newsletter_description')}</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('enter_email')}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accentC focus:border-transparent transition"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={subscribing}
                className="w-full px-4 py-3 bg-accentC hover:bg-accentC/90 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subscribing ? t('subscribing') : t('subscribe')}
              </button>
            </form>
            {subscribed && (
              <div className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                {t('subscribed_successfully')}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-zinc-400 text-sm">
            © {new Date().getFullYear()} {t('loqta')}. {t('footer_text')}
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-zinc-400 hover:text-accentC transition-colors">{t('privacy_policy')}</a>
            <a href="#" className="text-zinc-400 hover:text-accentC transition-colors">{t('terms_of_service')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
} 