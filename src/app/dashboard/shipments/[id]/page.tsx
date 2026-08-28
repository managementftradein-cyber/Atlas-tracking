'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  in_transit: 'In Transit',
  arrived_at_facility: 'Arrived at Facility',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  delayed: 'Delayed',
  cancelled: 'Cancelled',
};

export default function ShipmentReceipt() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();
  const [shipment, setShipment] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const db = createClient();
      const { data: { user } } = await db.auth.getUser();
      if (!user) { r.replace('/login'); return; }

      const { data: s } = await db.from('shipments').select('*').eq('id', id).eq('customer_id', user.id).single();
      if (!s) { setNotFound(true); setLoading(false); return; }
      setShipment(s);

      const { data: ev } = await db.from('tracking_events').select('*').eq('shipment_id', id).order('created_at', { ascending: true });
      setEvents(ev || []);
      setLoading(false);
    })();
  }, [id, r]);

  if (loading) return <main className="p-10 text-slate-500">Loading receipt…</main>;
  if (notFound) return <main className="mx-auto max-w-3xl px-5 py-16 text-center"><p className="text-2xl font-black">Shipment not found</p><p className="mt-2 text-slate-500">This shipment doesn't exist or isn't linked to your account.</p></main>;

  const s = shipment;
  const createdDate = s.created_at ? new Date(s.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 print:py-0">
      <div className="flex items-center justify-between print:hidden">
        <button onClick={() => r.push('/dashboard')} className="text-cyanx">← Dashboard</button>
        <button onClick={() => window.print()} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/5">Print / Save Receipt</button>
      </div>

      {/* Receipt */}
      <div className="glass mt-6 rounded-3xl p-8 print:border-none print:bg-white print:text-black">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[.2em] text-slate-500">Shipment Receipt</p>
            <h1 className="mt-2 text-3xl font-black">{s.tracking_number}</h1>
            <p className="mt-1 text-sm text-slate-500">Created {createdDate}</p>
          </div>
          <span className="rounded-full bg-cyan-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-cyanx">{STATUS_LABEL[s.status] || s.status}</span>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.15em] text-slate-500">From</p>
            <p className="mt-2 font-semibold">{s.sender_name}</p>
            <p className="text-sm text-slate-400">{s.sender_address}</p>
            <p className="text-sm text-slate-400">{s.sender_city}, {s.sender_country}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.15em] text-slate-500">To</p>
            <p className="mt-2 font-semibold">{s.receiver_name}</p>
            <p className="text-sm text-slate-400">{s.receiver_address}</p>
            <p className="text-sm text-slate-400">{s.receiver_city}, {s.receiver_country}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/10 p-5 print:border-slate-300 print:bg-transparent">
          <div className="flex justify-between text-sm"><span className="text-slate-500">Route</span><span>{s.origin} → {s.destination}</span></div>
          {s.parcel_description && <div className="mt-3 flex justify-between text-sm"><span className="text-slate-500">Parcel</span><span>{s.parcel_description}</span></div>}
          {s.weight_kg != null && <div className="mt-3 flex justify-between text-sm"><span className="text-slate-500">Weight</span><span>{s.weight_kg} kg</span></div>}
          <div className="mt-3 flex justify-between text-sm"><span className="text-slate-500">Shipping type</span><span className="capitalize">{s.shipping_type}</span></div>
          <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-lg font-black print:border-slate-300"><span>Total</span><span>${Number(s.total_cost || 0).toFixed(2)}</span></div>
        </div>
      </div>

      {/* Tracking timeline */}
      <div className="glass mt-6 rounded-3xl p-8 print:hidden">
        <h2 className="text-xl font-black">Tracking history</h2>
        <div className="mt-6 space-y-6">
          {events.map((e, i) => (
            <div key={e.id} className="flex gap-4">
              <span className={`timeline-dot ${i === events.length - 1 ? 'active' : ''}`} />
              <div>
                <p className="font-semibold">{STATUS_LABEL[e.status] || e.status}</p>
                <p className="text-sm text-cyanx">{e.location}</p>
                {e.description && <p className="mt-1 text-sm text-slate-400">{e.description}</p>}
                <p className="mt-1 text-xs text-slate-600">{new Date(e.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {!events.length && <p className="text-slate-500">No tracking updates yet.</p>}
        </div>
      </div>
    </main>
  );
}
