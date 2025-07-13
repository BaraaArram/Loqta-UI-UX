// OrdersPage: Displays the user's order history and order details for the selected locale.
"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import Header from "@/components/Header";
import NoData from "@/components/NoData";
import { TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import Swal from 'sweetalert2';
import axios from '@/lib/axios';
import { useTranslation } from 'react-i18next';

interface OrderItem {
  product: {
    product_id: string;
    name: string;
    slug: string;
    price: string;
    thumbnail: string;
    category_detail: { name: string; slug: string };
  };
  quantity: number;
  price: string;
}

interface Order {
  order_id: string;
  user: string;
  quantity: number;
  order_date: string;
  order_items: OrderItem[];
  original_price: string;
  total_price: string;
  coupon: string | null;
  discount: string;
  status: string;
}

interface PaginationMeta {
  next: string | null;
  previous: string | null;
  count: number;
  current_page: number;
  total_pages: number;
  page_size: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const { t } = useTranslation('common');

  const fetchOrders = async (pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      console.log('[fetchOrders] Request: GET /api/v1/orders/?page=' + pageNum);
      const res = await api.get(`/api/v1/orders/?page=${pageNum}`);
      console.log('[fetchOrders] Response:', res.data);
      setOrders(res.data?.data || []);
      setMeta(res.data?.meta?.pagination || null);
    } catch (err: any) {
      setError(err?.message || "Failed to load orders.");
      setOrders([]);
    }
    setLoading(false);
  };

  const handleDeleteOrder = async (orderId: string) => {
    const result = await Swal.fire({
      title: t('delete_order'),
      text: t('delete_order_confirm'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('yes_delete_it'),
      cancelButtonText: t('cancel')
    });

    if (!result.isConfirmed) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.delete(`/api/v1/orders/${orderId}/`);
      setDeletingOrder(null);
      fetchOrders(page);
      
      // Show success message
      Swal.fire({
        title: t('order_deleted_successfully'),
        icon: 'success',
        confirmButtonText: t('ok'),
        confirmButtonColor: '#10b981',
        timer: 2000
      });
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete order.';
      setDeleteError(errorMessage);
      
      // Show error alert
      Swal.fire({
        title: t('error'),
        text: errorMessage,
        icon: 'error',
        confirmButtonText: t('ok'),
        confirmButtonColor: '#ef4444'
      });
    }
    setDeleteLoading(false);
  };

  const handlePayNow = async (orderId: string) => {
    setPayingOrderId(orderId);
    setPayError(null);
    try {
      const res = await axios.post(`/payment/process/${orderId}/`, { order_id: orderId });
      console.log('Stripe payment process response:', res);
      const paymentUrl = res.data?.data?.payment_url;
      if (res.status === 201 && paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        setPayError(t('failed_to_create_payment_session'));
      }
    } catch (err: any) {
      setPayError(err?.message || 'Failed to create payment session.');
    } finally {
      setPayingOrderId(null);
    }
  };

  useEffect(() => {
    fetchOrders(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bodyC pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-extrabold text-heading mb-8">{t('my_orders')}</h1>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <svg className="animate-spin h-8 w-8 text-accentC" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            </div>
          ) : error ? (
            <NoData message={error} />
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted">
              <span className="text-5xl mb-2">📦</span>
              <div className="text-lg font-semibold mb-1">{t('no_orders_found')}</div>
              <div className="text-base">{t('no_orders_yet')}</div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {orders.map((order) => (
                <div key={order.order_id} className="bg-cardC rounded-2xl shadow-xl border-l-4 border-accentC border-muted/10 p-0 overflow-hidden flex flex-col">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-6 pt-6 pb-2 bg-accentC/5">
                    <div className="flex items-center gap-3">
                      <div className="font-extrabold text-xl text-heading tracking-wide">{t('order_number', { id: order.order_id.slice(0, 8).toUpperCase() })}</div>
                      {/* Status Badge */}
                      {(order.status === 'PE' || order.status === 'Pending') && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-200 shadow-sm" title={t('pending')} aria-label={t('pending')}>
                          <ClockIcon className="h-4 w-4" /> {t('pending')}
                        </span>
                      )}
                      {(order.status === 'CO' || order.status === 'Completed') && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold border border-green-200 shadow-sm" title={t('completed')} aria-label={t('completed')}>
                          <CheckCircleIcon className="h-4 w-4" /> {t('completed')}
                        </span>
                      )}
                      {(order.status === 'CA' || order.status === 'Cancelled') && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200 shadow-sm" title={t('cancelled')} aria-label={t('cancelled')}>
                          <XCircleIcon className="h-4 w-4" /> {t('cancelled')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <svg className="h-4 w-4 text-accentC" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {t('placed_on', { date: new Date(order.order_date).toLocaleString() })}
                    </div>
                  </div>
                  {/* Order Items */}
                  <div className="flex flex-col gap-4 px-6 py-4">
                    {order.order_items.map((item, idx) => (
                      <div key={item.product.product_id + idx} className="flex items-center gap-4 border-b border-muted/10 pb-4 last:border-b-0">
                        <img src={item.product.thumbnail} alt={item.product.name} className="h-20 w-20 rounded-xl object-cover border shadow hover:scale-105 transition" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-heading truncate">{item.product.name}</div>
                          <div className="text-muted text-xs truncate">{t('category')}: {item.product.category_detail.name}</div>
                          <div className="text-muted text-xs">{t('quantity')}: {item.quantity}</div>
                        </div>
                        <div className="text-lg font-bold text-accentC">${item.price}</div>
                      </div>
                    ))}
                  </div>
                  {/* Order Summary & Actions */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-6 pb-6 pt-2 border-t border-muted/10 bg-cardC">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="text-muted text-sm flex items-center gap-1">
                        <svg className="h-4 w-4 text-accentC" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2-2 4 4m0 0l-4-4-2 2" /></svg>
                        {t('coupon')}: {order.coupon || t('none')}
                      </div>
                      <div className="text-muted text-sm flex items-center gap-1">
                        <svg className="h-4 w-4 text-accentC" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /></svg>
                        {t('discount')}: {order.discount ? `${order.discount}${order.discount.includes('%') ? '' : '%'}` : '0%'}
                      </div>
                      <div className="text-muted text-sm flex items-center gap-1">
                        <svg className="h-4 w-4 text-accentC" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" /></svg>
                        {t('original_price')}: <span className="line-through text-error">${parseFloat(order.original_price).toFixed(2)}</span>
                      </div>
                      <div className="text-lg font-bold text-heading flex items-center gap-1">
                        <svg className="h-5 w-5 text-accentC" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" /></svg>
                        {t('total')}: ${parseFloat(order.total_price).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      {/* Pay Now Button for Pending Orders (waiting for payment) */}
                      {(order.status === 'PE' || order.status === 'Pending') && (
                        <button
                          className="px-4 py-2 rounded-lg bg-accentC text-cardC font-bold shadow hover:bg-accentC/90 transition text-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accentC/50 disabled:opacity-60"
                          onClick={() => handlePayNow(order.order_id)}
                          disabled={payingOrderId === order.order_id}
                          aria-label={t('pay_for_this_order')}
                          title={t('pay_for_this_order')}
                        >
                          {payingOrderId === order.order_id ? (
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                          ) : (
                            <span>{t('pay_now')}</span>
                          )}
                        </button>
                      )}
                      <button
                        className="p-2 rounded-full hover:bg-red-100 text-red-600 transition"
                        title={t('delete_order')}
                        onClick={() => handleDeleteOrder(order.order_id)}
                        disabled={deleteLoading}
                      >
                        <TrashIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  {/* Show payment error if any */}
                  {payError && (
                    <div className="text-red-600 text-sm px-6 pb-2">{payError}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Pagination */}
          {meta && meta.total_pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                className="btn btn-secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('previous')}
              </button>
              <span className="text-muted text-sm">
                {t('page')} {meta.current_page} {t('of')} {meta.total_pages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
                disabled={page === meta.total_pages}
              >
                {t('next')}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
} 