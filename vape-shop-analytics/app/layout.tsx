import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vape Shop Analytics System',
  description: 'Business Analytics Information System for Vape Shop',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}

