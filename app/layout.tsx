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
        {/* 版本信息 - 固定在右下角 */}
        <div className="fixed bottom-4 right-4 text-white/40 text-xs font-light tracking-wide z-50 pointer-events-none">
          Teampo Intelligence v1.0
        </div>
      </body>
    </html>
  )
}