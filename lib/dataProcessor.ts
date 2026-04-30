import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { ChipData } from '@/types';

class DataProcessor {
  private data: ChipData[] = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      let filePath = path.join(process.cwd(), 'database', 'cross reference table.xlsx');
      const backupPath = path.join(process.cwd(), 'database', 'cross reference table_backup.xlsx');
      
      console.log('尝试读取Excel文件:', filePath);
      console.log('文件是否存在:', fs.existsSync(filePath));
      
      if (!fs.existsSync(filePath)) {
        console.log('数据库文件不存在，使用示例数据...');
        this.createComprehensiveData();
        this.initialized = true;
        return;
      }
      
      try {
        // 检查文件状态
        const stats = fs.statSync(filePath);
        console.log('文件大小:', Math.round(stats.size / 1024), 'KB');
        console.log('文件修改时间:', stats.mtime);
        
        fs.accessSync(filePath, fs.constants.R_OK);
        console.log('文件可读');
        
        console.log('开始读取Excel文件...');
        
        // 尝试读取文件的二进制内容
        console.log('读取文件二进制内容...');
        const fileBuffer = fs.readFileSync(filePath);
        console.log('文件缓冲区大小:', fileBuffer.length, 'bytes');
        
        // 尝试使用缓冲区创建工作簿
        let workbook;
        try {
          workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
          console.log('成功从缓冲区读取Excel文件');
        } catch (bufferError) {
          console.log('缓冲区读取失败:', bufferError instanceof Error ? bufferError.message : bufferError);
          // 回退到直接文件读取
          try {
            workbook = XLSX.readFile(filePath, { cellDates: true });
            console.log('成功读取主Excel文件');
          } catch (mainError) {
            console.log('主文件读取失败，尝试备份文件:', mainError instanceof Error ? mainError.message : mainError);
            if (fs.existsSync(backupPath)) {
              workbook = XLSX.readFile(backupPath, { cellDates: true });
              console.log('成功读取备份Excel文件');
              filePath = backupPath;
            } else {
              throw mainError;
            }
          }
        }
        console.log('工作表数量:', workbook.SheetNames.length);
        console.log('所有工作表名称:', workbook.SheetNames);
        
        // 需要读取的工作表列表（跳过说明类工作表）
        const skipSheets = ['使用说明'];
        const targetSheets = workbook.SheetNames.filter(name => !skipSheets.includes(name));
        console.log('将读取工作表:', targetSheets);

        const allRows: ChipData[] = [];

        for (const sheetName of targetSheets) {
          const worksheet = workbook.Sheets[sheetName];
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
          console.log(`工作表"${sheetName}"范围: 行${range.e.r + 1}, 列${range.e.c + 1}`);

          // 以数组形式读取，手动定位表头行
          const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // 找到包含"型号"和"品牌"的表头行
          let headerRowIndex = -1;
          for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
            const row = rawRows[i];
            if (row && row.some(c => String(c || '').includes('型号')) && row.some(c => String(c || '').includes('品牌'))) {
              headerRowIndex = i;
              break;
            }
          }

          if (headerRowIndex === -1) {
            console.log(`工作表"${sheetName}"未找到标准表头，跳过`);
            continue;
          }

          const headers: string[] = rawRows[headerRowIndex].map(c => String(c || '').trim());
          console.log(`工作表"${sheetName}"表头(行${headerRowIndex}):`, headers);

          // 定位列索引：目标料区域(型号/品牌/功能/封装) + 替代料区域(品牌/型号/备注/优势)
          // 表头格式: ["型号","品牌","功能","封装","品牌","型号","备注","替代料优势点"]
          const colOrigModel = headers.indexOf('型号');
          const colOrigBrand = headers.indexOf('品牌');
          const colOrigFunc = headers.indexOf('功能');
          // 替代料的"品牌"和"型号"是第二次出现
          const colRepBrand = headers.indexOf('品牌', colOrigBrand + 1);
          const colRepModel = headers.indexOf('型号', colOrigModel + 1);
          const colNotes = headers.indexOf('备注');
          const colAdvantages = headers.findIndex(h => h.includes('优势'));

          if (colOrigModel === -1 || colRepModel === -1) {
            console.log(`工作表"${sheetName}"列结构不匹配，跳过`);
            continue;
          }

          for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
            const row = rawRows[i];
            if (!row) continue;
            const originalModel = String(row[colOrigModel] || '').trim();
            const originalBrand = String(colOrigBrand >= 0 ? (row[colOrigBrand] || '') : '').trim();
            const originalFunction = String(colOrigFunc >= 0 ? (row[colOrigFunc] || '') : '').trim();
            const replacementBrand = String(colRepBrand >= 0 ? (row[colRepBrand] || '') : '').trim();
            const replacementModel = String(row[colRepModel] || '').trim();
            const notes = String(colNotes >= 0 ? (row[colNotes] || '') : '').trim();
            const advantages = String(colAdvantages >= 0 ? (row[colAdvantages] || '') : '').trim();

            if (!originalModel || originalModel === '型号' || !replacementModel || replacementModel === '型号') {
              continue;
            }

            const replaceType = this.determineReplaceType(notes, advantages);
            allRows.push({
              originalModel,
              originalBrand,
              replacementModel,
              brand: replacementBrand,
              function: originalFunction || '未描述',
              replaceType
            } as ChipData);
          }

          console.log(`工作表"${sheetName}"解析完成，累计记录: ${allRows.length}`);
        }

        this.data = allRows;
        
        this.initialized = true;
        console.log(`✅ 数据库初始化完成，有效记录数: ${this.data.length}`);
        
        console.log('前3条有效记录:');
        this.data.slice(0, 3).forEach((item, index) => {
          console.log(`${index + 1}. ${item.originalModel} (${item.originalBrand}) -> ${item.replacementModel} (${item.brand}) [${item.replaceType}]`);
        });
        
      } catch (accessError) {
        console.log('文件权限问题，使用综合示例数据:', accessError instanceof Error ? accessError.message : accessError);
        throw accessError;
      }
      
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error instanceof Error ? error.message : error);
      console.log('回退到综合示例数据...');
      this.createComprehensiveData();
      this.initialized = true;
    }
  }

  private determineReplaceType(notes: string, advantages: string): 'P2P' | '功能替代' {
    const notesLower = notes.toLowerCase();
    const advantagesLower = (advantages || '').toLowerCase();
    
    if (notesLower.includes('非p2p') || notesLower.includes('非 p2p') ||
        advantagesLower.includes('非p2p') || advantagesLower.includes('非 p2p')) {
      return '功能替代';
    }
    
    if (notes === 'P2P' || 
        notes === 'p2p' ||
        notes.startsWith('P2P,') ||
        notes.startsWith('P2P，') ||
        notes.includes('P2P，计划') ||
        notes.includes('P2P，非车规') ||
        notes.includes('P2P，车规') ||
        notes.includes('P2P，参数') ||
        advantagesLower.includes('p2p')) {
      return 'P2P';
    }
    
    if (notesLower.includes('pin2pin') || notesLower.includes('pin to pin') ||
        advantagesLower.includes('pin2pin') || advantagesLower.includes('pin to pin')) {
      return 'P2P';
    }
    
    return '功能替代';
  }

  private createComprehensiveData() {
    this.data = [
      // LM63635系列 (非P2P)
      {
        originalModel: 'LM63635DQDRRRQ1',
        originalBrand: 'TI',
        replacementModel: 'TPP363072Q-FC6R-S',
        brand: '3peak',
        function: '汽车类3.5V 至36V 3.25A 降压转换器',
        replaceType: '功能替代'
      },
      {
        originalModel: 'LM63635DQPWPRQ1',
        originalBrand: 'TI',
        replacementModel: 'SA24535',
        brand: 'Silergy(矽力杰)',
        function: '汽车类降压转换器',
        replaceType: '功能替代'
      },
      
      // TLV73333系列 - 根据Excel真实数据修正
      {
        originalModel: 'TLV73333PDBVR',
        originalBrand: 'TI',
        replacementModel: 'TPL730F33-5TR',
        brand: '3peak(思瑞浦)',
        function: '低压差稳压器 LDO',
        replaceType: 'P2P'
      },
      {
        originalModel: 'TLV73333PDBVR SOT23-5',
        originalBrand: 'TI',
        replacementModel: 'TPL730F33-5TR',
        brand: '3peak(思瑞浦)',
        function: '低压差稳压器 LDO SOT23-5封装',
        replaceType: 'P2P'
      },
      {
        originalModel: 'TLV73333PDBVT',
        originalBrand: 'TI',
        replacementModel: 'TPL730F33-5TR',
        brand: '3peak(思瑞浦)',
        function: '低压差稳压器 LDO',
        replaceType: 'P2P'
      },
      {
        originalModel: 'TLV73333PDBVR',
        originalBrand: 'TI',
        replacementModel: 'SA21307A33ABT',
        brand: 'Silergy(矽力杰)',
        function: '低压差稳压器 LDO 3.3V',
        replaceType: 'P2P'
      },
      {
        originalModel: 'TLV73333PQDBVRQ1',
        originalBrand: 'TI',
        replacementModel: 'TPL905233-S5TR-S',
        brand: '3peak(思瑞浦)',
        function: '车规级低压差稳压器',
        replaceType: 'P2P'
      },
      {
        originalModel: 'TLV73333PQDRVRQ1',
        originalBrand: 'TI',
        replacementModel: 'SA21307A',
        brand: 'Silergy(矽力杰)',
        function: '车规级低压差稳压器',
        replaceType: '功能替代'
      },
      {
        originalModel: 'TLV73333PDQNR',
        originalBrand: 'TI',
        replacementModel: 'TPL730F33-FR',
        brand: '3peak(思瑞浦)',
        function: '低压差稳压器',
        replaceType: 'P2P'
      },
      {
        originalModel: 'TLV73333PDQNT',
        originalBrand: 'TI',
        replacementModel: 'TPL730F33-FR',
        brand: '3peak(思瑞浦)',
        function: '低压差稳压器',
        replaceType: 'P2P'
      },
      
      // 其他常见型号
      {
        originalModel: 'LM4050QAEM3X5.0/NOPB',
        originalBrand: 'TI(德州仪器)',
        replacementModel: 'TPR6040F50-S3TR-S',
        brand: '3peak(思瑞浦)',
        function: '电压基准',
        replaceType: 'P2P'
      },
      {
        originalModel: 'LM2903AVQDRG4Q1',
        originalBrand: 'TI',
        replacementModel: 'LM2903AL1-SR',
        brand: '3peak(思瑞浦)',
        function: '双路比较器',
        replaceType: 'P2P'
      },
      {
        originalModel: 'STM32F103C8T6',
        originalBrand: 'STMicroelectronics',
        replacementModel: 'GD32F103C8T6', 
        brand: 'GigaDevice',
        function: '32位ARM Cortex-M3微控制器',
        replaceType: 'P2P'
      },
      
      // TLV其他系列
      {
        originalModel: 'TLV73318PDBVR',
        originalBrand: 'TI',
        replacementModel: 'TPL730F18-5TR',
        brand: '3peak(思瑞浦)',
        function: '1.8V低压差稳压器',
        replaceType: 'P2P'
      },
      {
        originalModel: 'TLV70230QDBVRQ1',
        originalBrand: 'TI',
        replacementModel: 'TPL730F30-5TR',
        brand: '3peak(思瑞浦)',
        function: '3.0V低压差稳压器',
        replaceType: 'P2P'
      }
    ];
    console.log(`✅ 创建修正P2P标识的综合示例数据完成，共 ${this.data.length} 条记录`);
    
    const p2pCount = this.data.filter(item => item.replaceType === 'P2P').length;
    const functionalCount = this.data.filter(item => item.replaceType === '功能替代').length;
    console.log(`📊 P2P记录: ${p2pCount}条, 功能替代: ${functionalCount}条`);
    console.log('✅ 已添加原型号品牌信息');
  }

  async search(queries: string[]): Promise<ChipData[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const results: ChipData[] = [];
    
    for (const query of queries) {
      const normalizedQuery = this.normalizeModel(query);
      console.log(`🔎 规范化查询词: "${query}" -> "${normalizedQuery}"`);
      
      const matches = this.data.filter(item => {
        const normalizedOriginal = this.normalizeModel(item.originalModel);
        
        // 修复匹配逻辑 - 更严格的匹配
        const isMatch = this.strictMatch(normalizedQuery, normalizedOriginal, item.originalModel);
        
        if (isMatch) {
          console.log(`  ✅ 匹配: "${item.originalModel}" -> ${item.replacementModel} [${item.replaceType}]`);
        }
        
        return isMatch;
      });
      
      console.log(`查询"${query}"找到${matches.length}条匹配`);
      results.push(...matches);
    }

    const uniqueResults = results.filter((item, index, self) => 
      index === self.findIndex(t => 
        t.originalModel === item.originalModel && 
        t.replacementModel === item.replacementModel
      )
    );

    console.log(`🔍 搜索"${queries.join(', ')}"找到 ${uniqueResults.length} 条结果`);
    
    if (uniqueResults.length > 0) {
      console.log('匹配记录:');
      uniqueResults.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.originalModel} (${item.originalBrand}) -> ${item.replacementModel} (${item.brand}) [${item.replaceType}]`);
      });
    } else {
      console.log('❌ 未找到匹配记录，请检查型号是否正确');
      const suggestions = this.getSuggestions(queries[0]);
      if (suggestions.length > 0) {
        console.log('💡 相似型号建议:', suggestions.slice(0, 3).map(s => s.originalModel).join(', '));
      }
    }
    
    return uniqueResults;
  }

  private strictMatch(query: string, target: string, originalModel: string): boolean {
    // 1. 完全匹配
    if (query === target) {
      return true;
    }
    
    // 2. 目标包含查询 (target contains query)
    if (target.includes(query) && query.length >= 4) {
      return true;
    }
    
    // 3. 查询包含目标 (query contains target) - 但目标要足够长
    if (query.includes(target) && target.length >= 4) {
      return true;
    }
    
    // 4. 前缀匹配 - 更严格的条件
    if (target.startsWith(query) && query.length >= 5) {
      return true;
    }
    
    // 5. 针对特定型号系列的匹配
    if (this.isTargetedSeriesMatch(query, target, originalModel)) {
      return true;
    }
    
    return false;
  }

  private isTargetedSeriesMatch(query: string, target: string, originalModel: string): boolean {
    // 特定系列匹配 - 只匹配相关系列
    
    // TLV73333系列：查询包含73333应该只匹配TLV73333系列
    if (query.includes('73333')) {
      return target.includes('TLV73333') || target.includes('73333');
    }
    
    // LM63635系列：查询包含63635应该只匹配LM63635系列
    if (query.includes('63635')) {
      return target.includes('LM63635') || target.includes('63635');
    }
    
    // STM32系列
    if (query.includes('STM32') || query.startsWith('STM')) {
      return target.includes('STM32');
    }
    
    // LM4050系列
    if (query.includes('4050') && query.startsWith('LM')) {
      return target.includes('LM4050');
    }
    
    // 对于纯数字查询，要更加严格
    if (/^\d+$/.test(query)) {
      // 只有当查询数字在目标中作为连续数字出现时才匹配
      return target.includes(query) && this.isContiguousNumberMatch(query, target);
    }
    
    return false;
  }

  private isContiguousNumberMatch(query: string, target: string): boolean {
    // 确保数字是连续出现的，不是分散的
    const index = target.indexOf(query);
    if (index === -1) return false;
    
    // 检查前后是否是字母，确保是一个完整的数字部分
    const before = index > 0 ? target[index - 1] : '';
    const after = index + query.length < target.length ? target[index + query.length] : '';
    
    // 前面应该是字母，后面可以是字母或者结束
    return /[A-Z]/.test(before) && (/[A-Z]|$/.test(after));
  }

  private normalizeModel(model: string): string {
    return model
      .toUpperCase()
      .replace(/[\s\-_\/]/g, '')
      .replace(/[^A-Z0-9]/g, '');
  }

  private getSuggestions(query: string): ChipData[] {
    const normalized = this.normalizeModel(query);
    return this.data.filter(item => {
      const target = this.normalizeModel(item.originalModel);
      return this.calculateSimilarity(normalized, target) > 0.6;
    }).slice(0, 5);
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  getAllData(): ChipData[] {
    return this.data;
  }

  getDataStats() {
    return {
      total: this.data.length,
      p2p: this.data.filter(item => item.replaceType === 'P2P').length,
      functional: this.data.filter(item => item.replaceType === '功能替代').length
    };
  }
}

export const dataProcessor = new DataProcessor();