'use client';

import { useState, useCallback } from 'react';
import SearchForm from '@/components/SearchForm';
import ResultsTable from '@/components/ResultsTable';
import ExportButton from '@/components/ExportButton';
import Header from '@/components/Header';
import { ChipData } from '@/types';

export default function Home() {
  // 为每个搜索类型创建独立的结果状态
  const [singleResults, setSingleResults] = useState<ChipData[]>([]);
  const [batchResults, setBatchResults] = useState<ChipData[]>([]);
  const [imageResults, setImageResults] = useState<ChipData[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 为每个搜索类型创建独立的搜索状态标记
  const [hasSingleSearched, setHasSingleSearched] = useState(false);
  const [hasBatchSearched, setHasBatchSearched] = useState(false);
  const [hasImageSearched, setHasImageSearched] = useState(false);

  // 当前选中的搜索类型
  const [currentSearchType, setCurrentSearchType] = useState<'single' | 'batch' | 'image'>('single');

  const handleSearch = useCallback(async (query: string | string[], searchType: 'single' | 'batch' | 'image') => {
    setIsLoading(true);

    // 根据搜索类型设置对应的搜索状态
    if (searchType === 'single') {
      setHasSingleSearched(true);
    } else if (searchType === 'batch') {
      setHasBatchSearched(true);
    } else if (searchType === 'image') {
      setHasImageSearched(true);
    }

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
        // 根据搜索类型更新对应的结果状态
        if (searchType === 'single') {
          setSingleResults(result.data);
        } else if (searchType === 'batch') {
          setBatchResults(result.data);
        } else if (searchType === 'image') {
          setImageResults(result.data);
        }

        // 添加搜索历史
        const newHistory = Array.isArray(query) ? query : [query];
        setSearchHistory(prev => Array.from(new Set([...newHistory, ...prev])).slice(0, 10));
      } else {
        console.error('搜索失败:', result.message);
        // 根据搜索类型清空对应的结果
        if (searchType === 'single') {
          setSingleResults([]);
        } else if (searchType === 'batch') {
          setBatchResults([]);
        } else if (searchType === 'image') {
          setImageResults([]);
        }
      }
    } catch (error) {
      console.error('搜索请求失败:', error);
      // 根据搜索类型清空对应的结果
      if (searchType === 'single') {
        setSingleResults([]);
      } else if (searchType === 'batch') {
        setBatchResults([]);
      } else if (searchType === 'image') {
        setImageResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 根据当前搜索类型获取对应的结果和状态
  const getCurrentResults = () => {
    if (currentSearchType === 'single') return singleResults;
    if (currentSearchType === 'batch') return batchResults;
    return imageResults;
  };

  const getCurrentHasSearched = () => {
    if (currentSearchType === 'single') return hasSingleSearched;
    if (currentSearchType === 'batch') return hasBatchSearched;
    return hasImageSearched;
  };

  const searchResults = getCurrentResults();
  const hasSearched = getCurrentHasSearched();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="space-y-8 flex-1">
          {/* 搜索区域 */}
          <div className="glass-effect rounded-2xl p-8">
            <SearchForm
              onSearch={handleSearch}
              onSearchTypeChange={setCurrentSearchType}
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
              {hasSearched ? (
                // 搜索后无结果
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="text-yellow-300 text-xl font-medium">
                    未找到相关替代料
                  </div>
                  <div className="text-blue-300 text-base">
                    资料库没有相关替代推荐
                  </div>
                  <div className="text-blue-400 text-sm mt-4 bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 inline-block">
                    💡 可联系 <span className="font-semibold text-blue-300">Teampo FAE</span> 获取专业支持
                  </div>
                </div>
              ) : (
                // 初始状态
                <div>
                  <div className="text-blue-300 text-lg">
                    请输入芯片型号开始查询替代料
                  </div>
                  <div className="text-blue-400 text-sm mt-2">
                    支持单个查询、批量粘贴和图片识别
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部版本信息 - 与右上角版本号对齐 */}
        <div className="mt-auto pt-16 pb-8 text-right">
          <div className="text-blue-400 text-xs opacity-80">
            Teampo Intelligence v1.0
          </div>
        </div>
      </main>
    </div>
  );
}