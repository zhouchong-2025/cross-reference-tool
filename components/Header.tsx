export default function Header() {
  return (
    <header className="glass-effect border-b border-blue-500/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg 
                className="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" 
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Teampo 芯片替代查询工具
              </h1>
              <p className="text-blue-300 text-sm">
                Teampo Cross Reference Tool
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-blue-300 text-sm">
              支持单个/批量/图片识别/在线导出
            </div>
            <div className="text-blue-400 text-xs mt-1 opacity-80">
              teampo cross reference v1.0
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}