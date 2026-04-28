import './globals.css';

export const metadata = {
  title: 'РАВОНИ — Платформаи Психологӣ',
  description: 'Ташхиси ҳолати эмотсионалӣ ва равонии шумо',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tg">
      <body>{children}</body>
    </html>
  );
}