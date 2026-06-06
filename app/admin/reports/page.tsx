'use client';

import { useCallback, useEffect, useState } from 'react';
import { Printer, Download, TrendingUp, ShoppingBag, Package, Coins, Store, Globe, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { type ReportData } from '@/lib/types';
import { useLang } from '@/lib/LanguageContext';
import { generateReportPdf } from '@/lib/reportPdf';

type Period = 'daily' | 'monthly' | 'yearly';

export default function ReportsPage() {
  const { lang } = useLang();
  const t = (al: string, en: string) => (lang === 'al' ? al : en);

  const [period, setPeriod] = useState<Period>('daily');
  const today = new Date();
  const [day, setDay] = useState(today.toISOString().slice(0, 10));
  const [month, setMonth] = useState(today.toISOString().slice(0, 7));
  const [year, setYear] = useState(String(today.getFullYear()));

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const apiDate = period === 'daily' ? day : period === 'monthly' ? `${month}-01` : `${year}-01-01`;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/reports?period=${period}&date=${apiDate}`, { cache: 'no-store' });
    if (res.ok) setReport(await res.json());
    setLoading(false);
  }, [period, apiDate]);

  useEffect(() => { load(); }, [load]);

  const periods: { key: Period; al: string; en: string }[] = [
    { key: 'daily', al: 'Ditor', en: 'Daily' },
    { key: 'monthly', al: 'Mujor', en: 'Monthly' },
    { key: 'yearly', al: 'Vjetor', en: 'Yearly' },
  ];

  const maxRev = report ? Math.max(...report.series.map(s => s.revenue), 1) : 1;
  const s = report?.summary;

  const cards = s ? [
    { icon: TrendingUp, label: t('Të ardhura totale', 'Total revenue'), value: `€${s.revenue_total.toFixed(2)}`, accent: 'var(--color-olive)' },
    { icon: ShoppingBag, label: t('Porosi gjithsej', 'Total orders'), value: String(s.orders_total), accent: 'var(--color-text)' },
    { icon: Package, label: t('Artikuj të shitur', 'Items sold'), value: String(s.items_sold), accent: 'var(--color-text)' },
    { icon: Coins, label: t('Vlera mesatare', 'Avg. order value'), value: `€${s.avg_order_value.toFixed(2)}`, accent: 'var(--color-text)' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header + controls (not printed) */}
      <div className="no-print flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl" style={{ color: 'var(--color-text)' }}>{t('RAPORTET FINANCIARE', 'FINANCIAL REPORTS')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{t('Statistika dhe të ardhura sipas periudhës', 'Statistics and revenue by period')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            disabled={!report}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border transition-colors hover:border-[var(--color-olive)] hover:text-[var(--color-olive)] disabled:opacity-50"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}
          >
            <Printer size={15} /> {t('Printo', 'Print')}
          </button>
          <button
            onClick={() => report && generateReportPdf(report, lang)}
            disabled={!report}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-olive)', borderRadius: 'var(--radius-sm)', letterSpacing: '0.05em' }}
          >
            <Download size={15} /> {t('Shkarko PDF', 'Download PDF')}
          </button>
        </div>
      </div>

      {/* Period + date selector (not printed) */}
      <div className="no-print flex flex-wrap items-center gap-3">
        <div className="flex border" style={{ borderColor: 'var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          {periods.map(p => (
            <button
              key={p.key} onClick={() => setPeriod(p.key)}
              className="px-4 py-2 text-sm font-semibold transition-colors"
              style={{ backgroundColor: period === p.key ? 'var(--color-olive)' : 'var(--color-bg-elevated)', color: period === p.key ? 'white' : 'var(--color-text-muted)' }}
            >
              {lang === 'al' ? p.al : p.en}
            </button>
          ))}
        </div>

        {period === 'daily' && (
          <input type="date" value={day} onChange={e => setDay(e.target.value)} className="px-3 py-2 border text-sm outline-none" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }} />
        )}
        {period === 'monthly' && (
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="px-3 py-2 border text-sm outline-none" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }} />
        )}
        {period === 'yearly' && (
          <select value={year} onChange={e => setYear(e.target.value)} className="px-3 py-2 border text-sm outline-none" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>
            {Array.from({ length: 6 }, (_, i) => today.getFullYear() - i).map(yr => <option key={yr} value={yr}>{yr}</option>)}
          </select>
        )}
      </div>

      {loading || !report ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-olive)' }} />
        </div>
      ) : (
        /* ── Printable report area ── */
        <div id="report-print" className="space-y-6">
          {/* Print-only branded header */}
          <div className="hidden print:flex items-center justify-between pb-4 mb-2 border-b" style={{ borderColor: '#111' }}>
            <div>
              <div className="font-display text-2xl">MALI</div>
              <div className="text-[9px] tracking-widest" style={{ color: '#666' }}>TACTICAL STORE</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-sm">{t('RAPORT FINANCIAR', 'FINANCIAL REPORT')}</div>
              <div className="text-xs" style={{ color: '#666' }}>
                {periods.find(p => p.key === period)?.[lang === 'al' ? 'al' : 'en']} · {report.label}
              </div>
            </div>
          </div>

          {/* Period label on screen */}
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-2xl" style={{ color: 'var(--color-text)' }}>{report.label}</h2>
            <span className="eyebrow" style={{ color: 'var(--color-olive)' }}>
              {periods.find(p => p.key === period)?.[lang === 'al' ? 'al' : 'en']}
            </span>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c, i) => (
              <motion.div
                key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="border p-5 print-break-avoid" style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
              >
                <c.icon size={16} style={{ color: c.accent }} strokeWidth={1.75} />
                <div className="font-display text-2xl mt-3" style={{ color: 'var(--color-text)' }}>{c.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{c.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Online vs in-store split */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border p-5 flex items-center gap-4 print-break-avoid" style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-olive-light)' }}>
                <Globe size={18} style={{ color: 'var(--color-olive)' }} />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.12em' }}>{t('Online', 'Online')}</div>
                <div className="font-display text-xl" style={{ color: 'var(--color-text)' }}>€{s!.revenue_online.toFixed(2)}</div>
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{s!.orders_online} {t('porosi', 'orders')}</div>
            </div>
            <div className="border p-5 flex items-center gap-4 print-break-avoid" style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-olive-light)' }}>
                <Store size={18} style={{ color: 'var(--color-olive)' }} />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.12em' }}>{t('Në dyqan', 'In-store')}</div>
                <div className="font-display text-xl" style={{ color: 'var(--color-text)' }}>€{s!.revenue_instore.toFixed(2)}</div>
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{s!.orders_instore} {t('shitje', 'sales')}</div>
            </div>
          </div>

          {/* Revenue chart */}
          <div className="border p-5 print-break-avoid" style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <h3 className="font-heading text-sm font-700 uppercase tracking-widest mb-5" style={{ fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-text)' }}>
              {t('Të ardhurat sipas periudhës', 'Revenue over time')}
            </h3>
            <div className="flex items-end gap-1 h-44">
              {report.series.map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group min-w-0">
                  <div className="w-full relative" style={{ height: `${(b.revenue / maxRev) * 100}%`, minHeight: b.revenue > 0 ? '3px' : '0' }}>
                    <div className="absolute inset-0 transition-colors" style={{ backgroundColor: b.revenue > 0 ? 'var(--color-olive)' : 'transparent', borderRadius: '2px 2px 0 0' }} />
                    {b.revenue > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-semibold opacity-0 group-hover:opacity-100 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>€{b.revenue.toFixed(0)}</span>
                    )}
                  </div>
                  <span className="text-[8px] whitespace-nowrap" style={{ color: 'var(--color-text-muted)', writingMode: report.series.length > 16 ? 'vertical-rl' : 'horizontal-tb' }}>{b.bucket}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tables: top products + status */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="border overflow-hidden print-break-avoid" style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="font-heading text-sm font-700 uppercase tracking-widest" style={{ fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-text)' }}>{t('Produktet kryesore', 'Top products')}</h3>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {report.top_products.length === 0 ? (
                  <div className="px-5 py-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('Nuk ka të dhëna.', 'No data.')}</div>
                ) : report.top_products.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3 px-5 py-2.5">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: 'var(--color-olive-light)', color: 'var(--color-olive-dark)' }}>{i + 1}</span>
                    <span className="text-sm flex-1 truncate" style={{ color: 'var(--color-text)' }}>{p.name}</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{p.quantity}×</span>
                    <span className="text-sm font-semibold w-20 text-right" style={{ color: 'var(--color-text)' }}>€{p.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border overflow-hidden print-break-avoid" style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="font-heading text-sm font-700 uppercase tracking-widest" style={{ fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-text)' }}>{t('Statusi i porosive', 'Order status')}</h3>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {report.by_status.length === 0 ? (
                  <div className="px-5 py-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('Nuk ka të dhëna.', 'No data.')}</div>
                ) : report.by_status.map(r => (
                  <div key={r.status} className="flex items-center gap-3 px-5 py-2.5">
                    <span className="text-sm flex-1 capitalize" style={{ color: 'var(--color-text)' }}>{r.status}</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.count}×</span>
                    <span className="text-sm font-semibold w-20 text-right" style={{ color: 'var(--color-text)' }}>€{r.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[11px] pt-2" style={{ color: 'var(--color-text-muted)' }}>
            {t('Gjeneruar', 'Generated')}: {new Date(report.generated_at).toLocaleString(lang === 'al' ? 'sq-AL' : 'en-GB')} · Mali Tactical Store
          </p>
        </div>
      )}
    </div>
  );
}
