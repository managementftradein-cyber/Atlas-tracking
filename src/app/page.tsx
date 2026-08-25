'use client';
import Link from 'next/link'; import {useState} from 'react'; import {useRouter} from 'next/navigation'; import {motion} from 'motion/react'; import AnimatedCard from '@/components/AnimatedCard';

export default function Home(){
 const [n,setN]=useState(''); const r=useRouter();
 const features=[['Shipment Management','Create orders and automatically generate a unique tracking number.'],['Manual Tracking Control','Authorized admins update the current location and delivery status.'],['Customer Visibility','Customers follow a clean timeline from pickup through delivery.']];
 return <main>
  <section className="hero-shell grid-bg px-5 py-20 sm:py-28"><div className="mx-auto max-w-7xl grid gap-14 lg:grid-cols-[1.05fr_.95fr] items-center">
   <motion.div initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:.65}}>
    <p className="eyebrow">GLOBAL PARCEL TRACKING</p><h1 className="mt-4 text-5xl sm:text-7xl font-black leading-[.95] tracking-[-.04em]">Ship globally.<br/><span className="text-cyanx">Track instantly.</span></h1>
    <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">A modern logistics platform for shipment creation, tracking and delivery visibility — built around one simple tracking experience.</p>
    <form onSubmit={e=>{e.preventDefault();if(n.trim())r.push('/track?number='+encodeURIComponent(n.trim()))}} className="track-search mt-8 flex flex-col gap-3 sm:flex-row"><input value={n} onChange={e=>setN(e.target.value)} placeholder="Enter tracking number" className="flex-1 bg-transparent p-4 outline-none"/><button className="rounded-2xl bg-cyanx px-7 py-4 font-bold text-[#03101b] hover:-translate-y-0.5">Track Parcel</button></form>
    <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-500"><span className="status-dot">Live tracking</span><span>Secure customer access</span><span>Admin-controlled updates</span></div>
   </motion.div>
   <motion.div initial={{opacity:0,scale:.94,y:20}} animate={{opacity:1,scale:1,y:0}} transition={{duration:.7,delay:.12}} className="relative">
    <div className="orb orb-one"/><div className="orb orb-two"/>
    <div className="glass shipment-preview float-slow rounded-[2rem] p-7 atlas-glow"><div className="flex justify-between"><div><p className="text-xs uppercase tracking-[.2em] text-slate-500">Live shipment</p><p className="mt-2 text-2xl font-black">ATL-2026-A81F4C92</p></div><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">In transit</span></div>
     <div className="mt-9 space-y-6">{['Shipment received — Los Angeles, CA','Departed facility — Dallas Distribution Center','In transit — Dallas, TX'].map((x,i)=><motion.div key={x} initial={{opacity:0,x:15}} animate={{opacity:1,x:0}} transition={{delay:.55+i*.15}} className="flex gap-4"><span className={`timeline-dot ${i===2?'active':''}`}/><div><p className="font-semibold">{x.split(' — ')[0]}</p><p className="text-sm text-cyanx">{x.split(' — ')[1]}</p></div></motion.div>)}</div>
     <div className="mt-8 rounded-2xl border border-white/10 bg-black/10 p-4"><div className="flex justify-between text-xs text-slate-500"><span>Estimated progress</span><span>68%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5"><motion.div initial={{width:0}} animate={{width:'68%'}} transition={{duration:1.2,delay:.4}} className="h-full rounded-full bg-cyanx"/></div></div>
    </div>
   </motion.div>
  </div></section>
  <section className="mx-auto max-w-7xl px-5 py-24"><div className="mb-10 max-w-2xl"><p className="eyebrow">BUILT FOR CLARITY</p><h2 className="mt-3 text-4xl font-black">Everything your shipment needs.</h2></div><div className="grid gap-5 md:grid-cols-3">{features.map(([a,b],i)=><AnimatedCard key={a} delay={i*.08} className="glass feature-card rounded-3xl p-7 atlas-glow"><span className="feature-number">0{i+1}</span><h2 className="mt-10 text-xl font-bold">{a}</h2><p className="mt-3 leading-7 text-slate-400">{b}</p></AnimatedCard>)}</div></section>
  <section className="cta-band px-5 py-20 text-center"><p className="eyebrow">READY WHEN YOU ARE</p><h2 className="mt-3 text-4xl font-black">Move your logistics forward.</h2><Link href="/register" className="mt-7 inline-block rounded-xl bg-cyanx px-7 py-3 font-bold text-[#03101b] hover:-translate-y-1">Create Account</Link></section>
 </main>
}
