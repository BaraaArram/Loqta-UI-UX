import React from 'react';
import Link from 'next/link';
import { HeartIcon, StarIcon, TagIcon } from '@heroicons/react/24/solid';
import { useI18n } from '@/hooks/useI18n';

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    category?: string;
    category_detail?: { name: string };
    description?: string;
    price: number;
    thumbnail?: string;
    stock?: number;
    isNew?: boolean;
    tags?: string[];
  };
  locale?: string;
  onAddToCart?: (id: string) => void;
  onWishlist?: (id: string) => void;
  addingToCart?: boolean;
  inWishlist?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  locale = 'en',
  onAddToCart,
  onWishlist,
  addingToCart = false,
  inWishlist = false,
}) => {
  const isLowStock = typeof product.stock === 'number' && product.stock <= 5;
  const { t } = useI18n();
  return (
    <div className="relative bg-gradient-to-br from-white via-cardC/60 to-accentC/10 dark:from-cardC dark:via-bodyC/60 dark:to-accentC/10 rounded-2xl shadow-lg p-4 flex flex-col gap-3 border border-border/20 group transition-transform hover:scale-[1.03] hover:shadow-2xl duration-200">
      {/* Wishlist Icon */}
      <button
        className={`absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-cardC/80 shadow hover:bg-accentC/20 transition ${inWishlist ? 'text-accentC' : 'text-muted'}`}
        onClick={e => { e.stopPropagation(); e.preventDefault(); onWishlist && onWishlist(product.id); }}
        aria-label="Add to wishlist"
      >
        <HeartIcon className={`h-5 w-5 ${inWishlist ? 'fill-accentC' : 'fill-none stroke-2'}`} />
      </button>
      {/* Image */}
      <Link href={`/${locale}/product/${product.slug}`} className="block">
        <div className="relative w-full h-48 flex items-center justify-center bg-white rounded-xl overflow-hidden border border-border/20 group-hover:scale-105 transition">
          <img
            src={product.thumbnail || '/product.png'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">New</span>
          )}
          {isLowStock && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Low</span>
          )}
        </div>
      </Link>
      {/* Info */}
      <div className="flex-1 flex flex-col gap-1 mt-2">
        <Link href={`/${locale}/product/${product.slug}`} className="group-hover:text-accentC transition">
          <h3 className="text-lg font-bold text-heading line-clamp-2">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted">
          <TagIcon className="h-4 w-4" />
          <span>{product.category_detail?.name || product.category || ''}</span>
        </div>
        {product.description && (
          <p className="text-xs text-muted line-clamp-2 mt-1">{product.description}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-1">
          {product.tags && product.tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-accentC/10 text-accentC px-2 py-0.5 rounded-full text-xs font-semibold">{tag}</span>
          ))}
        </div>
      </div>
      {/* Price and Add to Cart */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-2xl font-extrabold text-accentC drop-shadow">${product.price}</span>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accentC text-white font-semibold shadow hover:bg-accentC/90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => onAddToCart && onAddToCart(product.id)}
          disabled={addingToCart}
        >
          <StarIcon className="h-5 w-5" />
          {addingToCart ? t('adding') : t('add_to_cart')}
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 