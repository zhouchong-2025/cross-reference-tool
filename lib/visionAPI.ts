export class VisionAPI {
  private apiKey: string;
  private baseUrl: string = 'https://api.siliconflow.cn/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.SILICONFLOW_API_KEY || '';
  }

  async recognizeImage(imageBase64: string): Promise<{
    success: boolean;
    recognizedText: string;
    confidence?: number;
    message?: string;
  }> {
    try {
      if (!this.apiKey) {
        throw new Error('硅基流动 API Key 未配置');
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen3-VL-30B-A3B-Instruct',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: '请识别图片中的芯片型号。只输出识别到的型号，如果有多个型号请用逗号分隔。如果无法识别请回复"无法识别"。'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        }),
      });

      console.log('API响应状态:', response.status);
      console.log('API响应头:', Object.fromEntries(response.headers));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('API错误响应:', errorText);
        throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.choices && result.choices[0] && result.choices[0].message) {
        const recognizedText = result.choices[0].message.content.trim();
        
        if (recognizedText === '无法识别' || recognizedText.toLowerCase().includes('无法识别')) {
          return {
            success: false,
            recognizedText: '',
            message: '无法识别图片中的芯片型号'
          };
        }

        return {
          success: true,
          recognizedText,
          confidence: 0.8
        };
      } else {
        throw new Error('API返回格式错误');
      }

    } catch (error) {
      console.error('图像识别失败:', error);
      return {
        success: false,
        recognizedText: '',
        message: error instanceof Error ? error.message : '图像识别服务异常'
      };
    }
  }

  parseChipModels(text: string): string[] {
    const models = text
      .split(/[,，\n\r\s]+/)
      .map(model => model.trim())
      .filter(model => model.length > 0 && model !== '无法识别')
      .filter(model => /^[A-Za-z0-9\-_]+$/.test(model));

    return Array.from(new Set(models));
  }
}

export const visionAPI = new VisionAPI();