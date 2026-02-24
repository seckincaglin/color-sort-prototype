import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Color Sort - Puzzle Game',
  description: 'Sort colored balls into matching tubes in this addictive puzzle game!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
