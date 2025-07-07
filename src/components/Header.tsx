"use client";
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useState, Fragment, useRef } from 'react';
import { HomeIcon } from '@heroicons/react/24/outline';
import CartDrawer from './CartDrawer';
import { useCart } from '@/contexts/CartContext';
import { useStaffCheck } from '@/hooks/useStaffCheck';
import { Menu, Transition } from '@headlessui/react';

// Improved SVG Logo component
function Logo({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Bag body */}
      <rect x="8" y="12" width="24" height="20" rx="6" fill="white" className="dark:fill-[#232b3b]" stroke="#0ea5e9" strokeWidth="2.5" />
      {/* Bag handles */}
      <path d="M14 16V12a6 6 0 0 1 12 0v4" stroke="#0ea5e9" strokeWidth="2.5" className="dark:stroke-white" />
      {/* Checkmark */}
      <path d="M16 24l4 4 6-7" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-white" />
    </svg>
  );
}

export default function Header() {
  const { user, accessToken, logout, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cart } = useCart();
  const isStaff = useStaffCheck();

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-footerC/70 backdrop-blur-md shadow-lg border-b border-accentC transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 select-none">
          <Logo />
          <span className="font-bold text-xl sm:text-2xl text-heading tracking-tight">Loqta</span>
        </div>
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-3 flex-1 justify-center">
          <Link href="/" className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition hover:bg-accentC/10 ${pathname === '/' ? 'bg-accentC/10 text-accentC' : 'text-heading'}`}> 
            <HomeIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className={`px-5 py-2 rounded-full text-base font-bold border border-accentC transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accentC/50 ${pathname === '/dashboard' ? 'bg-accentC text-cardC shadow scale-105' : 'hover:bg-accentC/10 text-heading hover:scale-105'}`}
              >
                Dashboard
              </Link>
              {isStaff && (
              <Link
                href="/dashboard/categories"
                className={`px-5 py-2 rounded-full text-base font-bold border border-accentC transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accentC/50 ${pathname === '/dashboard/categories' ? 'bg-accentC text-cardC shadow scale-105' : 'hover:bg-accentC/10 text-heading hover:scale-105'}`}
              >
                Categories
              </Link>
              )}
              <Link
                href="/profile"
                className={`px-5 py-2 rounded-full text-base font-bold border border-accentC transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accentC/50 ${pathname === '/profile' ? 'bg-accentC text-cardC shadow scale-105' : 'hover:bg-accentC/10 text-heading hover:scale-105'}`}
              >
                Profile
              </Link>
              <Link
                href="/orders"
                className={`px-5 py-2 rounded-full text-base font-bold border border-accentC transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accentC/50 ${pathname === '/orders' ? 'bg-accentC text-cardC shadow scale-105' : 'hover:bg-accentC/10 text-heading hover:scale-105'}`}
              >
                Orders
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`px-5 py-2 rounded-full text-base font-bold border border-accentC transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accentC/50 ${pathname === '/login' ? 'bg-accentC text-cardC shadow scale-105' : 'hover:bg-accentC/10 text-heading hover:scale-105'}`}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className={`px-5 py-2 rounded-full text-base font-bold border border-accentC transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accentC/50 ${pathname === '/register' ? 'bg-accentC text-cardC shadow scale-105' : 'hover:bg-accentC/10 text-heading hover:scale-105'}`}
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
        {/* Right Side */}
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          {/* Profile image with dropdown */}
          {authLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="focus:outline-none group">
            <img
              src={user.profile_pic || '/profile.png'}
              alt="Profile"
                  className="h-8 w-8 rounded-full object-cover border-2 border-accentC shadow group-hover:ring-2 group-hover:ring-accentC group-focus:ring-2 group-focus:ring-accentC transition"
                  title={user.username || user.email || 'Profile'}
                />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-zinc-900 border border-muted/10 divide-y divide-muted/10 rounded-xl shadow-lg focus:outline-none z-50">
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-heading">{user.username || user.email}</p>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }: { active: boolean }) => (
                        <button
                          onClick={() => router.push('/profile')}
                          className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-accentC/10 text-accentC' : 'text-heading'}`}
                        >
                          Profile
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }: { active: boolean }) => (
            <button
                          onClick={async () => { await logout(); router.push('/login'); }}
                          className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-red-100 text-red-600' : 'text-heading'}`}
            >
              Logout
            </button>
          )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : null}
          {/* Cart Icon Button */}
          <button
            className="relative p-2 rounded-full hover:bg-accentC/10 transition"
            aria-label="View cart"
            onClick={() => setCartOpen(true)}
          >
            <svg className="h-7 w-7 text-accentC" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.52 17h8.96a1 1 0 00.87-1.45L17 13M7 13V6h10v7" /></svg>
            {/* Cart count badge (to be wired up) */}
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[1.5em] text-center">{cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}</span>
          </button>
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
          {/* Hamburger for mobile */}
          <button
            className="md:hidden ml-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-accentC"
            aria-label="Open navigation menu"
            onClick={() => setMenuOpen(m => !m)}
          >
            <svg className="h-6 w-6 text-heading" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="md:hidden bg-footerC/95 border-t border-accentC px-4 pb-4 pt-2 flex flex-col gap-2 animate-fade-in-down transition-colors duration-500">
          <Link
            href="/"
            className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition hover:bg-accentC/10 ${pathname === '/' ? 'bg-accentC/10 text-accentC' : 'text-heading'}`}
            onClick={() => setMenuOpen(false)}
          >
            <HomeIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className={`px-5 py-2 rounded-full text-base font-bold border border-accentC transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accentC/50 ${pathname === '/dashboard' ? 'bg-accentC text-cardC shadow scale-105' : 'hover:bg-accentC/10 text-heading hover:scale-105'}`}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              {isStaff && (
              <Link
                href="/dashboard/categories"
                className={`px-5 py-2 rounded-full text-base font-bold border border-accentC transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accentC/50 ${pathname === '/dashboard/categories' ? 'bg-accentC text-cardC shadow scale-105' : 'hover:bg-accentC/10 text-heading hover:scale-105'}`}
                onClick={() => setMenuOpen(false)}
              >
                Categories
              </Link>
              )}
              <Link
                href="/profile"
                className={`px-5 py-2 rounded-full text-base font-bold border border-accentC transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accentC/50 ${pathname === '/profile' ? 'bg-accentC text-cardC shadow scale-105' : 'hover:bg-accentC/10 text-heading hover:scale-105'}`}
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/orders"
                className={`px-5 py-2 rounded-full text-base font-bold border border-accentC transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accentC/50 ${pathname === '/orders' ? 'bg-accentC text-cardC shadow scale-105' : 'hover:bg-accentC/10 text-heading hover:scale-105'}`}
                onClick={() => setMenuOpen(false)}
              >
                Orders
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`px-5 py-2 rounded-full text-base font-bold border border-accentC transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accentC/50 ${pathname === '/login' ? 'bg-accentC text-cardC shadow scale-105' : 'hover:bg-accentC/10 text-heading hover:scale-105'}`}
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className={`px-5 py-2 rounded-full text-base font-bold border border-accentC transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accentC/50 ${pathname === '/register' ? 'bg-accentC text-cardC shadow scale-105' : 'hover:bg-accentC/10 text-heading hover:scale-105'}`}
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}