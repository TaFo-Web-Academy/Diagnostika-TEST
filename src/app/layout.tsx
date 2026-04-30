import './globals.css';
import { Outfit, Inter } from 'next/font/google';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'РАВОНИ — Платформаи Психологӣ',
  description: 'Ташхиси ҳолати эмотсионалӣ ва равонии шумо',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#10b981',
  appleMobileWebAppCapable: 'yes',
  appleMobileWebAppStatusBarStyle: 'default',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tg" className={`${outfit.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <div id="toast-container" className="toast-container" />
        {children}
      </body>
    </html>
  );
}
