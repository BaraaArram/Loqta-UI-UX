// HomePage: Renders the main landing page for the selected locale, including hero, featured products, and theme-aware UI.
"use client";
import Header from '@/components/Header';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from '@/lib/axios';
import NoData from '@/components/NoData';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addToCart, setCart, addToCartLocal } from '@/features/cart/cartSlice';
import Swal from 'sweetalert2';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { XMarkIcon, FunnelIcon, TagIcon, CurrencyDollarIcon, CubeIcon, ArrowUpIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [prodError, setProdError] = useState('');
  const cart = useSelector((state: RootState) => state.cart.cart);
  const cartLoading = useSelector((state: RootState) => state.cart.loading);
  const dispatch = useAppDispatch();
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params?.locale || 'en';
  const isRTL = locale === 'ar';
  // Initialize state from URL on mount only
  const [search, setSearch] = useState(() => searchParams.get('name__icontains') || '');
  const [category, setCategory] = useState(() => searchParams.get('category__slug') || '');
  // Advanced filter state
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [stockMin, setStockMin] = useState('');
  const [stockMax, setStockMax] = useState('');
  const [tag, setTag] = useState('');
  const [ordering, setOrdering] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // For instant filtering debounce
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [showFilterModal, setShowFilterModal] = useState(false);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // No useEffect syncing state from URL after mount!

  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      setCatError('');
      try {
        const res = await axios.get('/api/v1/categories/');
        setCategories(res.data?.data || []);
      } catch (err: any) {
        setCatError('Failed to load categories');
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setProdLoading(true);
      setProdError('');
      try {
        const params = new URLSearchParams();
        if (search) params.set('name__icontains', search);
        if (category) params.set('category__slug', category);
        if (priceMin) params.set('price__gt', priceMin);
        if (priceMax) params.set('price__lt', priceMax);
        if (stockMin) params.set('stock__gt', stockMin);
        if (stockMax) params.set('stock__lt', stockMax);
        if (tag) params.set('tag', tag);
        if (ordering) params.set('ordering', ordering);
        const url = `/api/v1/products/${params.toString() ? '?' + params.toString() : ''}`;
        console.log('Fetching products from:', url);
        const res = await axios.get(url);
        console.log('Products API response:', res.data);
        let products = [];
        if (Array.isArray(res.data?.data)) {
          products = res.data.data;
        } else if (Array.isArray(res.data?.results)) {
          products = res.data.results;
        } else if (Array.isArray(res.data)) {
          products = res.data;
        }
        setProducts(products);
      } catch (err: any) {
        setProdError('Failed to load products.');
        setProducts([]);
      } finally {
        setProdLoading(false);
      }
    };
    fetchProducts();
  }, [search, category, priceMin, priceMax, stockMin, stockMax, tag, ordering]);

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      // Load cart from localStorage on mount for guests
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      dispatch(setCart(localCart));
    }
    // Optionally, clear local cart on login
  }, [isAuthenticated, dispatch]);

  // Debounced instant filtering for text/tag
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setSearch(search);
      setTag(tag);
    }, 300);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
    // eslint-disable-next-line
  }, [search, tag]);

  const handleAddToCart = async (productId: string, productName: string) => {
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    
    try {
      if (isAuthenticated) {
        await dispatch(addToCart({ productId, quantity: 1 }));
      } else {
        // Find product details
        const product = products.find(p => p.product_id === productId || p.id === productId);
        if (!product) throw new Error('Product not found');
        const cartItem = {
          product_id: product.product_id || product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          thumbnail: product.thumbnail,
          category_detail: product.category_detail,
        };
        dispatch(addToCartLocal({ product: cartItem }));
        // Save to localStorage
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = localCart.find((i: any) => i.product_id === cartItem.product_id);
        if (existing) {
          existing.quantity += 1;
        } else {
          localCart.push(cartItem);
        }
        localStorage.setItem('cart', JSON.stringify(localCart));
      }
      
      // Show success alert
      Swal.fire({
        icon: 'success',
        title: t('action_success'),
        text: t('action_completed_successfully'),
        confirmButtonText: t('ok'),
        confirmButtonColor: '#3085d6',
      });
      
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      
      // Show error alert
      Swal.fire({
        title: 'Oops...',
        text: error.message || 'Failed to add item to cart. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444',
        background: '#fef2f2',
        color: '#991b1b'
      });
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  // No explicit search submit needed for instant filtering

  // Build chips for active filters
  const filterChips = [];
  if (category) filterChips.push({ label: categories.find(c => c.slug === category)?.name || category, onRemove: () => setCategory('') });
  if (search) filterChips.push({ label: `Search: ${search}`, onRemove: () => setSearch('') });
  if (priceMin) filterChips.push({ label: `Min $${priceMin}`, onRemove: () => setPriceMin('') });
  if (priceMax) filterChips.push({ label: `Max $${priceMax}`, onRemove: () => setPriceMax('') });
  if (stockMin) filterChips.push({ label: `Min Stock ${stockMin}`, onRemove: () => setStockMin('') });
  if (stockMax) filterChips.push({ label: `Max Stock ${stockMax}`, onRemove: () => setStockMax('') });
  if (tag) filterChips.push({ label: `Tag: ${tag}`, onRemove: () => setTag('') });
  if (ordering) filterChips.push({ label: `Order: ${ordering.replace('-', '')} ${ordering.startsWith('-') ? '↓' : '↑'}`, onRemove: () => setOrdering('') });

  return (
    <div className="min-h-screen bg-bodyC flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 pt-24 pb-12 flex flex-col gap-12">
        {/* Hero Section */}
        <section className="relative flex flex-col md:flex-row items-center justify-between min-h-[55vh] w-full rounded-2xl overflow-hidden shadow-lg mt-4 bg-gradient-to-br from-[#f0f4f8] via-[#e0e7ef] to-accentC/10 dark:from-[#232b3b] dark:via-[#181f2a] dark:to-accentC/10 p-8 md:p-12 mb-8 md:mb-12 gap-8 md:gap-16">
          {/* Subtle abstract background pattern (SVG or gradient, no image) */}
          <div className="absolute inset-0 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-10">
              <path fill="#0ea5e9" fillOpacity="0.12" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
            </svg>
          </div>
          <div className={`relative z-10 flex flex-1 flex-col items-center ${isRTL ? 'md:items-end' : 'md:items-start'} justify-center w-full max-w-2xl mx-auto px-6 py-20 gap-8 text-center ${isRTL ? 'md:text-right' : 'md:text-left'}`}>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-zinc-900 dark:text-white drop-shadow-lg" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>
              {t('hero_title')}
            </h1>
            <p className={`text-lg md:text-2xl text-zinc-700 dark:text-zinc-200 max-w-xl mx-auto md:mx-0 drop-shadow ${isRTL ? 'text-justify' : 'text-center md:text-left'}`}
              style={isRTL
                ? { textShadow: '0 1px 4px rgba(0,0,0,0.12)', direction: 'rtl' }
                : { textShadow: '0 1px 4px rgba(0,0,0,0.12)' }
              }>
              {t('hero_subtitle')}
            </p>
            <Link href="#featured" className="inline-block px-8 py-4 bg-accentC text-white rounded-xl font-bold shadow-md hover:bg-accentC/90 transition text-lg mt-2 focus:outline-none focus:ring-2 focus:ring-accentC">
              {t('shop_now')}
            </Link>
          </div>
          <div className="relative z-10 flex justify-center items-center w-full md:w-auto px-6 md:px-0 mt-8 md:mt-0">
            <Image 
              src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80"
              alt="E-commerce Hero"
              width={320}
              height={320}
              className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-3xl shadow-xl border-4 border-white dark:border-cardC bg-white/80"
            />
          </div>
        </section>

        {/* Filter Card (search, filters, category buttons) */}
        <section className="mb-8 sticky top-20 z-10 bg-bodyC/95 backdrop-blur-sm border-b border-border/20 pb-4">
          {/* Main Search and Filter Bar */}
          <div className="bg-card rounded-2xl shadow-lg p-4 md:p-6 border border-border/20">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Enhanced Search Input */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <input
                    id="search"
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('search_placeholder')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/30 bg-bg-secondary text-heading placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200 text-base outline-none shadow-sm"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-error transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
                {catLoading ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20">
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-muted">{t('loading_categories')}</span>
                  </div>
                ) : catError ? (
                  <span className="text-error text-sm px-3 py-2 bg-error/10 rounded-lg">{catError}</span>
                ) : categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2 items-center">
                    <button
                      className={`px-4 py-2 rounded-lg font-medium text-sm border transition-all duration-200 flex items-center gap-2 ${
                        !category 
                          ? 'bg-accent text-white border-accent shadow-md' 
                          : 'bg-bg-secondary text-heading border-border/30 hover:bg-accent/10 hover:border-accent/30'
                      }`}
                      onClick={() => setCategory('')}
                    >
                      <TagIcon className="h-4 w-4" />
                      {t('all_categories')}
                    </button>
                    {(showAllCategories ? categories : categories.slice(0, 5)).map(cat => (
                      <button
                        key={cat.slug}
                        className={`px-4 py-2 rounded-lg font-medium text-sm border transition-all duration-200 ${
                          category === cat.slug 
                            ? 'bg-accent text-white border-accent shadow-md' 
                            : 'bg-bg-secondary text-heading border-border/30 hover:bg-accent/10 hover:border-accent/30'
                        }`}
                        onClick={() => setCategory(cat.slug)}
                      >
                        {cat.name}
                      </button>
                    ))}
                    {categories.length > 5 && (
                      <button
                        className="px-3 py-2 rounded-lg font-medium text-sm border border-border/30 bg-bg-secondary text-heading hover:bg-accent/10 hover:border-accent/30 transition-all duration-200"
                        onClick={() => setShowAllCategories(v => !v)}
                      >
                        {showAllCategories
                          ? t('show_less')
                          : `+${categories.length - 5} ${t('more')}`}
                      </button>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Advanced Filters Toggle */}
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm shadow transition-all duration-200 ${
                  showAdvanced 
                    ? 'bg-accent text-white border-accent' 
                    : 'bg-bg-secondary text-heading border border-border/30 hover:bg-accent/10 hover:border-accent/30'
                }`}
                onClick={() => setShowAdvanced(v => !v)}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t('advanced_filters')}</span>
                <span className="sm:hidden">{t('filters')}</span>
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvanced && (
              <div className="mt-6 p-6 bg-accent/10 rounded-xl border border-border/20 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4">
                  {/* Price Range */}
                  <div className="space-y-2 min-w-0">
                    <label className="text-sm font-semibold text-heading flex items-center gap-2">
                      <CurrencyDollarIcon className="h-4 w-4" />
                      {t('price_range')}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={priceMin} 
                        onChange={e => setPriceMin(e.target.value)} 
                        placeholder={t('min')}
                        className="flex-1 min-w-0 w-full px-3 py-2 rounded-lg border border-border/30 bg-card text-heading focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200 text-sm outline-none" 
                      />
                      <input 
                        type="number" 
                        value={priceMax} 
                        onChange={e => setPriceMax(e.target.value)} 
                        placeholder={t('max')}
                        className="flex-1 min-w-0 w-full px-3 py-2 rounded-lg border border-border/30 bg-card text-heading focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200 text-sm outline-none" 
                      />
                    </div>
                  </div>

                  {/* Stock Range */}
                  <div className="space-y-2 min-w-0">
                    <label className="text-sm font-semibold text-heading flex items-center gap-2">
                      <CubeIcon className="h-4 w-4" />
                      {t('stock_range')}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={stockMin} 
                        onChange={e => setStockMin(e.target.value)} 
                        placeholder={t('min')}
                        className="flex-1 min-w-0 w-full px-3 py-2 rounded-lg border border-border/30 bg-card text-heading focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200 text-sm outline-none" 
                      />
                      <input 
                        type="number" 
                        value={stockMax} 
                        onChange={e => setStockMax(e.target.value)} 
                        placeholder={t('max')}
                        className="flex-1 min-w-0 w-full px-3 py-2 rounded-lg border border-border/30 bg-card text-heading focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200 text-sm outline-none" 
                      />
                    </div>
                  </div>

                  {/* Tag Filter */}
                  <div className="space-y-2 min-w-0">
                    <label className="text-sm font-semibold text-heading flex items-center gap-2">
                      <TagIcon className="h-4 w-4" />
                      {t('tag')}
                    </label>
                    <input 
                      type="text" 
                      value={tag} 
                      onChange={e => setTag(e.target.value)} 
                      placeholder={t('enter_tag')}
                      className="w-full min-w-0 px-3 py-2 rounded-lg border border-border/30 bg-card text-heading focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200 text-sm outline-none" 
                    />
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2 min-w-0">
                    <label className="text-sm font-semibold text-heading flex items-center gap-2">
                      <ArrowUpIcon className="h-4 w-4" />
                      {t('sort_by')}
                    </label>
                    <select 
                      value={ordering} 
                      onChange={e => setOrdering(e.target.value)} 
                      className="w-full min-w-0 px-3 py-2 rounded-lg border border-border/30 bg-card text-heading focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200 text-sm outline-none"
                    >
                      <option value="">{t('default_order')}</option>
                      <option value="price">{t('price_low_high')}</option>
                      <option value="-price">{t('price_high_low')}</option>
                      <option value="name">{t('name_a_z')}</option>
                      <option value="-name">{t('name_z_a')}</option>
                      <option value="-created_at">{t('newest_first')}</option>
                      <option value="created_at">{t('oldest_first')}</option>
                    </select>
                  </div>
                </div>

                {/* Clear All Filters Button */}
                {(search || category || priceMin || priceMax || stockMin || stockMax || tag || ordering) && (
                  <div className="flex justify-end mt-4 pt-4 border-t border-border/20">
                    <button
                      onClick={() => {
                        setSearch('');
                        setCategory('');
                        setPriceMin('');
                        setPriceMax('');
                        setStockMin('');
                        setStockMax('');
                        setTag('');
                        setOrdering('');
                      }}
                      className="px-5 py-2 rounded-lg bg-error/10 text-error font-medium text-sm hover:bg-error/20 transition-all duration-200 flex items-center gap-2 border border-error/30 shadow-sm"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      {t('clear_all_filters')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Active Filter Chips */}
            {filterChips.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-muted flex items-center gap-2">
                  <FunnelIcon className="h-4 w-4" />
                  {t('active_filters')}:
                </span>
                {filterChips.map((chip, idx) => (
                  <span key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent font-medium text-sm border border-accent/20 hover:bg-accent/20 transition-all duration-200 shadow-sm">
                    {chip.label}
                    <button 
                      onClick={chip.onRemove} 
                      className="ml-1 text-accent hover:text-error focus:outline-none p-0.5 rounded-full hover:bg-error/10 transition-colors border border-transparent hover:border-error"
                      aria-label={t('remove')}
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Product Grid */}
        <section id="featured" className="flex-1">
          <h2 className="text-2xl font-bold mb-6 text-heading">{t('featured_products')}</h2>
          {prodLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-accent animate-pulse text-lg">{t('loading_products')}</span>
            </div>
          ) : prodError ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-error text-lg">{prodError}</span>
            </div>
          ) : products.length === 0 ? (
            <NoData message={t('no_products_found')} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map(product => (
                <ProductCard
                  key={product.product_id || product.id}
                  product={{
                    id: product.product_id || product.id,
                    slug: product.slug,
                    name: product.name,
                    category_detail: product.category_detail,
                    description: product.description,
                    price: product.price,
                    thumbnail: product.thumbnail,
                    stock: product.stock,
                    tags: product.tags,
                  }}
                  locale={locale}
                  onAddToCart={() => handleAddToCart(product.product_id || product.id, product.name)}
                  addingToCart={addingToCart[product.product_id || product.id] || cartLoading}
                />
              ))}
            </div>
          )}
        </section>

        {/* Newsletter/Subscribe Section */}
        <section className="mt-16">
          <div className="bg-gradient-to-br from-accentC/10 via-accentC/5 to-accentC/20 rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-heading mb-2">{t('newsletter')}</h3>
              <p className="text-muted mb-4">{t('newsletter_description')}</p>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  setSubscribed(true);
                  setTimeout(() => setSubscribed(false), 3000);
                }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('enter_email')}
                  className="flex-1 px-4 py-3 rounded-lg border border-border/30 bg-card text-heading placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200 text-base outline-none"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-accent text-white font-semibold shadow hover:bg-accent/90 transition-all duration-200"
                  disabled={subscribed}
                >
                  {subscribed ? t('subscribing') : t('subscribe')}
                </button>
              </form>
              {subscribed && (
                <div className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  {t('subscribed_successfully')}
                </div>
              )}
            </div>
            <div className="flex-1 flex justify-center items-center">
              <Image 
                src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=320&q=80"
                alt="Newsletter Engagement"
                width={220}
                height={220}
                className="w-56 h-56 object-cover rounded-2xl shadow-xl border-4 border-white dark:border-cardC bg-white/80"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 