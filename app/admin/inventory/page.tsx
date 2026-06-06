'use client';

import { useEffect, useState } from 'react';
import { Check, X, AlertTriangle, PackageX } from 'lucide-react';
import { type Product } from '@/lib/types';
import { useLang } from '@/lib/LanguageContext';

export default function InventoryPage() {
  const { tr } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ id: number; value: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await fetch('/api/products?sort=stock').then(r => r.json());
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveStock = async () => {
    if (!editing) return;
    setSaving(true);
    await fetch(`/api/admin/products/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: parseInt(editing.value) || 0 }),
    });
    await load();
    setSaving(false);
    setEditing(null);
  };

  const lowStock = products.filter(p => p.stock > 0 && p.stock < 10);
  const outOfStock = products.filter(p => p.stock === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-800" style={{ fontWeight: 800, color: 'var(--color-text)' }}>
          {tr('inventory_title').toUpperCase()}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {tr('inventory_subtitle')}
        </p>
      </div>

      {/* Alert cards */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {outOfStock.length > 0 && (
            <div
              className="flex items-center gap-4 p-4 rounded-xl border"
              style={{ backgroundColor: 'var(--color-cancelled-bg)', borderColor: 'rgba(185,28,28,0.2)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-cancelled-bg)', border: '1px solid rgba(185,28,28,0.3)' }}
              >
                <PackageX size={18} style={{ color: 'var(--color-cancelled)' }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--color-cancelled)' }}>
                  {outOfStock.length} {tr('inventory_out_of_stock')}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-cancelled)', opacity: 0.7 }}>
                  {outOfStock.map(p => p.name_al).join(', ')}
                </div>
              </div>
            </div>
          )}
          {lowStock.length > 0 && (
            <div
              className="flex items-center gap-4 p-4 rounded-xl border"
              style={{ backgroundColor: 'var(--color-pending-bg)', borderColor: 'rgba(180,83,9,0.2)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-pending-bg)', border: '1px solid rgba(180,83,9,0.3)' }}
              >
                <AlertTriangle size={18} style={{ color: 'var(--color-pending)' }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--color-pending)' }}>
                  {lowStock.length} {tr('inventory_low_stock_alert')}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-pending)', opacity: 0.7 }}>
                  {lowStock.map(p => `${p.name_al} (${p.stock})`).join(', ')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}
      >
        <div
          className="grid grid-cols-12 gap-2 px-5 py-3 border-b text-[10px] font-semibold uppercase tracking-widest"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', letterSpacing: '0.12em', backgroundColor: 'var(--color-bg)' }}
        >
          <div className="col-span-4">Produkti</div>
          <div className="col-span-2">Kategoria</div>
          <div className="col-span-2 text-right">Çmimi</div>
          <div className="col-span-2 text-center">Stoku Aktual</div>
          <div className="col-span-2 text-center">Ndrysho Stokun</div>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {tr('loading')}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {products.map(p => (
              <div
                key={p.id}
                className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center"
                style={{
                  backgroundColor: p.stock === 0
                    ? 'rgba(185,28,28,0.02)'
                    : p.stock < 10 ? 'rgba(180,83,9,0.02)' : 'transparent',
                }}
              >
                <div className="col-span-4">
                  <div className="flex items-center gap-2">
                    {p.stock === 0 && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-cancelled)' }} />}
                    {p.stock > 0 && p.stock < 10 && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-pending)' }} />}
                    {p.stock >= 10 && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-delivered)' }} />}
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{p.name_al}</span>
                  </div>
                </div>
                <div className="col-span-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {p.category_name_al ?? '—'}
                </div>
                <div className="col-span-2 text-sm font-medium text-right" style={{ color: 'var(--color-text)' }}>
                  €{p.price.toFixed(2)}
                </div>
                <div className="col-span-2 text-center">
                  <span
                    className="text-sm font-heading font-700 px-3 py-1 rounded-lg"
                    style={{
                      fontWeight: 700,
                      backgroundColor: p.stock === 0 ? 'var(--color-cancelled-bg)' : p.stock < 10 ? 'var(--color-pending-bg)' : 'var(--color-delivered-bg)',
                      color: p.stock === 0 ? 'var(--color-cancelled)' : p.stock < 10 ? 'var(--color-pending)' : 'var(--color-delivered)',
                    }}
                  >
                    {p.stock}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-center gap-1.5">
                  {editing?.id === p.id ? (
                    <>
                      <input
                        type="number"
                        value={editing.value}
                        onChange={e => setEditing({ id: p.id, value: e.target.value })}
                        onKeyDown={e => { if (e.key === 'Enter') saveStock(); if (e.key === 'Escape') setEditing(null); }}
                        className="w-16 px-2 py-1 rounded border text-sm text-center outline-none"
                        style={{ borderColor: 'var(--color-olive)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                        autoFocus
                        min={0}
                      />
                      <button
                        onClick={saveStock}
                        disabled={saving}
                        className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                        style={{ backgroundColor: 'var(--color-delivered-bg)', color: 'var(--color-delivered)' }}
                      >
                        <Check size={13} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                        style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                      >
                        <X size={13} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditing({ id: p.id, value: String(p.stock) })}
                      className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:border-[var(--color-olive)] hover:text-[var(--color-olive)]"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                    >
                      {tr('inventory_update_stock')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
