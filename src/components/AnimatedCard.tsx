"use client";
import { motion } from "motion/react";
export default function AnimatedCard({children,delay=0,className=""}:{children:React.ReactNode;delay?:number;className?:string}){return <motion.div initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}} transition={{duration:.5,delay,ease:[.22,1,.36,1]}} whileHover={{y:-5}} className={className}>{children}</motion.div>}
