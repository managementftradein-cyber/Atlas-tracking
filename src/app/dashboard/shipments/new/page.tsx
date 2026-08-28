'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NewShipment() {
  const [f, setF] = useState({
    senderName: '',
    senderAddress: '',
    senderCity: '',
    senderCountry: '',
    receiverName: '',
    receiverAddress: '',
    receiverCity: '',
    receiverCountry: '',
    description: '',
    weight: '',
    shipping_type: 'standard',
    price: '',
  });
  const [m, setM] = useState('');
  const r = useRouter();
  const u = (k: string, v: string) => setF(x => ({ ...x, [k]: v }));

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setM('Creating...');
    const db = createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) { r.replace('/login'); return; }

    const senderName = f.senderName.trim() || user.user_metadata?.full_name || user.email || 'Unknown sender';
    const origin = `${f.senderCity}, ${f.senderCountry}`;
    const destination = `${f.receiverCity}, ${f.receiverCountry}`;

    const orderNumber = `ORD-${Date.now()}`;
    const { data: o, error: oe } = await db.from('orders').insert({ order_number: orderNumber, customer_id: user.id }).select().single();
    if (oe) { setM(oe.message); return; }

    const tracking = `ATL-${new Date().getFullYear()}-${String(o.id).replaceAll('-', '').slice(0, 8).toUpperCase()}`;
    const { data: s, error: se } = await db.from('shipments').insert({
      order_id: o.id,
      customer_id: user.id,
      tracking_number: tracking,
      sender_name: senderName,
      sender_address: f.senderAddress,
      sender_city: f.senderCity,
      sender_country: f.senderCountry,
      receiver_name: f.receiverName,
      receiver_address: f.receiverAddress,
      receiver_city: f.receiverCity,
      receiver_country: f.receiverCountry,
      origin,
      destination,
      parcel_description: f.description,
      weight_kg: f.weight ? Number(f.weight) : null,
      shipping_type: f.shipping_type,
      total_cost: Number(f.price || 0),
      status: 'pending',
    }).select().single();
    if (se) { setM(se.message); return; }

    await db.from('tracking_events').insert({
      shipment_id: s.id,
      status: 'pending',
      location: origin,
      description: 'Shipment created and awaiting processing.',
      created_by: user.id,
    });

    r.push('/dashboard');
  }

  const senderFields: [string, string][] = [
    ['senderName', 'Sender name'],
    ['senderAddress', 'Sender address'],
    ['senderCity', 'Sender city'],
    ['senderCountry', 'Sender country'],
  ];
  const receiverFields: [string, string][] = [
    ['receiverName', 'Receiver name'],
    ['receiverAddress', 'Receiver address'],
    ['receiverCity', 'Receiver city'],
    ['receiverCountry', 'Receiver country'],
  ];

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <p className="text-cyanx font-bold uppercase tracking-[.2em]">New shipment</p>
      <h1 className="mt-3 text-4xl font-black">Create an order</h1>
      <form onSubmit={go} className="mt-8 space-y-6">
        <div className="glass rounded-3xl p-7 space-y-5">
          <h2 className="text-lg font-bold text-slate-200">From</h2>
          {senderFields.map(([k, l]) => (
            <label key={k} className="block text-sm text-slate-400">{l}
              <input required={k !== 'senderName'} value={(f as any)[k]} onChange={e => u(k, e.target.value)} placeholder={k === 'senderName' ? 'Defaults to your account name if left blank' : ''} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" />
            </label>
          ))}
        </div>

        <div className="glass rounded-3xl p-7 space-y-5">
          <h2 className="text-lg font-bold text-slate-200">To</h2>
          {receiverFields.map(([k, l]) => (
            <label key={k} className="block text-sm text-slate-400">{l}
              <input required value={(f as any)[k]} onChange={e => u(k, e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" />
            </label>
          ))}
        </div>

        <div className="glass rounded-3xl p-7 space-y-5">
          <h2 className="text-lg font-bold text-slate-200">Parcel</h2>
          <label className="block text-sm text-slate-400">Parcel description
            <input value={f.description} onChange={e => u('description', e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" />
          </label>
          <label className="block text-sm text-slate-400">Weight (kg)
            <input type="number" step="0.01" value={f.weight} onChange={e => u('weight', e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" />
          </label>
          <label className="block text-sm text-slate-400">Shipping type
            <select value={f.shipping_type} onChange={e => u('shipping_type', e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1828] p-3">
              <option>standard</option>
              <option>express</option>
              <option>priority</option>
            </select>
          </label>
          <label className="block text-sm text-slate-400">Shipping price
            <input required type="number" step="0.01" value={f.price} onChange={e => u('price', e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" />
          </label>
        </div>

        <button className="w-full rounded-xl bg-cyanx p-4 font-bold text-[#03101b]">Create Shipment &amp; Generate Tracking Number</button>
        {m && <p className="text-center text-sm text-slate-400">{m}</p>}
      </form>
    </main>
  );
}

