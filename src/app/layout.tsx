import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title:'SCommerce AI', description:'AI-powered product page generator for online sellers.' };

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}