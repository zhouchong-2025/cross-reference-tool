import { NextRequest, NextResponse } from 'next/server';
import { visionAPI } from '@/lib/visionAPI';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        message: '请上传图片文件'
      }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        message: '文件格式不支持，请上传图片文件'
      }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const result = await visionAPI.recognizeImage(base64);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message || '图像识别失败'
      });
    }

    const chipModels = visionAPI.parseChipModels(result.recognizedText);

    return NextResponse.json({
      success: true,
      recognizedText: result.recognizedText,
      chipModels,
      confidence: result.confidence,
      message: `识别成功，找到 ${chipModels.length} 个芯片型号`
    });

  } catch (error) {
    console.error('视觉识别API错误:', error);
    return NextResponse.json({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 });
  }
}