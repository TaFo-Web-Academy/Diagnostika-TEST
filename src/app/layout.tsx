import './globals.css';

export const metadata = {
  title: 'РАВОНИ — Платформаи Психологӣ',
  description: 'Ташхиси ҳолати эмотсионалӣ ва равонии шумо',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#3d5a41',
  appleMobileWebAppCapable: 'yes',
  appleMobileWebAppStatusBarStyle: 'default',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tg" suppressHydrationWarning>
      <body className="antialiased">
        <div id="toast-container" className="toast-container" />
        {children}
      </body>
    </html>
  );
}
