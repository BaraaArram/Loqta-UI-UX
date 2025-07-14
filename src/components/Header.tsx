// Header component: Displays the main navigation, logo, theme switcher, and cart badge.
"use client";
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/features/auth/authSlice';
import { useRouter, usePathname } from 'next/navigation';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useState, Fragment, useRef, useEffect } from 'react';
import { HomeIcon, ShoppingBagIcon, UserIcon, CogIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import CartDrawer from './CartDrawer';
import { Menu, Transition } from '@headlessui/react';
import { fetchCart, clearCart } from '@/features/cart/cartSlice';
import { useStaffCheck } from '@/hooks/useStaffCheck';
import { useI18n } from '@/hooks/useI18n';
import '@/styles/amiri-arabic-font.css';

// Enhanced SVG Logo component with better theme integration
function Logo({ className = "h-8 w-8", isRTL = false }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Bag body with theme-aware colors */}
      <rect 
        x="8" 
        y="12" 
        width="24" 
        height="20" 
        rx="6" 
        fill="currentColor" 
        className="text-card" 
        stroke="currentColor" 
        strokeWidth="2.5" 
      />
      {/* Bag handles */}
      <path 
        d="M14 16V12a6 6 0 0 1 12 0v4" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        className="text-accent"
      />
      {/* Checkmark */}
      <path 
        d="M16 24l4 4 6-7" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-accent"
      />
    </svg>
  );
}

// Enhanced Navigation Link Component
function NavLink({ 
  href, 
  children, 
  isActive, 
  icon: Icon, 
  className = "",
  onClick
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
        transition-all duration-300 ease-out transform hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2
        ${isActive 
          ? 'bg-accent text-button-text shadow-lg shadow-accent/25 scale-105' 
          : 'text-heading hover:bg-accent-light/50 hover:text-accent'
        }
        ${className}
      `}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
      {isActive && (
        <span className="absolute left-4 right-4 bottom-1 h-1 rounded-full bg-accent transition-all duration-300" style={{zIndex:2}} />
      )}
    </Link>
  );
}

export default function Header() {
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  const hydrated = useSelector((state: RootState) => state.auth.hydrated);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useSelector((state: RootState) => state.cart.cart);
  const { isStaff, isStaffLoading } = useStaffCheck();
  const { t, i18n, isReady } = useI18n();
  const isRTL = i18n.language === 'ar';
  const theme = useSelector((state: RootState) => state.theme.theme);

  // Helper function to generate locale-aware URLs
  const getLocaleUrl = (path: string) => {
    const currentLocale = i18n.language || 'en';
    return `/${currentLocale}${path}`;
  };

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      dispatch(fetchCart() as any);
    }
  }, [hydrated, isAuthenticated, dispatch]);

  if (!hydrated) {
    return null;
  }

  const cartItems = cart?.items || [];
  const cartItemCount = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;

  // Language switcher handler
  const switchLanguage = () => {
    const newLocale = i18n.language === 'ar' ? 'en' : 'ar';
    
    // Update URL to include new locale - this will trigger I18nProvider to change language
    const segments = pathname.split('/');
    if (['ar', 'en'].includes(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    
    // Navigate to the new URL - this will trigger the I18nProvider to change language
    router.push(segments.join('/'));
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-40 bg-card backdrop-blur-xl shadow-lg border-b border-border/50 transition-all duration-500 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className={`max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Enhanced Logo and Brand */}
        <Link 
          href={getLocaleUrl('/')} 
          className="flex items-center gap-3 select-none cursor-pointer group" 
          prefetch={false} 
          aria-label="Go to homepage"
        >
          <div className="relative">
            {isRTL ? (
              <svg viewBox="0 0 420 120" xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto transition-transform duration-300 group-hover:scale-110">
                <defs>
                  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#D4AF37"/>
                    <stop offset="100%" stopColor="#fffbe6"/>
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" rx="32" fill="var(--color-bg)"/>
                <text x="210" y="78" textAnchor="middle"
                      fontSize="64"
                      fontFamily="'Amiri', 'Cairo', serif"
                      fill="var(--color-accent)"
                      fontWeight="bold"
                      style={{letterSpacing:'0.08em'}}>
                  لَقْطَة
                </text>
                {/* Damma (ضمة) on ل */}
                <circle cx="142" cy="40" r="4" fill="url(#gold)" />
                {/* Sukun on ق */}
                <circle cx="185" cy="44" r="4" fill="url(#gold)" />
                {/* Fatha on ط */}
                <ellipse cx="230" cy="48" rx="7" ry="3" fill="url(#gold)" />
                {/* Gold dot on ta marbuta (ة) as a lens/spotlight */}
                <circle cx="265" cy="88" r="7" fill="url(#gold)" opacity="0.85"/>
                {/* Optional: Gold focus ring */}
                <ellipse cx="210" cy="75" rx="120" ry="38" fill="none" stroke="url(#gold)" strokeWidth="5" opacity="0.6"/>
              </svg>
            ) : (
              <Logo className="h-10 w-10 text-accent transition-transform duration-300 group-hover:scale-110" isRTL={isRTL} />
            )}
            <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping opacity-75" />
          </div>
          <div className="flex flex-col">
            {!isRTL && (
              <span className="font-bold text-xl sm:text-2xl text-heading group-hover:text-accent transition-colors duration-300">
                {t('loqta')}
              </span>
            )}
            <span className="text-xs text-text-secondary font-medium">{t('your_shopping_companion')}</span>
          </div>
        </Link>

        {/* Enhanced Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
          <NavLink href={getLocaleUrl('/')} isActive={pathname === getLocaleUrl('/') || pathname === `/${i18n.language}` || pathname === `/${i18n.language}/`} icon={HomeIcon}>
            {t('home')}
          </NavLink>
          
          {isAuthenticated ? (
            <>
              <NavLink href={getLocaleUrl('/dashboard')} isActive={pathname === getLocaleUrl('/dashboard')} icon={CogIcon}>
                {t('dashboard')}
              </NavLink>
              {isStaff === true && (
                <NavLink href={getLocaleUrl('/dashboard/categories')} isActive={pathname === getLocaleUrl('/dashboard/categories')}>
                  {t('categories')}
                </NavLink>
              )}
              <NavLink href={getLocaleUrl('/profile')} isActive={pathname === getLocaleUrl('/profile')} icon={UserIcon}>
                {t('profile')}
              </NavLink>
              <NavLink href={getLocaleUrl('/orders')} isActive={pathname === getLocaleUrl('/orders')} icon={ShoppingBagIcon}>
                {t('orders')}
              </NavLink>
            </>
          ) : (
            <>
              <NavLink href={getLocaleUrl('/login')} isActive={pathname === getLocaleUrl('/login')}>
                {t('sign_in')}
              </NavLink>
              <NavLink href={getLocaleUrl('/register')} isActive={pathname === getLocaleUrl('/register')}>
                {t('sign_up')}
              </NavLink>
            </>
          )}
        </nav>

        {/* Enhanced Right Side */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <div className="relative">
          <ThemeSwitcher />
          </div>

          {/* Language Switcher */}
          {isReady && (
            <button
              onClick={switchLanguage}
              className="relative p-3 rounded-xl bg-red-500 hover:bg-red-600 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-red-500 text-white border-2 border-red-400 shadow-lg"
              aria-label={t('switch_language')}
              title={i18n.language === 'ar' ? t('switch_to_english') : t('switch_to_arabic')}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {i18n.language === 'ar' ? 'EN' : 'عربي'}
                </span>
                <svg className="h-4 w-4 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-xl bg-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          )}

          {/* Enhanced Profile Dropdown */}
          {authLoading ? (
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="focus:outline-none group">
                <div className="relative">
            <img
              src={user.profile_pic || '/profile.png'}
              alt="Profile"
                    className="h-10 w-10 rounded-full object-cover border-2 border-accent/20 shadow-lg group-hover:border-accent group-focus:ring-2 group-focus:ring-accent/50 transition-all duration-300 group-hover:scale-110"
                  title={user.username || user.email || 'Profile'}
                />
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-success rounded-full border-2 border-card" />
                </div>
              </Menu.Button>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-3 w-56 origin-top-right bg-card border border-border/20 divide-y divide-border/10 rounded-2xl shadow-xl focus:outline-none z-50 backdrop-blur-xl">
                  <div className="px-4 py-4">
                    <p className="text-sm font-semibold text-heading">{user.username || user.email}</p>
                    <p className="text-xs text-text-secondary mt-1">{t('online')}</p>
                  </div>
                  <div className="py-2">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => router.push(getLocaleUrl('/profile'))}
                          className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors duration-200 ${
                            active ? 'bg-accent-light/50 text-accent' : 'text-text hover:bg-accent-light/30'
                          }`}
                        >
                          <UserIcon className="h-4 w-4" />
                          {t('profile')}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
            <button
                          onClick={async () => {
                            await dispatch(logout() as any);
                            await dispatch(clearCart() as any);
                            router.push(getLocaleUrl('/login'));
                          }}
                          className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors duration-200 ${
                            active ? 'bg-error-light text-error' : 'text-text hover:bg-error-light/30'
                          }`}
            >
                          <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          {t('logout')}
            </button>
          )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : null}

          {/* Enhanced Cart Button */}
          <button
            className="relative p-3 rounded-xl hover:bg-accent-light/50 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label={t('view_cart')}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBagIcon className="h-6 w-6 text-accent group-hover:scale-110 transition-transform duration-300" />
            
            {/* Enhanced Cart Badge */}
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-error text-button-text text-xs font-bold rounded-full px-2 py-1 min-w-[1.5em] text-center shadow-lg animate-pulse">
                {cartItemCount}
              </span>
            )}
            
            {/* Hover Effect */}
            <div className="absolute inset-0 rounded-xl bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

          {/* Enhanced Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-accent-light/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-300"
            aria-label={t('open_navigation_menu')}
            onClick={() => setMenuOpen(m => !m)}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-5 h-0.5 bg-heading transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`} />
              <span className={`block w-5 h-0.5 bg-heading transition-all duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`block w-5 h-0.5 bg-heading transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Mobile Navigation */}
      <Transition
        show={menuOpen}
        enter="transition ease-out duration-300"
        enterFrom="opacity-0 -translate-y-4"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-4"
      >
        <div className="lg:hidden">
        <nav className="bg-card/95 backdrop-blur-xl border-t border-border/50 px-4 pb-6 pt-4 flex flex-col gap-3">
          <NavLink 
            href={getLocaleUrl('/')} 
            isActive={pathname === getLocaleUrl('/') || pathname === `/${i18n.language}` || pathname === `/${i18n.language}/`} 
            icon={HomeIcon}
            onClick={() => setMenuOpen(false)}
          >
            {t('home')}
          </NavLink>
          
          {isAuthenticated ? (
            <>
              <NavLink 
                href={getLocaleUrl('/dashboard')} 
                isActive={pathname === getLocaleUrl('/dashboard')} 
                icon={CogIcon}
                onClick={() => setMenuOpen(false)}
              >
                {t('dashboard')}
              </NavLink>
              {isStaff === true && (
                <NavLink 
                  href={getLocaleUrl('/dashboard/categories')} 
                  isActive={pathname === getLocaleUrl('/dashboard/categories')}
                  onClick={() => setMenuOpen(false)}
                >
                  {t('categories')}
                </NavLink>
              )}
              <NavLink 
                href={getLocaleUrl('/profile')} 
                isActive={pathname === getLocaleUrl('/profile')} 
                icon={UserIcon}
                onClick={() => setMenuOpen(false)}
              >
                {t('profile')}
              </NavLink>
              <NavLink 
                href={getLocaleUrl('/orders')} 
                isActive={pathname === getLocaleUrl('/orders')} 
                icon={ShoppingBagIcon}
                onClick={() => setMenuOpen(false)}
              >
                {t('orders')}
              </NavLink>
            </>
          ) : (
            <>
              <NavLink 
                href={getLocaleUrl('/login')} 
                isActive={pathname === getLocaleUrl('/login')}
                onClick={() => setMenuOpen(false)}
              >
                {t('sign_in')}
              </NavLink>
              <NavLink 
                href={getLocaleUrl('/register')} 
                isActive={pathname === getLocaleUrl('/register')}
                onClick={() => setMenuOpen(false)}
              >
                {t('sign_up')}
              </NavLink>
            </>
          )}
        </nav>
        </div>
        </Transition>
    </header>
  );
}