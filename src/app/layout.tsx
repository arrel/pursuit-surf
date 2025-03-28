import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import PursuitProviderWrapper from '@/components/PursuitProviderWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Primer Pursuit Planner',
  description: 'Design immersive, interdisciplinary learning experiences',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} custom-scrollbar`}>
        <PursuitProviderWrapper>
          {children}
        </PursuitProviderWrapper>
      </body>
    </html>
  )
}
