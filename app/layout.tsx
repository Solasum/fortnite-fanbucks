import type { Metadata } from 'next'
import { Rajdhani } from 'next/font/google'
import './globals.css'

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
})

export const metadata: Metadata = {
  title: 'FortniteFandom.wiki — Esports Betting with FanBucks',
  description:
    'The #1 Fortnite esports wiki and virtual betting platform. Bet FanBucks on your favourite Fortnite teams and climb the leaderboard!',
  openGraph: {
    title: 'FortniteFandom.wiki',
    description: 'Virtual Fortnite esports betting with FanBucks',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={rajdhani.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
