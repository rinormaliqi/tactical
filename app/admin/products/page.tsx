'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, AlertCircle, Search } from 'lucide-react';
import Image from 'next/image';
import { type Product, type Category } from '@/lib/types';
import { useLang } from '@/lib/LanguageContext';
import ImageUploader from '@/components/admin/ImageUploader';

interface ProductForm {
  name_al: string;
  name_en: string;
  description_al: string;
  description_en: string;
  price: string;
  category_id: string;
  slug: string;
  stock: string;
  barcode: string;
  featured: boolean;
  images: string[];
}

const EMPTY_FORM: ProductForm = {
  name_al: '', name_en: '', description_al: '', description_en: '', barcode: '',
  price: '', category_id: '', slug: '', stock: '0', featured: false, images: [],
};

export default function AdminProductsPage() {
  const { tr } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');

  const load = async (q = '') => {
    const url = q ? `/api/products?search=${encodeURIComponent(q)}` : '/api/products';
    const [prods, cats] = await Promise.all([
      fetch(url).then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const startEdit = (p: Product) => {
    setEditing(p);
    setAdding(false);
    setFormError('');
    setForm({
      name_al: p.name_al, name_en: p.name_en ?? '',
      description_al: p.description_al ?? '', description_en: p.description_en ?? '',
      price: String(p.price), category_id: String(p.category_id ?? ''),
      slug: p.slug, stock: String(p.stock), barcode: p.barcode ?? '', featured: p.featured,
      images: Array.isArray(p.images) ? p.images : [],
    });
  };

  const startAdd = () => {
    setAdding(true);
    setEditing(null);
    setFormError('');
    setForm(EMPTY_FORM);
  };

  const cancel = () => { setEditing(null); setAdding(false); setFormError(''); };

  const validate = (): boolean => {
    if (!form.name_al.trim() || !form.price) {
      setFormError('Emri dhe çmimi janë të detyrueshëm.');
      return false;
    }
    if (form.images.length < 1) {
      setFormError('Shtoni të paktën një foto.');
      return false;
    }
    return true;
  };

  const saveEdit = async () => {
    if (!editing || !validate()) return;
    setSaving(true);
    const res = await fetch(`/api/admin/products/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name_al: form.name_al, name_en: form.name_en,
        description_al: form.description_al, description_en: form.description_en,
        price: parseFloat(form.price), category_id: parseInt(form.category_id) || null,
        stock: parseInt(form.stock), barcode: form.barcode, featured: form.featured, images: form.images,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setFormError(d.error === 'Barcode already exists' ? 'Ky barkod ekziston tashmë.' : 'Ruajtja dështoi.');
      return;
    }
    await load(search);
    cancel();
  };

  const saveAdd = async () => {
    if (!validate()) return;
    setSaving(true);
    const slug = form.slug || form.name_al.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name_al: form.name_al, name_en: form.name_en,
        description_al: form.description_al, description_en: form.description_en,
        price: parseFloat(form.price), category_id: parseInt(form.category_id) || null,
        slug, stock: parseInt(form.stock), barcode: form.barcode, featured: form.featured, images: form.images,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      const msg = d.error === 'Slug already exists' ? 'Ky slug ekziston tashmë.'
        : d.error === 'Barcode already exists' ? 'Ky barkod ekziston tashmë.'
        : 'Krijimi dështoi.';
      setFormError(msg);
      return;
    }
    await load(search);
    cancel();
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    await fetch(`/api/admin/products/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null);
    await load(search);
  };

  const F = ({ label, value, onChange, type = 'text', rows }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; rows?: number;
  }) => (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.12em' }}>
        {label}
      </label>
      {rows ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
          style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-800" style={{ fontWeight: 800, color: 'var(--color-text)' }}>
          {tr('admin_products_title').toUpperCase()}
        </h1>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ backgroundColor: 'var(--color-olive)', color: 'white' }}
        >
          <Plus size={15} />
          {tr('admin_add_product')}
        </button>
      </div>

      {/* Search (name or barcode) */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Kërko sipas emrit ose barkodit..."
          className="w-full pl-10 pr-4 py-2.5 border text-sm outline-none"
          style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {(adding || editing) && (
        <div
          className="rounded-xl border p-6"
          style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-olive)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg font-700" style={{ fontWeight: 700, color: 'var(--color-text)' }}>
              {adding ? tr('admin_add_product') : tr('admin_edit_product')}
            </h2>
            <button onClick={cancel} style={{ color: 'var(--color-text-muted)' }}>
              <X size={18} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <F label={tr('admin_product_name')} value={form.name_al} onChange={v => setForm(f => ({ ...f, name_al: v }))} />
            <F label={tr('admin_product_name_en')} value={form.name_en} onChange={v => setForm(f => ({ ...f, name_en: v }))} />
            <F label={`${tr('admin_product_price')} (€)`} type="number" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} />
            <F label={tr('admin_product_stock')} type="number" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} />

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.12em' }}>
                {tr('admin_product_category')}
              </label>
              <select
                value={form.category_id}
                onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none appearance-none"
                style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                <option value="">— Zgjidh —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name_al}</option>
                ))}
              </select>
            </div>

            <F label="Barkodi" value={form.barcode} onChange={v => setForm(f => ({ ...f, barcode: v }))} />

            {adding && (
              <F label="Slug (URL)" value={form.slug} onChange={v => setForm(f => ({ ...f, slug: v }))} />
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <F label="Përshkrimi (SHQ)" value={form.description_al} onChange={v => setForm(f => ({ ...f, description_al: v }))} rows={3} />
            <F label="Përshkrimi (EN)" value={form.description_en} onChange={v => setForm(f => ({ ...f, description_en: v }))} rows={3} />
          </div>

          {/* Image gallery */}
          <div className="mb-5">
            <ImageUploader
              images={form.images}
              onChange={imgs => { setForm(f => ({ ...f, images: imgs })); if (imgs.length) setFormError(''); }}
            />
          </div>

          {formError && (
            <p className="flex items-center gap-1.5 text-sm mb-4" style={{ color: 'var(--color-sale)' }}>
              <AlertCircle size={14} />
              {formError}
            </p>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                className="w-10 h-6 rounded-full relative transition-colors duration-150 cursor-pointer"
                style={{ backgroundColor: form.featured ? 'var(--color-olive)' : 'var(--color-border)' }}
                onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
              >
                <div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-150"
                  style={{ transform: form.featured ? 'translateX(20px)' : 'translateX(4px)' }}
                />
              </div>
              <span className="text-sm" style={{ color: 'var(--color-text)' }}>{tr('admin_product_featured')}</span>
            </label>

            <div className="flex items-center gap-3">
              <button
                onClick={cancel}
                className="px-4 py-2 rounded-lg text-sm border transition-colors"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                {tr('admin_cancel')}
              </button>
              <button
                onClick={adding ? saveAdd : saveEdit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-olive)', color: 'white' }}
              >
                <Check size={14} />
                {saving ? '...' : tr('admin_save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
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
          <div className="col-span-2 text-center">Stoku</div>
          <div className="col-span-1 text-center">⭐</div>
          <div className="col-span-1 text-right">Veprime</div>
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
                className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center hover:bg-black/[0.015] transition-colors"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div
                    className="relative w-10 h-10 shrink-0 overflow-hidden border"
                    style={{ borderColor: 'var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-soft)' }}
                  >
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px]" style={{ color: 'var(--color-border-strong)' }}>—</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{p.name_al}</div>
                    <div className="text-[10px] flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                      <span>{p.slug}</span>
                      {p.barcode && (
                        <span className="font-mono px-1 rounded" style={{ backgroundColor: 'var(--color-bg-soft)', letterSpacing: '0.02em' }}>{p.barcode}</span>
                      )}
                    </div>
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
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: p.stock === 0 ? 'var(--color-cancelled-bg)' : p.stock < 10 ? 'var(--color-pending-bg)' : 'var(--color-delivered-bg)',
                      color: p.stock === 0 ? 'var(--color-cancelled)' : p.stock < 10 ? 'var(--color-pending)' : 'var(--color-delivered)',
                    }}
                  >
                    {p.stock}
                  </span>
                </div>
                <div className="col-span-1 text-center text-sm" style={{ color: p.featured ? 'var(--color-olive)' : 'var(--color-border-strong)' }}>
                  {p.featured ? '●' : '○'}
                </div>
                <div className="col-span-1 flex items-center justify-end gap-1">
                  <button
                    onClick={() => startEdit(p)}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-black/5 transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                    title={tr('admin_edit_product')}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-[var(--color-cancelled-bg)] transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                    title={tr('admin_delete_product')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div
            className="rounded-2xl border p-6 max-w-sm w-full mx-4"
            style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="font-heading text-lg font-700 mb-2" style={{ fontWeight: 700, color: 'var(--color-text)' }}>
              {tr('admin_delete_product')}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              {tr('admin_confirm_delete')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-lg border text-sm font-medium"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                {tr('admin_cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: 'var(--color-cancelled)', color: 'white' }}
              >
                {tr('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
