'use client';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Route } from 'lucide-react';

export default function Logo({ href, size = 36 }: { href?: string; size?: number }) {
  const mark = (
    <motion.span
      whileHover={{ rotate: -8, scale: 1.08 }}
      className="grid place-items-center rounded-xl bg-cyanx text-[#03101b]"
      style={{ width: size, height: size }}
    >
      <Route size={Math.round(size * 0.55)} strokeWidth={2.5} />
    </motion.span>
  );

  const content = (
    <span className="flex items-center gap-2 text-xl font-black tracking-tight">
      {mark}
      <span>Atlas <span className="text-cyanx">Tracking</span></span>
    </span>
  );

  if (!href) return content;
  return <Link href={href} className="group">{content}</Link>;
}
