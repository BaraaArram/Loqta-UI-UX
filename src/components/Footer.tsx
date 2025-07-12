"use client";
import { useState } from 'react';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaPinterestP, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  return (
    <footer className="w-full bg-footerC/80 border-t border-border/30 pt-0 pb-0 px-0 text-footerText transition-colors duration-500 backdrop-blur-md shadow-inner" role="contentinfo">
      {/* Newsletter Signup - glassmorphism, animated confirmation */}
      <div className="w-full bg-gradient-to-r from-bg via-card/80 to-bg dark:from-bg dark:via-card/60 dark:to-bg border-b border-border/20 px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6 rounded-b-3xl shadow-lg backdrop-blur-xl transition-colors duration-500">
        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
          <h3 className="text-xl font-bold text-heading drop-shadow-sm">Subscribe to our Newsletter</h3>
          <p className="text-muted text-sm">Get the latest updates, offers, and more.</p>
        </div>
        <div className="w-full md:w-auto flex-1 flex justify-center md:justify-end">
          {subscribed ? (
            <div className="flex items-center gap-2 animate-fade-in text-success font-semibold">
              <svg className="h-6 w-6 text-success animate-bounce" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-20"/><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Thank you for subscribing!
            </div>
          ) : (
            <form className="flex w-full max-w-md gap-2" onSubmit={e => { e.preventDefault(); setSubscribed(true); }}>
              <input
                type="email"
                required
                placeholder="Your email"
                className="flex-1 border border-border/40 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent bg-bg/80 text-heading placeholder:text-muted transition-colors duration-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <button type="submit" className="px-4 py-2 bg-accent text-button-text rounded-r-lg font-bold hover:bg-accent-hover focus:ring-2 focus:ring-accent/60 transition-colors duration-300">Subscribe</button>
            </form>
          )}
        </div>
      </div>
      {/* Main Footer Content */}
      <div className="w-full max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        {/* Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-3">
          {/* Theme-aware SVG logo */}
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 mb-2 drop-shadow-md text-accent">
            <rect x="8" y="12" width="24" height="20" rx="6" fill="currentColor" className="text-card" stroke="currentColor" strokeWidth="2.5" />
            <path d="M14 16V12a6 6 0 0 1 12 0v4" stroke="currentColor" strokeWidth="2.5" className="text-accent" />
            <path d="M16 24l4 4 6-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent" />
          </svg>
          <span className="text-sm text-muted">&copy; {new Date().getFullYear()} Loqta. All rights reserved.</span>
        </div>
        {/* Quick Links */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-bold text-heading mb-1">Quick Links</span>
          <div className="flex flex-col gap-1 text-sm">
            <Link href="/" className="hover:text-accent text-muted focus:text-accent transition-colors focus:outline-none">Home</Link>
            <Link href="/dashboard" className="hover:text-accent text-muted focus:text-accent transition-colors focus:outline-none">Shop</Link>
            <Link href="/profile" className="hover:text-accent text-muted focus:text-accent transition-colors focus:outline-none">Profile</Link>
          </div>
        </div>
        {/* Contact & Social */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <span className="font-bold text-heading mb-1">Contact</span>
          <span className="text-sm text-muted">support@loqta.com</span>
          <span className="text-sm text-muted mb-2">+1 234 567 890</span>
          <div className="flex gap-4 mt-2">
            <a href="#" aria-label="Facebook" className="hover:text-accent focus:text-accent transition-colors focus:outline-none"><FaFacebookF className="h-5 w-5" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-accent focus:text-accent transition-colors focus:outline-none"><FaInstagram className="h-5 w-5" /></a>
            <a href="#" aria-label="Pinterest" className="hover:text-accent focus:text-accent transition-colors focus:outline-none"><FaPinterestP className="h-5 w-5" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-accent focus:text-accent transition-colors focus:outline-none"><FaYoutube className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
} 