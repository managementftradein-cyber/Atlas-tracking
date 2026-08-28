'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const FAQ: { keywords: string[]; answer: string }[] = [
  { keywords: ['track', 'where is', 'status of my', 'shipment status'], answer: "You can track any shipment from the Track page — just enter your tracking number (it looks like ATL-2026-XXXXXXXX). No account needed." },
  { keywords: ['create account', 'sign up', 'register'], answer: "Tap Sign Up in the menu, enter your email and a password, and you're in." },
  { keywords: ['create shipment', 'book', 'new shipment', 'send a package', 'send a parcel'], answer: "Log in, go to your Dashboard, and select \u201c+ Create Shipment.\u201d You'll get a tracking number immediately." },
  { keywords: ['delivery time', 'how long', 'eta', 'arrive'], answer: "Delivery windows depend on the shipping type chosen when the shipment was created \u2014 standard, express or priority \u2014 and are shown on the shipment's tracking page." },
  { keywords: ['price', 'cost', 'rate', 'how much'], answer: "Shipping cost is set per shipment and shown on your receipt and tracking page." },
  { keywords: ['cancel'], answer: "Send us your tracking number below and we'll help right away." },
  { keywords: ['receipt', 'invoice'], answer: "Open any shipment from your Dashboard \u2014 the receipt is right at the top, with a Print / Save option." },
  { keywords: ['human', 'agent', 'support', 'contact', 'talk to someone'], answer: "Of course \u2014 type your message below and it'll go straight to our support team." },
];

function findAnswer(text: string) {
  const q = text.toLowerCase();
  for (const f of FAQ) if (f.keywords.some(k => q.includes(k))) return f.answer;
  return null;
}

export default function ChatWidget() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: 'bot' | 'user'; text: string }[]>([
    { from: 'bot', text: "Hi! I'm the Atlas Tracking assistant. Ask about tracking a shipment, creating an account, or shipping rates \u2014 or just type your question." },
  ]);
  const [input, setInput] = useState('');
  const [escalate, setEscalate] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  if (path?.startsWith('/admin')) return null;

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages(m => [...m, { from: 'user', text }]);

    if (escalate) {
      const db = createClient();
      const { data: { user } } = await db.auth.getUser();
      if (!user) {
        setMessages(m => [...m, { from: 'bot', text: 'You\u2019ll need to log in first so our team can reply \u2014 please log in, then visit the Support page to send this.' }]);
        setEscalate(false);
        return;
      }
      const { error } = await db.from('support_tickets').insert({ customer_id: user.id, subject: 'Chat message', message: text });
      setMessages(m => [...m, { from: 'bot', text: error ? `Something went wrong sending that: ${error.message}` : 'Got it \u2014 I\u2019ve sent that to our support team, they\u2019ll follow up by email.' }]);
      setEscalate(false);
      return;
    }

    const answer = findAnswer(text);
    if (answer) {
      setMessages(m => [...m, { from: 'bot', text: answer }]);
    } else {
      setEscalate(true);
      setMessages(m => [...m, { from: 'bot', text: 'I don\u2019t have a ready answer for that. Send it again (or add detail) and I\u2019ll pass it straight to our support team.' }]);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="glass mb-3 flex h-[420px] w-[320px] flex-col rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <p className="font-bold">Atlas Assistant</p>
            <button onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-xl p-3 ${m.from === 'bot' ? 'bg-white/5 text-slate-300' : 'ml-auto bg-cyanx font-medium text-[#03101b]'}`}>{m.text}</div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="flex gap-2 border-t border-white/10 p-3">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask a question\u2026" className="flex-1 rounded-xl border border-white/10 bg-white/5 p-2 text-sm outline-none" />
            <button onClick={send} aria-label="Send message" className="grid h-9 w-9 place-items-center rounded-xl bg-cyanx text-[#03101b]"><Send size={16} /></button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} aria-label="Toggle chat" className="grid h-14 w-14 place-items-center rounded-full bg-cyanx text-[#03101b] shadow-xl shadow-cyan-500/20">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
