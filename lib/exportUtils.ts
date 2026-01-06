import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ChipData } from '@/types';

export function exportToExcel(data: ChipData[], filename: string = '芯片替代查询结果') {
  try {
    const exportData = data.map((item, index) => ({
      '序号': index + 1,
      '原型号': item.originalModel,
      '替代型号': item.replacementModel,
      '厂牌': item.brand,
      '功能': item.function,
      '替代类型': item.replaceType
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '替代查询结果');

    const colWidths = [
      { wch: 8 },  // 序号
      { wch: 20 }, // 原型号
      { wch: 20 }, // 替代型号
      { wch: 15 }, // 厂牌
      { wch: 30 }, // 功能
      { wch: 12 }  // 替代类型
    ];
    worksheet['!cols'] = colWidths;

    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array' 
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    saveAs(blob, `${filename}_${timestamp}.xlsx`);

    return true;
  } catch (error) {
    console.error('Excel导出失败:', error);
    throw new Error('Excel导出失败');
  }
}

export function exportToCSV(data: ChipData[], filename: string = '芯片替代查询结果') {
  try {
    const exportData = data.map((item, index) => ({
      '序号': index + 1,
      '原型号': item.originalModel,
      '替代型号': item.replacementModel,
      '厂牌': item.brand,
      '功能': item.function,
      '替代类型': item.replaceType
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8'
    });

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    saveAs(blob, `${filename}_${timestamp}.csv`);

    return true;
  } catch (error) {
    console.error('CSV导出失败:', error);
    throw new Error('CSV导出失败');
  }
}