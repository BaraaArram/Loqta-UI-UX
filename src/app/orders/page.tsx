"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import Header from "@/components/Header";
import NoData from "@/components/NoData";
import { TrashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

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

  const fetchOrders = async (pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/v1/orders/?page=${pageNum}`);
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
      title: 'Delete Order',
      text: 'Are you sure you want to delete this order? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
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
        title: 'Deleted!',
        text: 'Order deleted successfully.',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: '#10b981',
        color: '#ffffff'
      });
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete order.';
      setDeleteError(errorMessage);
      
      // Show error alert
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    }
    setDeleteLoading(false);
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
          <h1 className="text-3xl font-extrabold text-heading mb-8">My Orders</h1>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <svg className="animate-spin h-8 w-8 text-accentC" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            </div>
          ) : error ? (
            <NoData message={error} />
          ) : orders.length === 0 ? (
            <NoData message="No orders found." />
          ) : (
            <div className="flex flex-col gap-6">
              {orders.map((order) => (
                <div key={order.order_id} className="bg-cardC rounded-xl shadow p-6 border border-muted/10">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                    <div className="font-bold text-lg text-heading">Order #{order.order_id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-sm text-muted">Placed on {new Date(order.order_date).toLocaleString()}</div>
                    <div className="text-sm font-semibold text-accentC">Status: {order.status}</div>
                    <button
                      className="p-2 rounded-full hover:bg-red-100 text-red-600 transition ml-auto"
                      title="Delete Order"
                      onClick={() => handleDeleteOrder(order.order_id)}
                      disabled={deleteLoading}
                    >
                      <TrashIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-4">
                    {order.order_items.map((item, idx) => (
                      <div key={item.product.product_id + idx} className="flex items-center gap-4 bg-white dark:bg-zinc-900 rounded-lg p-4 border border-muted/10">
                        <img src={item.product.thumbnail} alt={item.product.name} className="h-16 w-16 rounded-lg object-cover border" />
                        <div className="flex-1">
                          <div className="font-semibold text-heading">{item.product.name}</div>
                          <div className="text-muted text-sm">Category: {item.product.category_detail.name}</div>
                          <div className="text-muted text-sm">Quantity: {item.quantity}</div>
                        </div>
                        <div className="text-lg font-bold text-accentC">${item.price}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-4">
                    <div className="text-muted text-sm">Coupon: {order.coupon || 'None'}</div>
                    <div className="text-muted text-sm">Discount: ${order.discount}</div>
                    <div className="text-lg font-bold text-heading">Total: ${order.total_price}</div>
                  </div>
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
                Previous
              </button>
              <span className="text-muted text-sm">
                Page {meta.current_page} of {meta.total_pages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
                disabled={page === meta.total_pages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
} 