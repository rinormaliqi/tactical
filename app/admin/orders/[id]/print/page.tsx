'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { type Order } from '@/lib/types';

export default function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(o => {
        setOrder(o);
        if (o) setTimeout(() => window.print(), 600);
      });
  }, [id]);

  if (!order) {
    return <div className="p-8 text-center text-gray-400">Duke ngarkuar...</div>;
  }

  const date = new Date(order.created_at).toLocaleDateString('sq-AL', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const time = new Date(order.created_at).toLocaleTimeString('sq-AL', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <>
      {/* Print controls — hidden on print */}
      <div
        className="no-print fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3 border-b"
        style={{ backgroundColor: 'white', borderColor: '#e4e1d8' }}
      >
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: '#737270' }}
        >
          <ArrowLeft size={15} />
          Kthehu
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#5B6A38', color: 'white' }}
        >
          <Printer size={14} />
          Printo Fletën
        </button>
      </div>

      {/* Print content */}
      <div
        className="max-w-2xl mx-auto p-8 pt-20"
        style={{ fontFamily: 'system-ui, sans-serif', color: '#111110' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6" style={{ borderBottom: '2px solid #111110' }}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{ backgroundColor: '#3D4826' }}
              >
                <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                  <polygon points="9,1 17,14 1,14" stroke="white" strokeWidth="1.5" fill="none"/>
                  <polygon points="9,5 14,13 4,13" fill="white" fillOpacity="0.3"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>MALI</div>
                <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: '#737270' }}>TACTICAL STORE</div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#737270' }}>
              Remzi Hoxha 78, Ferizaj, Kosovë<br />
              Tel: 043 999 987
            </div>
          </div>
          <div className="text-right">
            <div
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#737270',
                marginBottom: '4px',
              }}
            >
              FLETË DËRGESE
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.05em' }}>
              {order.order_number}
            </div>
            <div style={{ fontSize: '11px', color: '#737270', marginTop: '4px' }}>
              {date} · {time}
            </div>
          </div>
        </div>

        {/* Deliver to */}
        <div className="mb-6 p-5 rounded-xl" style={{ backgroundColor: '#f7f6f4', border: '1px solid #e4e1d8' }}>
          <div
            style={{
              fontSize: '9px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: '#5B6A38',
              marginBottom: '10px',
            }}
          >
            DËRGO TEK
          </div>
          <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '6px' }}>{order.customer_name}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '13px', color: '#737270' }}>
              <strong style={{ color: '#111110' }}>Adresa:</strong> {order.customer_address}, {order.customer_city}
            </div>
            <div style={{ fontSize: '13px', color: '#737270' }}>
              <strong style={{ color: '#111110' }}>Tel:</strong>{' '}
              <a href={`tel:${order.customer_phone}`} style={{ color: '#5B6A38', fontWeight: 600 }}>
                {order.customer_phone}
              </a>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <div
            style={{
              fontSize: '9px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: '#5B6A38',
              marginBottom: '10px',
            }}
          >
            ARTIKUJT E POROSITUR
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e4e1d8' }}>
                <th style={{ textAlign: 'left', padding: '6px 0', fontSize: '10px', color: '#737270', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Produkti</th>
                <th style={{ textAlign: 'center', padding: '6px 0', fontSize: '10px', color: '#737270', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sasia</th>
                <th style={{ textAlign: 'right', padding: '6px 0', fontSize: '10px', color: '#737270', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Çmimi</th>
                <th style={{ textAlign: 'right', padding: '6px 0', fontSize: '10px', color: '#737270', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Totali</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f0efeb' }}>
                  <td style={{ padding: '8px 0', fontSize: '13px', fontWeight: 500 }}>{item.product_name}</td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'center', color: '#737270' }}>{item.quantity}</td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right', color: '#737270' }}>€{item.price.toFixed(2)}</td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>€{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #111110' }}>
                <td colSpan={3} style={{ padding: '10px 0', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.05em' }}>
                  TOTALI
                </td>
                <td style={{ padding: '10px 0', fontWeight: 800, fontSize: '1.2rem', textAlign: 'right', color: '#5B6A38' }}>
                  €{order.total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mb-6 p-4 rounded" style={{ backgroundColor: '#fef3c7', border: '1px solid rgba(180,83,9,0.2)' }}>
            <div
              style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#B45309', marginBottom: '4px' }}
            >
              SHËNIME
            </div>
            <div style={{ fontSize: '13px', color: '#737270' }}>{order.notes}</div>
          </div>
        )}

        {/* Signature */}
        <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div
              style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#737270', marginBottom: '32px' }}
            >
              NËNSHKRIMI I KLIENTIT
            </div>
            <div style={{ width: '180px', borderBottom: '1px solid #111110' }} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#737270', marginBottom: '32px' }}
            >
              DËRGUAR NGA
            </div>
            <div style={{ width: '180px', borderBottom: '1px solid #111110' }} />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '40px',
            paddingTop: '16px',
            borderTop: '1px solid #e4e1d8',
            textAlign: 'center',
            fontSize: '10px',
            color: '#737270',
          }}
        >
          Mali Tactical Store · Remzi Hoxha 78, Ferizaj 70000 · 043 999 987
        </div>
      </div>
    </>
  );
}
