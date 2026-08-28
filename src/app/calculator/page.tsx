'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Calculator() {
  const [rates, setRates] = useState<any[]>([]);
  const [weight, setWeight] = useState('');
  const [type, setType] = useState('standard');
  const [intl, setIntl] = useState(false);

  useEffect(() => {
    (async () => {
      const db = createClient();
      const { data } = await db.from('shipping_rates').select('*').eq('active', true);
      setRates(data || []);
      if (data?.length) setType(data[0].shipping_type);
    })();
  }, []);

  const rate = rates.find(r => r.shipping_type === type);
  const w = Number(weight || 0);
  const intlMultiplier = intl ? 1.6 : 1;
  const total = rate ? (Number(rate.base_price) + Number(rate.price_per_kg) * w) * intlMultiplier : null;

  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <p className="text-cyanx font-bold uppercase tracking-[.2em]">Shipping Price Calculator</p>
      <h1 className="mt-3 text-4xl font-black">Estimate your cost</h1>
      <div className="glass mt-8 rounded-3xl p-7 space-y-5">
        <label className="block text-sm text-slate-400">Weight (kg)
          <input type="number" step="0.1" min="0" value={weight} onChange={e => setWeight(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" />
        </label>
        <label className="block text-sm text-slate-400">Shipping type
          <select value={type} onChange={e => setType(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1828] p-3 capitalize">
            {rates.map(r => <option key={r.shipping_type} value={r.shipping_type}>{r.shipping_type} — {r.estimated_days_min}–{r.estimated_days_max} business days</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input type="checkbox" checked={intl} onChange={e => setIntl(e.target.checked)} /> International shipment
        </label>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
          <p className="text-sm text-slate-500">Estimated cost</p>
          <p className="mt-1 text-3xl font-black text-cyanx">{total != null ? `$${total.toFixed(2)}` : '—'}</p>
        </div>
        <p className="text-xs text-slate-600">Estimate only — final price is confirmed when your shipment is created.</p>
      </div>
    </main>
  );
}
