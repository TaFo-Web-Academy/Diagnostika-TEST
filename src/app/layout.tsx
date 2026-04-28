import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['cyrillic', 'latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'РАВОНИ - Платформаи психологӣ',
  description: 'Тестҳои психологӣ барои шинохти худ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tj">
      <body className={`${inter.variable} font-sans bg-cream-100 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
