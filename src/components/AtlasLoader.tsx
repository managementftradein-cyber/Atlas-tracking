"use client";
import { motion } from "motion/react";
export default function AtlasLoader({label="Loading Atlas Tracking..."}:{label?:string}){return <div className="grid min-h-[45vh] place-items-center"><div className="text-center"><motion.div animate={{rotate:360}} transition={{duration:1.35,repeat:Infinity,ease:"linear"}} className="mx-auto h-10 w-10 rounded-full border-2 border-white/10 border-t-cyanx"/><p className="mt-4 text-sm text-slate-500">{label}</p></div></div>}
