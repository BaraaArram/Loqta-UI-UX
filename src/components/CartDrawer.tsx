import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import NoData from './NoData';
import { useCart } from '@/contexts/CartContext';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, loading, error, removeFromCart, clearCart, fetchCart } = useCart();
  const [removing, setRemoving] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [coupon, setCoupon] = useState('');
  const router = useRouter();

  const handleRemove = async (product_id: string) => {
    setRemoving(product_id);
    try {
      await removeFromCart(product_id);
    } finally {
      setRemoving(null);
    }
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setOrderMessage(null);
    if (cart.length === 0) {
      setOrderMessage('Your cart is empty.');
      setPlacingOrder(false);
      return;
    }
    try {
      let body: any = { quantity: 2147483647, coupon: 'string', status: 'PE' };
      console.log('Order request body:', body);
      const res = await api.post('/api/v1/orders/', body, { withCredentials: true });
      console.log('Order placed response:', res);
      setOrderMessage('Order placed successfully!');
      await fetchCart();
      Swal.fire({
        icon: 'success',
        title: 'Order Placed',
        text: 'Your order has been placed successfully!',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        router.push('/orders');
      });
    } catch (err: any) {
      console.error('Order place error:', err, err?.response);
      setOrderMessage(err?.response?.data?.message || 'Failed to place order.');
    }
    setPlacingOrder(false);
  };

  return (
    <div className={`fixed inset-0 z-50 transition-all ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-label="Close cart"
      />
      {/* Drawer */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-zinc-900 shadow-2xl border-l border-muted/10 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'} rounded-l-3xl flex flex-col`}
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-10 py-7 border-b border-muted/10 bg-white dark:bg-zinc-900 rounded-tl-3xl">
          <h2 className="text-3xl font-bold text-heading">Your Cart</h2>
          <button onClick={onClose} aria-label="Close cart" className="text-4xl text-muted hover:text-accentC transition font-bold">&times;</button>
        </div>
        <div className="flex-1 p-10 overflow-y-auto bg-white dark:bg-zinc-900 rounded-bl-3xl min-h-[400px] max-h-[calc(100vh-180px)]">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <svg className="animate-spin h-8 w-8 text-accentC" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center font-semibold py-8">{error}</div>
          ) : cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <NoData message="Your cart is empty." />
            </div>
          ) : (
            <ul className="flex flex-col gap-8">
              {cart.map((item: any) => (
                <li key={item.product?.product_id} className="flex items-center gap-8 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-muted/10">
                  <img src={item.product?.thumbnail || '/product.png'} alt={item.product?.name} className="w-24 h-24 rounded-lg object-cover border shadow-sm" />
                  <div className="flex-1">
                    <div className="font-bold text-xl text-heading mb-1">{item.product?.name}</div>
                    <div className="text-base text-muted mb-1">${item.product?.price} x {item.quantity}</div>
                    <div className="text-lg font-semibold text-accentC">${(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)}</div>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 font-bold text-2xl px-4 py-2 rounded-full bg-white dark:bg-zinc-900 shadow border border-red-100 hover:border-red-300 transition"
                    onClick={() => handleRemove(item.product?.product_id)}
                    disabled={removing === item.product?.product_id}
                  >
                    {removing === item.product?.product_id ? (
                      <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Total price section */}
        {cart.length > 0 && (
          <div className="px-10 py-8 border-t border-muted/10 bg-white dark:bg-zinc-900 rounded-bl-3xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold text-heading">Total</span>
              <span className="text-2xl font-bold text-accentC">
                ${cart.reduce((total, item) => total + (parseFloat(item.product?.price || '0') * item.quantity), 0).toFixed(2)}
              </span>
            </div>
            {/* Coupon input */}
            <input
              type="text"
              className="input input-bordered w-full mt-2"
              placeholder="Coupon code (optional)"
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
              disabled={placingOrder}
            />
            {/* Place Order button */}
            <button
              className="w-full px-5 py-3 bg-accentC text-cardC rounded-lg font-bold hover:bg-accentC/90 transition text-lg shadow disabled:opacity-60"
              onClick={handlePlaceOrder}
              disabled={placingOrder || cart.length === 0}
            >
              {placingOrder ? 'Placing Order...' : 'Place Order'}
            </button>
            {orderMessage && (
              <div className="text-center text-muted text-sm mt-2">{orderMessage}</div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
} 