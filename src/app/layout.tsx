import type { Metadata } from 'next'; import './globals.css'; import Navbar from '@/components/Navbar';
export const metadata:Metadata={title:'Atlas Tracking — Global Parcel Tracking',description:'Atlas Tracking — modern U.S.-based shipment tracking and delivery visibility platform'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Navbar/>{children}</body></html>}
