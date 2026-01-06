'use client';

import { ChipData } from '@/types';

interface ResultsTableProps {
  data: ChipData[];
}

export default function ResultsTable({ data }: ResultsTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-blue-300">
        暂无查询结果
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-blue-400/30">
            <th className="text-left py-4 px-4 text-blue-200 font-medium">序号</th>
            <th className="text-left py-4 px-4 text-blue-200 font-medium">原型号</th>
            <th className="text-left py-4 px-4 text-blue-200 font-medium">原厂牌</th>
            <th className="text-left py-4 px-4 text-blue-200 font-medium">替代型号</th>
            <th className="text-left py-4 px-4 text-blue-200 font-medium">替代厂牌</th>
            <th className="text-left py-4 px-4 text-blue-200 font-medium">功能描述</th>
            <th className="text-left py-4 px-4 text-blue-200 font-medium">替代类型</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={`${item.originalModel}-${item.replacementModel}-${index}`}
              className="border-b border-blue-500/10 hover:bg-white/5 transition-colors"
            >
              <td className="py-4 px-4 text-blue-100">{index + 1}</td>
              <td className="py-4 px-4">
                <span className="bg-blue-600/20 text-blue-200 px-2 py-1 rounded font-mono text-sm">
                  {item.originalModel}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-blue-300 text-sm">
                  {item.originalBrand || '-'}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="bg-green-600/20 text-green-200 px-2 py-1 rounded font-mono text-sm">
                  {item.replacementModel}
                </span>
              </td>
              <td className="py-4 px-4 text-blue-100">{item.brand}</td>
              <td className="py-4 px-4 text-blue-100 max-w-xs">
                <div className="truncate" title={item.function}>
                  {item.function}
                </div>
              </td>
              <td className="py-4 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${
                    item.replaceType === 'P2P'
                      ? 'bg-emerald-600/20 text-emerald-200'
                      : 'bg-amber-600/20 text-amber-200'
                  }`}
                >
                  {item.replaceType}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}