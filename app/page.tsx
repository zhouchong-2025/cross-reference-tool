'use client';

import { useState, useCallback } from 'react';
import SearchForm from '@/components/SearchForm';
import ResultsTable from '@/components/ResultsTable';
import ExportButton from '@/components/ExportButton';
import Header from '@/components/Header';
import { ChipData } from '@/types';

export default function Home() {
  const [searchResults, setSearchResults] = useState<ChipData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleSearch = useCallback(async (query: string | string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: Array.isArray(query) ? query : [query],
          type: Array.isArray(query) ? 'batch' : 'single'
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSearchResults(result.data);
        // 添加搜索历史
        const newHistory = Array.isArray(query) ? query : [query];
        setSearchHistory(prev => Array.from(new Set([...newHistory, ...prev])).slice(0, 10));
      } else {
        console.error('搜索失败:', result.message);
      }
    } catch (error) {
      console.error('搜索请求失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* 搜索区域 */}
          <div className="glass-effect rounded-2xl p-8">
            <SearchForm 
              onSearch={handleSearch} 
              isLoading={isLoading}
              searchHistory={searchHistory}
            />
          </div>

          {/* 结果区域 */}
          {searchResults.length > 0 && (
            <div className="glass-effect rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  查询结果 ({searchResults.length} 条)
                </h2>
                <ExportButton data={searchResults} />
              </div>
              <ResultsTable data={searchResults} />
            </div>
          )}

          {/* 空状态 */}
          {searchResults.length === 0 && !isLoading && (
            <div className="glass-effect rounded-2xl p-16 text-center">
              <div className="text-blue-300 text-lg">
                请输入芯片型号开始查询替代料
              </div>
              <div className="text-blue-400 text-sm mt-2">
                支持单个查询、批量粘贴和图片识别
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}