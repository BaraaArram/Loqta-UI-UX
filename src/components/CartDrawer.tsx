// CartDrawer component: Provides a slide-out cart UI for viewing and managing cart items.
"use client";
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';
import NoData from './NoData';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { removeFromCart, clearCart, fetchCart, setCart, removeFromCartLocal, clearCartLocal } from '@/features/cart/cartSlice';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { useI18n } from '@/hooks/useI18n';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { t } = useTranslation('common');
  const { i18n } = useI18n();
  const isRTL = i18n.language === 'ar';
  const cartState = useSelector((state: RootState) => state.cart.cart);
  const cart = cartState?.items || [];
  const appliedCoupon = cartState?.coupon;
  const totalPrice = cartState?.total_price;
  const loading = useSelector((state: RootState) => state.cart.loading);
  const error = useSelector((state: RootState) => state.cart.error);
  const dispatch = useDispatch<AppDispatch>();
  const [removing, setRemoving] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [coupon, setCoupon] = useState('');
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  // Remove the useEffect for coupon auto-apply
  // Add state for applyingCoupon
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Helper function to generate locale-aware URLs
  const getLocaleUrl = (path: string) => {
    const currentLocale = i18n.language || 'en';
    return `/${currentLocale}${path}`;
  };

  // Focus trap for accessibility
  useEffect(() => {
    if (open && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      if (isAuthenticated) {
        dispatch(fetchCart());
      } else if (typeof window !== 'undefined') {
        // Load cart from localStorage for guests
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        dispatch(setCart(localCart));
      }
    }
  }, [open, dispatch, isAuthenticated]);

  // Remove the useEffect for coupon auto-apply
  // Add state for applyingCoupon
  const handleApplyCoupon = async () => {
    if (!coupon) return;
    setApplyingCoupon(true);
    try {
      console.log('[applyCoupon] Request: POST /api/v1/coupon/apply-coupon/', { code: coupon });
      const res = await api.post('/api/v1/coupon/apply-coupon/', { code: coupon }, { withCredentials: true });
      console.log('[applyCoupon] Response:', res.data);
      Swal.fire({
        icon: 'success',
        title: t('coupon_applied_success'),
        confirmButtonText: t('ok'),
        confirmButtonColor: '#3085d6',
      });
    } catch (err) {
      console.error('[applyCoupon] Error:', err);
      Swal.fire({
        icon: 'error',
        title: t('oops'),
        text: t('coupon_applied_error'),
        confirmButtonText: t('ok'),
        confirmButtonColor: '#d33',
      });
    }
    setApplyingCoupon(false);
  };

  const handleRemove = async (product_id: string) => {
    setRemoving(product_id);
    try {
      if (isAuthenticated) {
        dispatch(removeFromCart(product_id));
      } else {
        dispatch(removeFromCartLocal(product_id));
        // Update localStorage
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]').filter((i: any) => i.product_id !== product_id);
        localStorage.setItem('cart', JSON.stringify(localCart));
        dispatch(setCart(localCart));
      }
    } finally {
      setRemoving(null);
    }
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setOrderMessage(null);
    setOrderSuccess(false);
    if ((cart?.length ?? 0) === 0) {
      setOrderMessage(t('cart_empty'));
      setPlacingOrder(false);
      return;
    }
    if (!isAuthenticated) {
      setOrderMessage(t('please_login_to_checkout'));
      setPlacingOrder(false);
      Swal.fire({
        icon: 'info',
        title: t('login_required'),
        text: t('please_login_to_checkout'),
        confirmButtonText: t('ok'),
        confirmButtonColor: '#3085d6',
      }).then(() => {
        router.push(getLocaleUrl('/login'));
      });
      return;
    }
    try {
      let body: any = { quantity: 2147483647, coupon: coupon || undefined, status: 'PE' };
      const res = await api.post('/api/v1/orders/', body, { withCredentials: true });
      setOrderMessage(t('order_placed_successfully'));
      setOrderSuccess(true);
      if (isAuthenticated) {
        await dispatch(clearCart());
      } else {
        dispatch(clearCartLocal());
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cart');
        }
      }
      dispatch(fetchCart());
      Swal.fire({
        icon: 'success',
        title: t('order_placed'),
        text: t('order_placed_text'),
        confirmButtonText: t('ok'),
        confirmButtonColor: '#3085d6',
      }).then(() => {
        router.push(getLocaleUrl('/orders'));
      });
    } catch (err: any) {
      setOrderMessage(err?.response?.data?.message || t('failed_to_place_order'));
    }
    setPlacingOrder(false);
  };

  // Calculate total
  const total = Array.isArray(cart)
    ? cart.reduce((total, item) => total + (parseFloat(item.price.toString() || '0') * item.quantity), 0)
    : 0;

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-500 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Overlay with glassmorphism */}
      <div
        className={`absolute inset-0 bg-bg/60 backdrop-blur-sm transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-label={t('close_cart')}
        tabIndex={-1}
      />
      {/* Drawer */}
      <aside
        ref={drawerRef}
        tabIndex={-1}
        className={`absolute right-0 top-0 h-full w-full max-w-xl bg-card/95 shadow-xl border-l border-border/30 transform transition-transform duration-500 ${open ? 'translate-x-0' : 'translate-x-full'} rounded-l-3xl flex flex-col focus:outline-none ${isRTL ? 'rtl' : 'ltr'}`}
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}
        role="dialog"
        aria-modal="true"
        aria-label={t('shopping_cart_drawer')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border/20 bg-card rounded-tl-3xl sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-heading tracking-tight">{t('your_cart')}</h2>
          <button
            onClick={onClose}
            aria-label={t('close_cart')}
            className="p-2 rounded-full text-muted hover:text-accent hover:bg-accent-light/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200"
          >
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>
        {/* Cart Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-card rounded-bl-3xl min-h-[300px] max-h-[calc(100vh-180px)]">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <svg className="animate-spin h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            </div>
          ) : error ? (
            <div className="text-error text-center font-semibold py-8">{error}</div>
          ) : (cart?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <NoData message={t('cart_empty')} />
            </div>
          ) : (
            <ul className="flex flex-col gap-6">
              {Array.isArray(cart) ? cart.map((item) => (
                <li
                  key={item.product_id}
                  className="flex items-center gap-6 bg-bg-secondary/80 dark:bg-bg-secondary/60 rounded-2xl p-5 shadow border border-border/20 group transition-all duration-200 hover:shadow-lg hover:border-accent/30"
                >
                  <img
                    src={item.thumbnail || '/product.png'}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-border/30 shadow-sm bg-card"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-heading truncate mb-1">{item.name}</div>
                    <div className="text-base text-muted mb-1">${item.price} x {item.quantity}</div>
                    <div className="text-lg font-semibold text-accent">${(parseFloat(item.price.toString() || '0') * item.quantity).toFixed(2)}</div>
                  </div>
                  <button
                    className="text-error hover:text-error-light font-bold text-xl p-2 rounded-full bg-card shadow border border-error/10 hover:border-error/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-error/30"
                    onClick={() => handleRemove(item.product_id)}
                    disabled={removing === item.product_id}
                    aria-label={t('remove_item', { itemName: item.name })}
                  >
                    {removing === item.product_id ? (
                      <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    ) : (
                      <XMarkIcon className="h-6 w-6" />
                    )}
                  </button>
                </li>
              )) : null}
            </ul>
          )}
        </div>
        {/* Sticky Footer: Total & Actions */}
        {Array.isArray(cart) && (cart.length ?? 0) > 0 && (
          <div className="px-8 py-7 border-t border-border/20 bg-card rounded-bl-3xl flex flex-col gap-4 sticky bottom-0 z-10 shadow-[0_-2px_16px_0_rgba(31,38,135,0.04)]">
            {/* Coupon & Discount Summary */}
            {appliedCoupon && (
              <div className="flex items-center justify-between mb-2 text-base">
                <span className="font-semibold text-heading">
                  {t('coupon')}: <span className="text-accent font-bold">{appliedCoupon.code}</span>
                </span>
                <span className="text-success font-bold">-{appliedCoupon.discount}%</span>
              </div>
            )}
            {/* Price Breakdown */}
            {totalPrice && (
              <div className="flex flex-col gap-1 mb-2 text-base">
                <div className="flex items-center justify-between">
                  <span className="text-muted">{t('total')} ({t('without_discount') || 'Before discount'})</span>
                  <span className="line-through text-error">${totalPrice.without_discount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-heading">{t('total')} ({t('with_discount') || 'After discount'})</span>
                  <span className="text-2xl font-bold text-accent">${totalPrice.with_discount.toFixed(2)}</span>
                </div>
              </div>
            )}
            {/* Coupon input and button */}
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-3 rounded-lg border border-border/30 bg-bg-secondary text-heading placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200 text-base outline-none"
                placeholder={t('coupon_code_placeholder')}
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                disabled={placingOrder || applyingCoupon}
                aria-label={t('coupon_code')}
              />
              <button
                type="button"
                className="px-4 py-3 bg-accent text-button-text rounded-lg font-bold hover:bg-accent-hover transition-all duration-200 text-base shadow focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60"
                onClick={handleApplyCoupon}
                disabled={!coupon || applyingCoupon}
                aria-label={t('apply_coupon')}
              >
                {applyingCoupon ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                ) : t('apply_coupon')}
              </button>
            </div>
            {/* Place Order button */}
            <button
              className="w-full px-5 py-3 bg-accent text-button-text rounded-lg font-bold hover:bg-accent-hover transition-all duration-200 text-lg shadow focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60 flex items-center justify-center gap-2"
              onClick={handlePlaceOrder}
              disabled={placingOrder || (cart?.length ?? 0) === 0}
              aria-label={t('place_order')}
            >
              {placingOrder ? (
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              ) : orderSuccess ? (
                <CheckCircleIcon className="h-6 w-6 text-success" />
              ) : (
                t('place_order')
              )}
            </button>
            {orderMessage && (
              <div className={`text-center text-sm mt-2 ${orderSuccess ? 'text-success' : 'text-muted'}`}>{orderMessage}</div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
} 