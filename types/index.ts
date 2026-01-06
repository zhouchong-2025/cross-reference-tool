export interface ChipData {
  originalModel: string;
  originalBrand?: string; // 添加原型号品牌
  replacementModel: string;
  brand: string; // 替代料品牌
  function: string;
  replaceType: 'P2P' | '功能替代';
}

export interface SearchResult {
  success: boolean;
  data: ChipData[];
  message?: string;
}

export interface ImageRecognitionResult {
  success: boolean;
  recognizedText: string;
  confidence?: number;
}

export interface BatchSearchInput {
  models: string[];
  type: 'single' | 'batch' | 'image';
}