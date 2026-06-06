import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type ReportData } from './types';

const OLIVE: [number, number, number] = [91, 106, 56];
const INK: [number, number, number] = [19, 19, 16];
const MUTED: [number, number, number] = [110, 109, 104];

const eur = (n: number) => `EUR ${n.toFixed(2)}`;

const periodLabel = (p: string, lang: 'al' | 'en') => {
  const map: Record<string, [string, string]> = {
    daily: ['Ditor', 'Daily'],
    monthly: ['Mujor', 'Monthly'],
    yearly: ['Vjetor', 'Yearly'],
  };
  return map[p]?.[lang === 'al' ? 0 : 1] ?? p;
};

const statusLabel = (s: string, lang: 'al' | 'en') => {
  const map: Record<string, [string, string]> = {
    pending: ['Në pritje', 'Pending'],
    processing: ['Duke u procesuar', 'Processing'],
    delivered: ['Dorëzuar', 'Delivered'],
    cancelled: ['Anuluar', 'Cancelled'],
  };
  return map[s]?.[lang === 'al' ? 0 : 1] ?? s;
};

export function generateReportPdf(report: ReportData, lang: 'al' | 'en') {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const M = 40;

  // ── Header band ──
  doc.setFillColor(...INK);
  doc.rect(0, 0, pageW, 78, 'F');
  doc.setFillColor(...OLIVE);
  doc.rect(0, 78, pageW, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('MALI', M, 38);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 175);
  doc.text('TACTICAL STORE', M, 52);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(lang === 'al' ? 'RAPORT FINANCIAR' : 'FINANCIAL REPORT', pageW - M, 36, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(194, 154, 75);
  doc.text(`${periodLabel(report.period, lang)} - ${report.label}`, pageW - M, 52, { align: 'right' });
  doc.setTextColor(150, 150, 145);
  doc.setFontSize(7.5);
  doc.text(
    `${lang === 'al' ? 'Gjeneruar' : 'Generated'}: ${new Date(report.generated_at).toLocaleString(lang === 'al' ? 'sq-AL' : 'en-GB')}`,
    pageW - M, 66, { align: 'right' }
  );

  let y = 108;

  // ── Summary heading ──
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(lang === 'al' ? 'Përmbledhje' : 'Summary', M, y);
  y += 10;

  const s = report.summary;
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 6, lineColor: [228, 226, 217], textColor: INK },
    headStyles: { fillColor: OLIVE, textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [[lang === 'al' ? 'Treguesi' : 'Metric', lang === 'al' ? 'Vlera' : 'Value']],
    body: [
      [lang === 'al' ? 'Të ardhura totale' : 'Total revenue', eur(s.revenue_total)],
      [lang === 'al' ? '  — Online' : '  — Online', eur(s.revenue_online)],
      [lang === 'al' ? '  — Në dyqan' : '  — In-store', eur(s.revenue_instore)],
      [lang === 'al' ? 'Porosi gjithsej' : 'Total orders', String(s.orders_total)],
      [lang === 'al' ? '  — Online / Në dyqan' : '  — Online / In-store', `${s.orders_online} / ${s.orders_instore}`],
      [lang === 'al' ? 'Artikuj të shitur' : 'Items sold', String(s.items_sold)],
      [lang === 'al' ? 'Vlera mesatare e porosisë' : 'Average order value', eur(s.avg_order_value)],
    ],
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
  });

  // @ts-expect-error autotable augments doc with lastAutoTable
  y = doc.lastAutoTable.finalY + 22;

  // ── Series ──
  const seriesNonZero = report.series.filter(b => b.orders > 0);
  if (seriesNonZero.length > 0) {
    doc.setTextColor(...INK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(lang === 'al' ? 'Të ardhurat sipas periudhës' : 'Revenue over time', M, y);
    y += 10;
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      theme: 'striped',
      styles: { fontSize: 8.5, cellPadding: 4, textColor: INK },
      headStyles: { fillColor: INK, textColor: [255, 255, 255], fontStyle: 'bold' },
      head: [[lang === 'al' ? 'Periudha' : 'Period', lang === 'al' ? 'Porosi' : 'Orders', lang === 'al' ? 'Të ardhura' : 'Revenue']],
      body: seriesNonZero.map(b => [b.bucket, String(b.orders), eur(b.revenue)]),
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' } },
    });
    // @ts-expect-error lastAutoTable
    y = doc.lastAutoTable.finalY + 22;
  }

  // ── Top products ──
  if (report.top_products.length > 0) {
    if (y > 680) { doc.addPage(); y = 50; }
    doc.setTextColor(...INK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(lang === 'al' ? 'Produktet kryesore' : 'Top products', M, y);
    y += 10;
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 5, lineColor: [228, 226, 217], textColor: INK },
      headStyles: { fillColor: OLIVE, textColor: [255, 255, 255], fontStyle: 'bold' },
      head: [['#', lang === 'al' ? 'Produkti' : 'Product', lang === 'al' ? 'Sasia' : 'Qty', lang === 'al' ? 'Të ardhura' : 'Revenue']],
      body: report.top_products.map((p, i) => [String(i + 1), p.name, String(p.quantity), eur(p.revenue)]),
      columnStyles: { 0: { cellWidth: 24, halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right', fontStyle: 'bold' } },
    });
    // @ts-expect-error lastAutoTable
    y = doc.lastAutoTable.finalY + 22;
  }

  // ── Status breakdown ──
  if (report.by_status.length > 0) {
    if (y > 700) { doc.addPage(); y = 50; }
    doc.setTextColor(...INK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(lang === 'al' ? 'Statusi i porosive' : 'Order status', M, y);
    y += 10;
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 5, lineColor: [228, 226, 217], textColor: INK },
      headStyles: { fillColor: MUTED, textColor: [255, 255, 255], fontStyle: 'bold' },
      head: [[lang === 'al' ? 'Statusi' : 'Status', lang === 'al' ? 'Numri' : 'Count', lang === 'al' ? 'Vlera' : 'Value']],
      body: report.by_status.map(r => [statusLabel(r.status, lang), String(r.count), eur(r.revenue)]),
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' } },
    });
  }

  // ── Footer on every page ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.getHeight();
    doc.setDrawColor(228, 226, 217);
    doc.line(M, h - 34, pageW - M, h - 34);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text('Mali Tactical Store · Remzi Hoxha 78, Ferizaj 70000 · 043 999 987', M, h - 20);
    doc.text(`${i} / ${pageCount}`, pageW - M, h - 20, { align: 'right' });
  }

  doc.save(`raport-${report.period}-${report.date}.pdf`);
}
