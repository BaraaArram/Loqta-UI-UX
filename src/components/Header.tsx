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

// Enhanced SVG Logo component with better theme integration
function Logo({ className = "h-8 w-8" }) {
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
        <div className="absolute inset-0 rounded-xl bg-accent/10 animate-pulse" />
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

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      dispatch(fetchCart() as any);
    }
  }, [hydrated, isAuthenticated, dispatch]);

  if (!hydrated) {
    return null;
  }

  const cartItemCount = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-card/80 backdrop-blur-xl shadow-lg border-b border-border/50 transition-all duration-500">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Enhanced Logo and Brand */}
        <Link 
          href="/" 
          className="flex items-center gap-3 select-none cursor-pointer group" 
          prefetch={false} 
          aria-label="Go to homepage"
        >
          <div className="relative">
            <Logo className="h-10 w-10 text-accent transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping opacity-75" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl sm:text-2xl text-heading group-hover:text-accent transition-colors duration-300">
              Loqta
            </span>
            <span className="text-xs text-text-secondary font-medium">Your Shopping Companion</span>
          </div>
        </Link>

        {/* Enhanced Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
          <NavLink href="/" isActive={pathname === '/'} icon={HomeIcon}>
            Home
          </NavLink>
          
          {isAuthenticated ? (
            <>
              <NavLink href="/dashboard" isActive={pathname === '/dashboard'} icon={CogIcon}>
                Dashboard
              </NavLink>
              {isStaff === true && (
                <NavLink href="/dashboard/categories" isActive={pathname === '/dashboard/categories'}>
                  Categories
                </NavLink>
              )}
              <NavLink href="/profile" isActive={pathname === '/profile'} icon={UserIcon}>
                Profile
              </NavLink>
              <NavLink href="/orders" isActive={pathname === '/orders'} icon={ShoppingBagIcon}>
                Orders
              </NavLink>
            </>
          ) : (
            <>
              <NavLink href="/login" isActive={pathname === '/login'}>
                Sign In
              </NavLink>
              <NavLink href="/register" isActive={pathname === '/register'}>
                Sign Up
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
                    <p className="text-xs text-text-secondary mt-1">Online</p>
                  </div>
                  <div className="py-2">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => router.push('/profile')}
                          className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors duration-200 ${
                            active ? 'bg-accent-light/50 text-accent' : 'text-text hover:bg-accent-light/30'
                          }`}
                        >
                          <UserIcon className="h-4 w-4" />
                          Profile
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={async () => {
                            await dispatch(logout() as any);
                            await dispatch(clearCart() as any);
                            router.push('/login');
                          }}
                          className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors duration-200 ${
                            active ? 'bg-error-light text-error' : 'text-text hover:bg-error-light/30'
                          }`}
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          Logout
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
            aria-label="View cart"
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
            aria-label="Open navigation menu"
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
            href="/" 
            isActive={pathname === '/'} 
            icon={HomeIcon}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </NavLink>
          
          {isAuthenticated ? (
            <>
              <NavLink 
                href="/dashboard" 
                isActive={pathname === '/dashboard'} 
                icon={CogIcon}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              {isStaff === true && (
                <NavLink 
                  href="/dashboard/categories" 
                  isActive={pathname === '/dashboard/categories'}
                  onClick={() => setMenuOpen(false)}
                >
                  Categories
                </NavLink>
              )}
              <NavLink 
                href="/profile" 
                isActive={pathname === '/profile'} 
                icon={UserIcon}
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </NavLink>
              <NavLink 
                href="/orders" 
                isActive={pathname === '/orders'} 
                icon={ShoppingBagIcon}
                onClick={() => setMenuOpen(false)}
              >
                Orders
              </NavLink>
            </>
          ) : (
            <>
              <NavLink 
                href="/login" 
                isActive={pathname === '/login'}
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </NavLink>
              <NavLink 
                href="/register" 
                isActive={pathname === '/register'}
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </NavLink>
            </>
                      )}
          </nav>
        </div>
        </Transition>
      </header>
  );
}