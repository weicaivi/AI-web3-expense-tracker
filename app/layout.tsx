import './globals.css'
import './polyfills'
import { Inter } from 'next/font/google'
import { WalletProvider } from '@/components/WalletConnect'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Web3 Expense Tracker',
  description: 'AI-powered Web3 expense tracking app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
