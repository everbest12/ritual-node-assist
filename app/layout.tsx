import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RITUAL_AI - Decentralized AI Infrastructure Assistant',
  description: 'Powered by Ritual Network - The future of decentralized AI infrastructure. Ask about zero-knowledge proofs, cross-chain AI, and community governance.',
  keywords: 'Ritual Network, decentralized AI, blockchain, zero-knowledge proofs, cross-chain, DAO, $RITUAL',
  authors: [{ name: 'Ritual Network' }],
  openGraph: {
    title: 'RITUAL_AI - Decentralized AI Infrastructure',
    description: 'Powered by Ritual Network - The future of decentralized AI infrastructure',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
