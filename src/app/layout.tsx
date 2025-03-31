import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import PursuitProviderWrapper from '@/components/PursuitProviderWrapper'
import { PromptProvider } from '@/context/PromptContext'
import Footer from '@/components/Footer'

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
      <body className={`${inter.className} custom-scrollbar flex flex-col min-h-screen`}>
        <PromptProvider>
          <PursuitProviderWrapper>
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
          </PursuitProviderWrapper>
        </PromptProvider>
      </body>
    </html>
  )
}
