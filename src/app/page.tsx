"use client";
import Header from '@/components/Header';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import axios from '../lib/axios';
import NoData from '@/components/NoData';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { addToCart } from '@/features/cart/cartSlice';
import Swal from 'sweetalert2';
import { useRouter, useSearchParams } from 'next/navigation';
import { XMarkIcon, FunnelIcon, TagIcon, CurrencyDollarIcon, CubeIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
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
  const dispatch = useDispatch();
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const searchParams = useSearchParams();
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

  // For instant filtering debounce
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [showFilterModal, setShowFilterModal] = useState(false);

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
      dispatch(addToCart({ productId, quantity: 1 }));
      
      // Show success alert
      Swal.fire({
        title: 'Added to Cart!',
        text: `${productName} has been added to your cart successfully.`,
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: '#10b981',
        color: '#ffffff',
        customClass: {
          popup: 'rounded-lg shadow-lg'
        }
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
        <section className="relative flex flex-col md:flex-row items-center justify-between min-h-[55vh] w-full rounded-2xl overflow-hidden shadow-lg mt-4 bg-gradient-to-br from-[#f0f4f8] via-[#e0e7ef] to-accentC/10 dark:from-[#232b3b] dark:via-[#181f2a] dark:to-accentC/10">
          {/* Subtle abstract background pattern (SVG or gradient, no image) */}
          <div className="absolute inset-0 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-10">
              <path fill="#0ea5e9" fillOpacity="0.12" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
            </svg>
          </div>
          <div className="relative z-10 flex flex-1 flex-col items-center md:items-start justify-center w-full max-w-2xl mx-auto px-6 py-20 gap-8 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-zinc-900 dark:text-white drop-shadow-lg" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>
              Discover <span className="text-accentC">Your Favorites</span>
            </h1>
            <p className="text-lg md:text-2xl text-zinc-700 dark:text-zinc-200 max-w-xl mx-auto md:mx-0 drop-shadow" style={{textShadow: '0 1px 4px rgba(0,0,0,0.12)'}}>
              Shop trending products, exclusive offers, and enjoy a seamless shopping experience with Loqta.
            </p>
            <Link href="#featured" className="inline-block px-8 py-4 bg-accentC text-white rounded-xl font-bold shadow-md hover:bg-accentC/90 transition text-lg mt-2 focus:outline-none focus:ring-2 focus:ring-accentC">
              Shop Now
            </Link>
          </div>
          <div className="relative z-10 flex-1 flex justify-center items-center w-full md:w-auto px-6 md:px-0 mt-8 md:mt-0">
            <img src="/slide1.webp" alt="Featured" className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-3xl shadow-xl border-4 border-white dark:border-cardC bg-white/80" />
          </div>
        </section>

        {/* Filter Card (search, filters, category buttons) */}
        <section className="mb-8">
          <div className="bg-cardC rounded-xl shadow p-4 flex flex-col gap-4 w-full max-w-4xl mx-auto">
            {/* Search Bar Row */}
            <div className="flex w-full mb-2">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="flex-1 p-3 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC focus:border-accentC transition shadow-sm"
                aria-label="Search products"
                autoComplete="off"
              />
            </div>
            {/* Filters Row */}
            <div className="flex flex-wrap gap-2 md:gap-4 w-full">
              <input
                type="number"
                min="0"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                placeholder="Min Price"
                className="w-28 p-2 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC focus:border-accentC text-sm transition shadow-sm"
                aria-label="Min price"
                title="Minimum price"
              />
              <input
                type="number"
                min="0"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                placeholder="Max Price"
                className="w-28 p-2 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC focus:border-accentC text-sm transition shadow-sm"
                aria-label="Max price"
                title="Maximum price"
              />
              <input
                type="number"
                min="0"
                value={stockMin}
                onChange={e => setStockMin(e.target.value)}
                placeholder="Min Stock"
                className="w-28 p-2 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC focus:border-accentC text-sm transition shadow-sm"
                aria-label="Min stock"
                title="Minimum stock"
              />
              <input
                type="number"
                min="0"
                value={stockMax}
                onChange={e => setStockMax(e.target.value)}
                placeholder="Max Stock"
                className="w-28 p-2 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC focus:border-accentC text-sm transition shadow-sm"
                aria-label="Max stock"
                title="Maximum stock"
              />
              <input
                type="text"
                value={tag}
                onChange={e => setTag(e.target.value)}
                placeholder="Tag"
                className="w-32 p-2 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC focus:border-accentC text-sm transition shadow-sm"
                aria-label="Tag"
                title="Product tag"
              />
              <select
                value={ordering}
                onChange={e => setOrdering(e.target.value)}
                className="w-40 p-2 border border-muted rounded-lg bg-bodyC text-heading focus:ring-2 focus:ring-accentC focus:border-accentC text-sm transition shadow-sm"
                aria-label="Order by"
                title="Order by"
              >
                <option value="">Order By</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
                <option value="-name">Name: Z-A</option>
                <option value="stock">Stock: Low to High</option>
                <option value="-stock">Stock: High to Low</option>
              </select>
            </div>
            {/* Horizontally Scrollable Category Buttons */}
            <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-accentC/30 scrollbar-track-transparent py-2 -mx-2 px-2 items-center">
              {category && (
                <button
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-muted bg-transparent text-muted hover:bg-red-100 hover:text-red-500 focus:bg-red-100 focus:text-red-500 transition focus:outline-none focus:ring-2 focus:ring-accentC/50"
                  onClick={() => setCategory('')}
                  type="button"
                  aria-label="Clear category filter"
                  title="Clear category filter"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
              {categories.map((cat: any) => (
                <button
                  key={cat.slug}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold border shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accentC/50 text-accentC border-accentC/20 bg-accentC/10 hover:bg-accentC/20 focus:bg-accentC/20 ${category === cat.slug ? 'bg-accentC text-cardC border-accentC shadow scale-105' : ''}`}
                  onClick={() => setCategory(cat.slug)}
                  type="button"
                  aria-label={`Filter by category ${cat.name}`}
                  title={cat.name}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products (now all products) */}
        <section id="featured">
          <h2 className="text-2xl font-bold text-heading mb-6 flex items-center gap-2"><img src="/star.png" className="h-7 w-7" alt="Featured" />Products</h2>
          {prodLoading ? (
            <div>Loading products...</div>
          ) : prodError ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg p-8 flex flex-col items-center w-full max-w-md" aria-live="polite">
                <div className="text-2xl font-extrabold text-red-600 mb-2">Oops! We couldn’t load products</div>
                <div className="text-muted mb-4 text-center">This could be a network issue or a temporary glitch. Please try again, or clear your filters and try once more.</div>
                <div className="flex gap-2">
                  <button
                    className="px-6 py-2 bg-accentC text-cardC rounded-lg font-bold shadow hover:bg-accentC/90 transition focus:outline-none focus:ring-2 focus:ring-accentC"
                    onClick={() => {
                      // Re-fetch products without reload
                      setProdError('');
                      setProdLoading(true);
                      const fetchProducts = async () => {
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
                          const res = await axios.get(url);
                          let products = [];
                          if (Array.isArray(res.data?.data)) {
                            products = res.data.data;
                          } else if (Array.isArray(res.data?.results)) {
                            products = res.data.results;
                          } else if (Array.isArray(res.data)) {
                            products = res.data;
                          }
                          setProducts(products);
                          setProdError('');
                        } catch (err: any) {
                          setProdError('Failed to load products.');
                          setProducts([]);
                        } finally {
                          setProdLoading(false);
                        }
                      };
                      fetchProducts();
                    }}
                  >
                    Try Again
                  </button>
                  <button
                    className="px-6 py-2 bg-muted text-cardC rounded-lg font-bold shadow hover:bg-muted/80 transition focus:outline-none focus:ring-2 focus:ring-accentC"
                    onClick={() => { setSearch(''); setCategory(''); setPriceMin(''); setPriceMax(''); setStockMin(''); setStockMax(''); setTag(''); setOrdering(''); router.replace('/', { scroll: false }); }}
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <img src="/no-data.svg" alt="No products" className="w-32 h-32 mb-4 opacity-70" />
              <div className="text-2xl font-bold text-muted mb-2">No products found</div>
              <div className="text-muted mb-4">Try clearing your filters or searching for something else.</div>
              <button
                className="px-6 py-2 bg-accentC text-cardC rounded-lg font-bold shadow hover:bg-accentC/90 transition"
                onClick={() => { setSearch(''); setCategory(''); setPriceMin(''); setPriceMax(''); setStockMin(''); setStockMax(''); setTag(''); setOrdering(''); router.replace('/', { scroll: false }); }}
              >
                Clear All Filters
              </button>
                </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {products.map(prod => (
                <div key={prod.product_id || prod.id} className="bg-cardC rounded-xl shadow p-4 flex flex-col items-center hover:shadow-lg transition group">
                  <Link href={`/product/${prod.slug || prod.id}`} className="flex flex-col items-center w-full">
                    <img src={prod.thumbnail || '/product.png'} alt={prod.name} className="h-32 w-32 object-cover rounded mb-2 group-hover:scale-105 transition" />
                    <div className="font-bold text-heading text-lg mb-1 text-center">{prod.name}</div>
                    <div className="text-accentC font-semibold mb-2">${prod.price}</div>
                    <div className="text-muted text-sm mb-3 text-center">Category: {prod.category_detail?.name || prod.category_name}</div>
                  </Link>
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Link 
                      href={`/product/${prod.slug || prod.id}`} 
                      className="flex-1 px-3 py-2 bg-accentC text-cardC rounded-lg font-semibold shadow hover:bg-accentC/90 transition text-center text-sm"
                    >
                      View Details
                    </Link>
                    <button 
                      onClick={() => handleAddToCart((prod.product_id || prod.id).toString(), prod.name)}
                      disabled={addingToCart[prod.product_id || prod.id] || cartLoading}
                      className={`flex-1 px-3 py-2 rounded-lg font-semibold shadow transition text-sm flex items-center justify-center gap-2 ${
                        addingToCart[prod.product_id || prod.id] 
                          ? 'bg-blue-500 text-white cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {addingToCart[prod.product_id || prod.id] ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Promotions/Deals */}
        <section className="bg-accentC/10 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-accentC mb-2">Summer Sale!</h3>
            <p className="text-muted mb-2">Up to 50% off on select items. Limited time only.</p>
            <Link href="#featured" className="inline-block px-4 py-2 bg-accentC text-cardC rounded-lg font-bold shadow hover:bg-accentC/80 transition">Shop Deals</Link>
          </div>
          <img src="/product.png" alt="Deal" className="w-24 h-24 object-contain" />
        </section>

        {/* Trust Signals */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2 bg-cardC rounded-xl p-4 shadow">
            <img src="/visa.png" className="h-8 w-8 mx-auto" alt="Secure Payment" />
            <span className="font-bold text-heading">Secure Payment</span>
            <span className="text-muted text-sm">100% secure payment with SSL</span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-cardC rounded-xl p-4 shadow">
            <img src="/cart.png" className="h-8 w-8 mx-auto" alt="Fast Delivery" />
            <span className="font-bold text-heading">Fast Delivery</span>
            <span className="text-muted text-sm">Quick & reliable shipping</span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-cardC rounded-xl p-4 shadow">
            <img src="/notification.png" className="h-8 w-8 mx-auto" alt="Support" />
            <span className="font-bold text-heading">24/7 Support</span>
            <span className="text-muted text-sm">We're here to help anytime</span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-cardC rounded-xl p-4 shadow">
            <img src="/star.png" className="h-8 w-8 mx-auto" alt="Quality" />
            <span className="font-bold text-heading">Top Quality</span>
            <span className="text-muted text-sm">Best products guaranteed</span>
          </div>
        </section>
      </main>
      <style jsx global>{`
        .neon-glow {
          text-shadow: 0 0 8px #0ea5e9, 0 0 16px #0ea5e9, 0 0 32px #0ea5e9;
          box-shadow: 0 0 16px #0ea5e9, 0 0 32px #0ea5e9;
        }
        .neon-glow-img {
          box-shadow: 0 0 32px #0ea5e9, 0 0 64px #0ea5e9;
        }
      `}</style>
    </div>
  );
} 