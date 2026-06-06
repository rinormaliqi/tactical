'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Star, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export default function ImageUploader({ images, onChange, max = 4 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');

    const remaining = max - images.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) {
      setError(`Maksimumi ${max} foto`);
      return;
    }

    setUploading(true);
    const uploaded: string[] = [];

    for (const file of toUpload) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json();
        uploaded.push(url);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Ngarkimi dështoi');
      }
    }

    onChange([...images, ...uploaded].slice(0, max));
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (url: string) => onChange(images.filter(i => i !== url));

  const makePrimary = (url: string) => onChange([url, ...images.filter(i => i !== url)]);

  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.12em' }}>
        Fotot e produktit <span style={{ color: 'var(--color-text-muted)' }}>({images.length}/{max} · min 1)</span>
      </label>

      <div className="grid grid-cols-4 gap-2.5">
        {images.map((url, i) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden border"
            style={{ borderColor: i === 0 ? 'var(--color-olive)' : 'var(--color-border)', borderRadius: 'var(--radius-sm)' }}
          >
            <Image src={url} alt="" fill sizes="120px" className="object-cover" />

            {/* primary badge */}
            {i === 0 && (
              <span
                className="absolute top-1 left-1 flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 text-white"
                style={{ backgroundColor: 'var(--color-olive)', borderRadius: 'var(--radius-xs)' }}
              >
                <Star size={8} fill="white" /> KRYESORE
              </span>
            )}

            {/* actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(20,19,15,0.55)' }}>
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => makePrimary(url)}
                  className="w-7 h-7 flex items-center justify-center bg-white"
                  style={{ borderRadius: 'var(--radius-xs)' }}
                  title="Bëj kryesore"
                >
                  <Star size={13} style={{ color: 'var(--color-olive)' }} />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                className="w-7 h-7 flex items-center justify-center bg-white"
                style={{ borderRadius: 'var(--radius-xs)' }}
                title="Hiq"
              >
                <X size={13} style={{ color: 'var(--color-sale)' }} />
              </button>
            </div>
          </div>
        ))}

        {/* add slot */}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square flex flex-col items-center justify-center gap-1.5 border border-dashed transition-colors hover:border-[var(--color-olive)] hover:bg-[var(--color-olive-light)] disabled:opacity-60"
            style={{ borderColor: 'var(--color-border-strong)', borderRadius: 'var(--radius-sm)' }}
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin" style={{ color: 'var(--color-olive)' }} />
            ) : (
              <Upload size={18} style={{ color: 'var(--color-text-muted)' }} />
            )}
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              {uploading ? 'Duke ngarkuar' : 'Shto foto'}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {error && (
        <p className="flex items-center gap-1.5 text-xs mt-2" style={{ color: 'var(--color-sale)' }}>
          <AlertCircle size={12} />
          {error}
        </p>
      )}
      <p className="text-[11px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
        Foto e parë është kryesore. JPG, PNG ose WEBP, max 5MB secila.
      </p>
    </div>
  );
}
