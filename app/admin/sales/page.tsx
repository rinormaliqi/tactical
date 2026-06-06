'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Minus, Trash2, Store, Check, X, Receipt, ScanBarcode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Product, type Order } from '@/lib/types';
import { useLang } from '@/lib/LanguageContext';

interface Line { product: Product; quantity: number; }

export default function SalesPage() {
  const { lang } = useLang();
  const t = (al: string, en: string) => (lang === 'al' ? al : en);

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [scan, setScan] = useState('');
  const [scanMsg, setScanMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [customer, setCustomer] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<Order | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);

  const loadProducts = () => fetch('/api/products').then(r => r.json()).then(setProducts);
  const loadRecent = () => fetch('/api/admin/sales').then(r => r.ok ? r.json() : []).then(setRecent);

  useEffect(() => { loadProducts(); loadRecent(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => !q
      || p.name_al.toLowerCase().includes(q)
      || p.name_en.toLowerCase().includes(q)
      || (p.barcode ?? '').toLowerCase().includes(q));
  }, [products, search]);

  // Barcode scan → exact server lookup → add to cart (scanners type the code + Enter)
  const handleScan = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const code = scan.trim();
    if (!code) return;
    const res = await fetch(`/api/products?barcode=${encodeURIComponent(code)}`);
    const found: Product[] = res.ok ? await res.json() : [];
    if (found.length > 0) {
      const p = found[0];
      if (p.stock === 0) {
        setScanMsg({ ok: false, text: `${lang === 'al' ? 'Jashtë stoku' : 'Out of stock'}: ${p.name_al}` });
      } else {
        add(p);
        setScanMsg({ ok: true, text: `${lang === 'al' ? 'U shtua' : 'Added'}: ${p.name_al}` });
      }
    } else {
      setScanMsg({ ok: false, text: `${lang === 'al' ? 'Barkodi nuk u gjet' : 'Barcode not found'}: ${code}` });
    }
    setScan('');
    setTimeout(() => setScanMsg(null), 2500);
  };

  const total = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const count = lines.reduce((s, l) => s + l.quantity, 0);

  const add = (p: Product) => {
    setLines(prev => {
      const ex = prev.find(l => l.product.id === p.id);
      if (ex) return prev.map(l => l.product.id === p.id ? { ...l, quantity: Math.min(l.quantity + 1, Math.max(p.stock, 1)) } : l);
      return [...prev, { product: p, quantity: 1 }];
    });
  };
  const setQty = (id: number, q: number) =>
    setLines(prev => q <= 0 ? prev.filter(l => l.product.id !== id) : prev.map(l => l.product.id === id ? { ...l, quantity: q } : l));

  const submit = async () => {
    if (!lines.length) return;
    setSaving(true);
    const res = await fetch('/api/admin/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: customer,
        notes: note,
        items: lines.map(l => ({
          product_id: l.product.id,
          product_name: lang === 'al' ? l.product.name_al : l.product.name_en,
          product_slug: l.product.slug,
          quantity: l.quantity,
          price: l.product.price,
        })),
      }),
    });
    setSaving(false);
    if (res.ok) {
      const order = await res.json();
      setDone(order);
      setLines([]); setCustomer(''); setNote('');
      loadProducts(); loadRecent();
      setTimeout(() => setDone(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-olive-light)' }}>
          <Store size={18} style={{ color: 'var(--color-olive)' }} />
        </div>
        <div>
          <h1 className="font-display text-3xl" style={{ color: 'var(--color-text)' }}>{t('SHITJE NË DYQAN', 'IN-STORE SALES')}</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('Regjistro shitjet me para në dorë në dyqan', 'Record cash sales made in the store')}</p>
        </div>
      </div>

      {/* success toast */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 border"
            style={{ backgroundColor: 'var(--color-delivered-bg)', borderColor: 'rgba(21,128,61,0.25)', borderRadius: 'var(--radius-md)' }}
          >
            <Check size={18} style={{ color: 'var(--color-delivered)' }} strokeWidth={2.5} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-delivered)' }}>
              {t('Shitja u regjistrua', 'Sale recorded')} · {done.order_number} · €{done.total.toFixed(2)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Product picker */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barcode scanner */}
          <div>
            <div className="relative">
              <ScanBarcode size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-olive)' }} />
              <input
                value={scan}
                onChange={e => setScan(e.target.value)}
                onKeyDown={handleScan}
                placeholder={t('Skano ose shkruaj barkodin, pastaj Enter...', 'Scan or type barcode, then Enter...')}
                className="w-full pl-11 pr-4 py-3 border-2 text-sm outline-none font-mono"
                style={{ backgroundColor: 'var(--color-olive-light)', borderColor: 'var(--color-olive)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            {scanMsg && (
              <p className="flex items-center gap-1.5 text-xs mt-2" style={{ color: scanMsg.ok ? 'var(--color-delivered)' : 'var(--color-sale)' }}>
                {scanMsg.ok ? <Check size={12} /> : <X size={12} />}
                {scanMsg.text}
              </p>
            )}
          </div>

          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('Kërko sipas emrit ose barkodit...', 'Search by name or barcode...')}
              className="w-full pl-10 pr-4 py-2.5 border text-sm outline-none"
              style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          <div className="border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <div className="max-h-[460px] overflow-auto divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {filtered.map(p => (
                <button
                  key={p.id} onClick={() => add(p)} disabled={p.stock === 0}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.02] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{lang === 'al' ? p.name_al : p.name_en}</div>
                    <div className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                      <span>
                        {p.category_name_al ? (lang === 'al' ? p.category_name_al : p.category_name_en) + ' · ' : ''}
                        {t('Stoku', 'Stock')}: {p.stock}
                      </span>
                      {p.barcode && <span className="font-mono px-1 rounded" style={{ backgroundColor: 'var(--color-bg-soft)' }}>{p.barcode}</span>}
                    </div>
                  </div>
                  <span className="font-heading text-base font-700 shrink-0" style={{ fontWeight: 700, color: 'var(--color-text)' }}>€{p.price.toFixed(2)}</span>
                  <span className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-olive-light)', color: 'var(--color-olive)' }}>
                    <Plus size={14} />
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('Nuk u gjet asnjë produkt.', 'No products found.')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Cart / checkout */}
        <div className="border p-5 h-fit sticky top-6" style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Receipt size={16} style={{ color: 'var(--color-olive)' }} />
            <h2 className="font-heading text-sm font-700 uppercase tracking-widest" style={{ fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-text)' }}>
              {t('Shitja Aktuale', 'Current Sale')}
            </h2>
          </div>

          {lines.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>{t('Shtoni produkte nga lista.', 'Add products from the list.')}</p>
          ) : (
            <div className="space-y-2.5 mb-4 max-h-64 overflow-auto">
              {lines.map(l => (
                <div key={l.product.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{lang === 'al' ? l.product.name_al : l.product.name_en}</div>
                    <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>€{l.product.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center border" style={{ borderColor: 'var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                    <button onClick={() => setQty(l.product.id, l.quantity - 1)} className="w-6 h-6 flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}><Minus size={11} /></button>
                    <span className="w-7 text-center text-xs font-medium" style={{ color: 'var(--color-text)' }}>{l.quantity}</span>
                    <button onClick={() => setQty(l.product.id, l.quantity + 1)} className="w-6 h-6 flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}><Plus size={11} /></button>
                  </div>
                  <span className="text-xs font-semibold w-14 text-right" style={{ color: 'var(--color-text)' }}>€{(l.product.price * l.quantity).toFixed(2)}</span>
                  <button onClick={() => setQty(l.product.id, 0)} style={{ color: 'var(--color-text-muted)' }}><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          )}

          {/* customer + note */}
          <input
            value={customer} onChange={e => setCustomer(e.target.value)}
            placeholder={t('Emri i klientit (opsionale)', 'Customer name (optional)')}
            className="w-full px-3 py-2 border text-sm outline-none mb-2"
            style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}
          />
          <input
            value={note} onChange={e => setNote(e.target.value)}
            placeholder={t('Shënim (opsionale)', 'Note (optional)')}
            className="w-full px-3 py-2 border text-sm outline-none mb-4"
            style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}
          />

          <div className="flex justify-between items-center py-3 border-t border-b mb-4" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{count} {t('artikuj', 'items')}</span>
            <span className="font-display text-2xl" style={{ color: 'var(--color-text)' }}>€{total.toFixed(2)}</span>
          </div>

          <button
            onClick={submit} disabled={saving || lines.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-olive)', borderRadius: 'var(--radius-sm)', letterSpacing: '0.06em' }}
          >
            <Check size={15} strokeWidth={2.5} />
            {saving ? t('Duke ruajtur...', 'Saving...') : t('Regjistro Shitjen', 'Record Sale')}
          </button>
        </div>
      </div>

      {/* Recent in-store sales */}
      <div className="border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-heading text-sm font-700 uppercase tracking-widest" style={{ fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-text)' }}>
            {t('Shitjet e Fundit në Dyqan', 'Recent In-Store Sales')}
          </h2>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('Ende nuk ka shitje në dyqan.', 'No in-store sales yet.')}</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {recent.map(s => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-3">
                <span className="font-heading text-sm font-700" style={{ fontWeight: 700, color: 'var(--color-text)' }}>{s.order_number}</span>
                <span className="text-sm flex-1 truncate" style={{ color: 'var(--color-text-muted)' }}>{s.customer_name}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{new Date(s.created_at).toLocaleString('sq-AL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span className="font-heading text-sm font-700 w-20 text-right" style={{ fontWeight: 700, color: 'var(--color-text)' }}>€{s.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
