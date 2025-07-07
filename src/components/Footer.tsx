"use client";
import { useState } from 'react';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaPinterestP, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  return (
    <footer className="w-full bg-footerC border-t border-accentC/30 pt-0 pb-0 px-0 text-footerText transition-colors duration-500">
      {/* Newsletter Signup - horizontal, integrated */}
      <div className="w-full bg-gradient-to-r from-footerC via-cardC/80 to-footerC dark:from-footerC dark:via-cardC/60 dark:to-footerC border-b border-accentC/20 px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6 rounded-b-3xl shadow-md transition-colors duration-500">
        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
          <h3 className="text-xl font-bold text-footerText drop-shadow-sm">Subscribe to our Newsletter</h3>
          <p className="text-footerText/80 text-sm">Get the latest updates, offers, and more.</p>
        </div>
        <div className="w-full md:w-auto flex-1 flex justify-center md:justify-end">
          {subscribed ? (
            <div className="text-accentC font-semibold">Thank you for subscribing!</div>
          ) : (
            <form className="flex w-full max-w-md gap-2" onSubmit={e => { e.preventDefault(); setSubscribed(true); }}>
              <input
                type="email"
                required
                placeholder="Your email"
                className="flex-1 border border-accentC/40 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accentC bg-footerC/80 text-footerText placeholder:text-footerText/60 transition-colors duration-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button type="submit" className="px-4 py-2 bg-accentC text-footerC rounded-r font-bold hover:bg-accentC/90 hover:text-cardC focus:ring-2 focus:ring-accentC/60 transition-colors duration-300">Subscribe</button>
            </form>
          )}
        </div>
      </div>
      {/* Main Footer Content */}
      <div className="w-full max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        {/* Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <img src="/logo.png" alt="Loqta Logo" className="h-10 mb-2 drop-shadow-md" />
          <span className="text-sm text-footerText/80">&copy; {new Date().getFullYear()} Loqta. All rights reserved.</span>
        </div>
        {/* Quick Links */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-bold text-footerText mb-1">Quick Links</span>
          <div className="flex flex-col gap-1 text-sm">
            <Link href="/" className="hover:text-accentC text-footerText transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-accentC text-footerText transition-colors">Shop</Link>
            <Link href="/profile" className="hover:text-accentC text-footerText transition-colors">Profile</Link>
          </div>
        </div>
        {/* Contact & Social */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <span className="font-bold text-footerText mb-1">Contact</span>
          <span className="text-sm text-footerText/80">support@loqta.com</span>
          <span className="text-sm text-footerText/80 mb-2">+1 234 567 890</span>
          <div className="flex gap-4 mt-2">
            <a href="#" aria-label="Facebook" className="hover:text-accentC focus:text-accentC transition-colors"><FaFacebookF className="h-5 w-5" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-accentC focus:text-accentC transition-colors"><FaInstagram className="h-5 w-5" /></a>
            <a href="#" aria-label="Pinterest" className="hover:text-accentC focus:text-accentC transition-colors"><FaPinterestP className="h-5 w-5" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-accentC focus:text-accentC transition-colors"><FaYoutube className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
} 