import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '芯片替代查询工具 - Chip Replacement Tool',
  description: '在线芯片替代型号查询工具，支持图片识别和批量查询',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} tech-grid`}>
        {children}
      </body>
    </html>
  )
}