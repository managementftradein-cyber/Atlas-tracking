"use client";
import { motion } from "motion/react";
export default function PageTransition({children}:{children:React.ReactNode}){return <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.45,ease:[.22,1,.36,1]}}>{children}</motion.div>}
