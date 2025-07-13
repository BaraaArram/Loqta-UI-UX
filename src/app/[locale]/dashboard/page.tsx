// DashboardPage: Displays user dashboard with stats, quick links, and recent activity for the selected locale.
"use client";

import React, { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/features/auth/authSlice';
import { useStaffCheck } from '@/hooks/useStaffCheck';
import { UserCircleIcon, PlusIcon, ChartBarIcon, ShoppingBagIcon, UsersIcon, CubeIcon, BellIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import NoData from '@/components/NoData';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface Product {
  id: number;
  name: string;
  price: string;
  stock: number;
  slug: string;
}

const mockStats = [
  { label: 'total_sales', value: '$12,340', icon: <ChartBarIcon className="h-6 w-6 text-accentC" /> },
  { label: 'orders', value: '1,234', icon: <ShoppingBagIcon className="h-6 w-6 text-accentC" /> },
  { label: 'customers', value: '567', icon: <UsersIcon className="h-6 w-6 text-accentC" /> },
  { label: 'products', value: '89', icon: <CubeIcon className="h-6 w-6 text-accentC" /> },
];

const DashboardPage = () => {
  const { t } = useTranslation('common');
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const logoutFn = () => dispatch(logout() as any);
  const user = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.loading);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const hydrated = useSelector((state: RootState) => state.auth.hydrated);
  const dispatch = useDispatch();
  const router = useRouter();
  const { isStaff, isStaffLoading } = useStaffCheck();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [categorySuccess, setCategorySuccess] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      setError(null);
      try {
        const res = await api.get("/api/v1/products/");
        let data: Product[] = [];
        if (Array.isArray(res.data?.data)) {
          data = res.data.data;
        } else if (Array.isArray(res.data?.results)) {
          data = res.data.results;
        }
        setProducts(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);



  // Close modal on outside click or Escape
  useEffect(() => {
    if (!showCategoryModal) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowCategoryModal(false);
    }
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowCategoryModal(false);
      }
    }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [showCategoryModal]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bodyC">
        <div className="text-accentC text-xl font-bold animate-pulse">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bodyC pt-24">
      <Header />
      {isStaff === true && (
        <div className="max-w-7xl mx-auto mt-4 mb-6 flex flex-col items-center">
          <div className="flex items-center justify-center mb-2">
            <span className="bg-yellow-200 text-yellow-900 font-bold px-4 py-2 rounded-full shadow border border-yellow-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
              {t('staff_member')}
            </span>
          </div>
          <button
            className="px-5 py-2 bg-accentC text-cardC rounded-lg font-bold hover:bg-accentC/90 transition text-base shadow mt-2"
            onClick={() => setShowCategoryModal(true)}
          >
            + {t('add_category')}
          </button>
        </div>
      )}
      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-cardC rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-heading mb-4">{t('add_category')}</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setCategoryLoading(true);
                setCategoryError("");
                setCategorySuccess("");
                try {
                  const res = await api.post("/api/v1/categories/", { name: categoryName });
                  setCategorySuccess("Category added successfully!");
                  setCategoryName("");
                } catch (err: any) {
                  setCategoryError(err?.response?.data?.message || "Failed to add category.");
                } finally {
                  setCategoryLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-heading mb-1">{t('category_name')}</label>
                <input
                  type="text"
                  value={categoryName || ""}
                  onChange={e => setCategoryName(e.target.value)}
                  placeholder={t('category_name')}
                  className="w-full p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC"
                  required
                  autoFocus
                />
              </div>
              {categoryError && <div className="text-red-600 font-semibold text-sm">{categoryError}</div>}
              {categorySuccess && <div className="text-green-600 font-semibold text-sm">{categorySuccess}</div>}
              <button
                type="submit"
                className="px-5 py-2 bg-accentC text-cardC rounded-lg font-bold hover:bg-accentC/90 transition text-base shadow disabled:opacity-60"
                disabled={categoryLoading}
              >
                {categoryLoading ? t('adding') : t('add_category')}
              </button>
            </form>
          </div>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex justify-end mb-4">
          <Link href="/product/user-products" className="px-5 py-2 bg-accentC text-cardC rounded-lg font-bold hover:bg-accentC/90 transition text-base shadow">
            {t('my_products')}
          </Link>
        </div>
        {/* Overview/Analytics */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {mockStats.map((stat, i) => (
            <div key={i} className="bg-cardC rounded-xl shadow p-4 flex flex-col items-center justify-center">
              <div className="mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-heading">{stat.value}</div>
              <div className="text-muted text-sm">{t(stat.label)}</div>
            </div>
          ))}
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications */}
          <section className="bg-cardC rounded-xl shadow p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <BellIcon className="h-5 w-5 text-accentC" />
              <h2 className="text-lg font-bold text-heading">{t('notifications')}</h2>
            </div>
            <ul className="space-y-2">
              {products.length === 0 ? (
                <NoData message={t('no_notifications_found')} />
              ) : (
                products.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-text">
                    <span className="w-2 h-2 rounded-full bg-accentC inline-block"></span>
                    <span>{t('running_low_on_stock', { product: p.name })}</span>
                    <span className="ml-auto text-muted text-xs">{t('days_ago', { count: 2 })}</span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Products */}
          <section className="bg-cardC rounded-xl shadow p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-heading">{t('top_products')}</h2>
            </div>
            <div className="flex flex-col gap-4">
              {productsLoading ? (
                <div className="text-center text-muted py-8">{t('loading')}</div>
              ) : error ? (
                <NoData message={error} />
              ) : products.length === 0 ? (
                <NoData message={t('no_products_found')} action={<Link href="/product" className="text-accentC hover:underline">{t('add_first_product')}</Link>} />
              ) : (
                products.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-cardC/80 rounded-lg p-3 shadow-sm">
                    <img src={(item as any).image || '/product.png'} alt={item.name} className="h-14 w-14 object-cover rounded-lg border border-muted" />
                    <div className="flex-1">
                      <div className="font-bold text-heading">{item.name}</div>
                      <div className="text-accentC font-semibold">{item.price}</div>
                      <div className="text-muted text-xs">{t('stock')}: {item.stock}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
          {/* Inventory/Stock */}
          <section className="bg-cardC rounded-xl shadow p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-heading">{t('inventory')}</h2>
              <button className="px-3 py-1 bg-accentC text-cardC rounded-full font-bold flex items-center gap-1 text-sm hover:bg-accentC/80 transition"><CubeIcon className="h-4 w-4" />{t('manage')}</button>
            </div>
            <ul className="flex flex-col gap-2">
              {productsLoading ? (
                <div className="text-center text-muted py-8">{t('loading')}</div>
              ) : error ? (
                <NoData message={error} />
              ) : products.length === 0 ? (
                <NoData message={t('no_inventory_found')} action={<Link href="/product" className="text-accentC hover:underline">{t('add_first_product')}</Link>} />
              ) : (
                products.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="font-bold text-heading">{item.name}</span>
                    <span className="text-muted text-xs">{t('stock')}: {item.stock}</span>
                    {item.stock < 10 && <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">{t('low')}</span>}
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </main>
      <a
        href="/product"
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-4 bg-accentC text-cardC rounded-full shadow-2xl hover:bg-accentC/90 transition text-lg font-bold group focus:outline-none focus:ring-4 focus:ring-accentC/30"
        title={t('add_product')}
      >
        <PlusIcon className="h-7 w-7" />
        <span className="hidden md:inline">{t('add_product')}</span>
      </a>
      <Link href="/dashboard/categories">
        <button className="btn btn-primary flex items-center gap-2 mt-4">
          <span>{t('categories')}</span>
        </button>
      </Link>
    </div>
  );
};

export default DashboardPage; 