'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

interface SearchFormProps {
  onSearch: (query: string | string[], searchType: 'single' | 'batch' | 'image') => void;
  onSearchTypeChange: (searchType: 'single' | 'batch' | 'image') => void;
  isLoading: boolean;
  searchHistory: string[];
}

export default function SearchForm({ onSearch, onSearchTypeChange, isLoading, searchHistory }: SearchFormProps) {
  const [singleInput, setSingleInput] = useState('');
  const [batchInput, setBatchInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [searchType, setSearchType] = useState<'single' | 'batch' | 'image'>('single');
  const [recognizedText, setRecognizedText] = useState('');
  const [recognizedModels, setRecognizedModels] = useState<string[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [pastedImage, setPastedImage] = useState<string | null>(null);

  // 处理粘贴事件
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    if (searchType !== 'image') return;
    
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await processImageFile(file);
        }
        break;
      }
    }
  }, [searchType]);

  // 处理图片文件
  const processImageFile = async (file: File) => {
    setIsRecognizing(true);
    setRecognizedText('');

    // 创建图片预览URL
    const imageUrl = URL.createObjectURL(file);
    setPastedImage(imageUrl);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/vision', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setRecognizedText(result.recognizedText);
        const models = result.chipModels || result.recognizedText.split(/[,，\n\r]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        setRecognizedModels(models);
        setImageInput(models.join(', '));

        // 移除自动搜索，等待用户确认
      } else {
        alert(`识别失败: ${result.message}`);
      }
    } catch (error) {
      console.error('图像识别失败:', error);
      alert('图像识别失败，请重试');
    } finally {
      setIsRecognizing(false);
    }
  };

  // 添加粘贴事件监听
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => handlePaste(e);
    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, [handlePaste]);

  // 根据搜索类型获取当前输入值
  const getCurrentInput = () => {
    switch (searchType) {
      case 'single':
        return singleInput;
      case 'batch':
        return batchInput;
      case 'image':
        return imageInput;
      default:
        return '';
    }
  };

  // 根据搜索类型设置输入值
  const setCurrentInput = (value: string) => {
    switch (searchType) {
      case 'single':
        setSingleInput(value);
        break;
      case 'batch':
        setBatchInput(value);
        break;
      case 'image':
        setImageInput(value);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentInput = getCurrentInput();
    if (!currentInput.trim()) return;

    if (searchType === 'batch') {
      const queries = currentInput
        .split(/[,，\n\r\s]+/)
        .map(q => q.trim())
        .filter(q => q.length > 0);
      onSearch(queries, searchType);
    } else {
      onSearch(currentInput.trim(), searchType);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    await processImageFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    disabled: isRecognizing || isLoading
  });

  return (
    <div className="space-y-6">
      {/* 搜索类型选择 */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => {
            setSearchType('single');
            onSearchTypeChange('single');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            searchType === 'single'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-white/10 text-blue-300 hover:bg-white/20'
          }`}
        >
          单个查询
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchType('batch');
            onSearchTypeChange('batch');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            searchType === 'batch'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-white/10 text-blue-300 hover:bg-white/20'
          }`}
        >
          批量查询
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchType('image');
            onSearchTypeChange('image');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            searchType === 'image'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-white/10 text-blue-300 hover:bg-white/20'
          }`}
        >
          图片识别
        </button>
      </div>

      {/* 搜索表单 */}
      {searchType !== 'image' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-blue-200 text-sm font-medium">
              {searchType === 'single' ? '芯片型号' : '芯片型号 (用逗号或换行分隔)'}
            </label>
            {searchType === 'single' ? (
              <input
                type="text"
                value={singleInput}
                onChange={(e) => setSingleInput(e.target.value)}
                placeholder="请输入芯片型号，如: STM32F103C8T6"
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            ) : (
              <textarea
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder="请输入多个芯片型号，用逗号或换行分隔，如：&#10;STM32F103C8T6, ATmega328P&#10;LM358&#10;NE555"
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                disabled={isLoading}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={!getCurrentInput().trim() || isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>搜索中...</span>
              </div>
            ) : (
              '开始查询'
            )}
          </button>
        </form>
      )}

      {/* 图片上传区域 */}
      {searchType === 'image' && (
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all relative ${
              isDragActive
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-blue-400/50 hover:border-blue-400 hover:bg-white/5'
            } ${isRecognizing || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            
            {/* 图片预览覆盖层 */}
            {pastedImage && (
              <div className="absolute inset-0 bg-blue-900/90 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <img 
                    src={pastedImage} 
                    alt="已粘贴的图片" 
                    className="max-w-full max-h-64 object-contain border border-blue-400/50 rounded-lg bg-white/10 mx-auto mb-4"
                  />
                  <div className="text-blue-200 mb-2">
                    {isRecognizing ? '正在识别芯片型号...' : '图片已粘贴'}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPastedImage(null);
                      setRecognizedText('');
                      setRecognizedModels([]);
                      setImageInput('');
                    }}
                    className="text-sm bg-red-600/80 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                  >
                    清除图片
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-blue-200 text-lg font-medium">
                  {isRecognizing ? '正在识别图片...' : '点击上传或拖拽图片'}
                </p>
                <p className="text-blue-300 text-sm mt-2">
                  支持 JPG, PNG, GIF, WebP 格式
                </p>
                <p className="text-blue-400 text-xs mt-1">
                  💡 也可以直接粘贴图片 (Ctrl+V)
                </p>
              </div>
            </div>
          </div>

          {/* 识别结果 */}
          {recognizedModels.length > 0 && (
            <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
              <h4 className="text-green-300 font-medium mb-3">识别结果（可编辑）：</h4>
              <div className="space-y-2">
                {recognizedModels.map((model, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => {
                        const newModels = [...recognizedModels];
                        newModels[index] = e.target.value;
                        setRecognizedModels(newModels);
                        setImageInput(newModels.join(', '));
                      }}
                      className="flex-1 bg-blue-600/20 text-blue-200 px-3 py-2 rounded-lg font-mono text-sm border border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="芯片型号"
                    />
                    <button
                      onClick={() => {
                        const newModels = recognizedModels.filter((_, i) => i !== index);
                        setRecognizedModels(newModels);
                        setImageInput(newModels.join(', '));
                        if (newModels.length === 0) {
                          setRecognizedText('');
                        }
                      }}
                      className="text-sm bg-red-600/80 hover:bg-red-600 text-white px-3 py-2 rounded transition-colors"
                      title="删除此料号"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => {
                    const chipModels = recognizedModels.map(s => s.trim()).filter(s => s.length > 0);
                    if (chipModels.length > 0) {
                      onSearch(chipModels, 'image');
                    }
                  }}
                  disabled={recognizedModels.filter(s => s.trim().length > 0).length === 0}
                  className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  开始查询替代料
                </button>
                <button
                  onClick={() => {
                    setRecognizedText('');
                    setRecognizedModels([]);
                    setImageInput('');
                  }}
                  className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors"
                >
                  清除
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 搜索历史 */}
      {searchHistory.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-blue-200 text-sm font-medium">最近搜索：</h4>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 5).map((term, index) => (
              <button
                key={index}
                onClick={() => setCurrentInput(term)}
                className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm hover:bg-blue-600/30 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}