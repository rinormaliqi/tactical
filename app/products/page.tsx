'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';
import { type Product, type Category } from '@/lib/types';
import { useLang } from '@/lib/LanguageContext';

const ease = [0.16, 1, 0.3, 1];

export default function ProductsPage() {
  const { lang, tr } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('name_al');
  const [inStockOnly, setInStockOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    params.set('sort', sort);

    const res = await fetch(`/api/products?${params}`);
    const data: Product[] = await res.json();
    setProducts(inStockOnly ? data.filter(p => p.stock > 0) : data);
    setLoading(false);
  }, [category, search, sort, inStockOnly]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const sortOptions = [
    { value: 'name_al', label: tr('products_sort_az') },
    { value: 'price_asc', label: tr('products_sort_price_asc') },
    { value: 'price_desc', label: tr('products_sort_price_desc') },
    { value: 'newest', label: 'Të reja' },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16" style={{ backgroundColor: 'var(--color-bg)' }}>
        {/* Page header */}
        <div
          className="border-b"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
            >
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'var(--color-olive)', letterSpacing: '0.15em' }}
              >
                Mali Tactical Store
              </div>
              <h1
                className="font-display"
                style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', color: 'var(--color-text)' }}
              >
                {tr('products_title').toUpperCase()}
              </h1>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.1 }}
            className="flex flex-col gap-4 mb-8"
          >
            {/* Search + Sort row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <input
                  type="text"
                  placeholder={tr('products_search')}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--color-bg-elevated)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} style={{ color: 'var(--color-text-muted)' }} />
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="pl-3 pr-8 py-2.5 rounded-lg border text-sm outline-none transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-bg-elevated)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  {sortOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCategory('all')}
                className="px-4 py-2 rounded-full text-xs font-medium border transition-all duration-150"
                style={{
                  backgroundColor: category === 'all' ? 'var(--color-olive)' : 'var(--color-bg-elevated)',
                  borderColor: category === 'all' ? 'var(--color-olive)' : 'var(--color-border)',
                  color: category === 'all' ? 'white' : 'var(--color-text-muted)',
                }}
              >
                {tr('products_all')}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className="px-4 py-2 rounded-full text-xs font-medium border transition-all duration-150"
                  style={{
                    backgroundColor: category === cat.slug ? 'var(--color-olive)' : 'var(--color-bg-elevated)',
                    borderColor: category === cat.slug ? 'var(--color-olive)' : 'var(--color-border)',
                    color: category === cat.slug ? 'white' : 'var(--color-text-muted)',
                  }}
                >
                  {lang === 'al' ? cat.name_al : cat.name_en}
                </button>
              ))}

              {/* In stock toggle */}
              <button
                onClick={() => setInStockOnly(v => !v)}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all duration-150"
                style={{
                  backgroundColor: inStockOnly ? 'var(--color-olive-light)' : 'var(--color-bg-elevated)',
                  borderColor: inStockOnly ? 'var(--color-olive)' : 'var(--color-border)',
                  color: inStockOnly ? 'var(--color-olive-dark)' : 'var(--color-text-muted)',
                }}
              >
                <span
                  className="w-3 h-3 rounded-full border transition-colors"
                  style={{
                    backgroundColor: inStockOnly ? 'var(--color-olive)' : 'transparent',
                    borderColor: inStockOnly ? 'var(--color-olive)' : 'var(--color-border-strong)',
                  }}
                />
                {tr('products_in_stock')}
              </button>
            </div>
          </motion.div>

          {/* Result count */}
          {!loading && (
            <div className="mb-6 flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {products.length} {products.length === 1 ? 'produkt' : 'produkte'}
              </span>
              {(category !== 'all' || search || inStockOnly) && (
                <button
                  onClick={() => { setCategory('all'); setSearch(''); setInStockOnly(false); }}
                  className="text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors hover:bg-black/5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X size={11} />
                  Pastro filtrat
                </button>
              )}
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border overflow-hidden"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}
                >
                  <div className="img-shimmer" style={{ aspectRatio: '4/3' }} />
                  <div className="p-4 space-y-2.5">
                    <div className="img-shimmer h-3 rounded-full w-1/3" />
                    <div className="img-shimmer h-4 rounded-full w-2/3" />
                    <div className="img-shimmer h-4 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--color-border)' }}
              >
                <Search size={24} style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <p className="text-lg font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                {tr('products_no_results')}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Provoni të ndryshoni termin e kërkimit ose filtrat.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${category}-${sort}-${inStockOnly}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              >
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
