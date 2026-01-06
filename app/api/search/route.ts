import { NextRequest, NextResponse } from 'next/server';
import { dataProcessor } from '@/lib/dataProcessor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, type } = body;

    if (!query) {
      return NextResponse.json({
        success: false,
        message: '请提供查询参数',
        data: []
      });
    }

    const queries = Array.isArray(query) ? query : [query];
    const cleanQueries = queries
      .map(q => String(q).trim())
      .filter(q => q.length > 0);

    if (cleanQueries.length === 0) {
      return NextResponse.json({
        success: false,
        message: '请提供有效的芯片型号',
        data: []
      });
    }

    const results = await dataProcessor.search(cleanQueries);

    return NextResponse.json({
      success: true,
      data: results,
      message: `找到 ${results.length} 条匹配记录`
    });

  } catch (error) {
    console.error('搜索API错误:', error);
    return NextResponse.json({
      success: false,
      message: '服务器内部错误',
      data: []
    }, { status: 500 });
  }
}