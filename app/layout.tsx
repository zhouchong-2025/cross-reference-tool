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
      <body className={`${inter.className} tech-grid relative`}>
        {children}
        {/* 版本信息 - 固定在右下角，与右上角版本号对齐 */}
        <div className="fixed bottom-4 right-8 text-blue-400 text-xs opacity-80 z-50 pointer-events-none">
          Teampo Intelligence v1.0
        </div>
      </body>
    </html>
  )
}