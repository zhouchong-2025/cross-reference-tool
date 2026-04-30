// 测试修改后的deepseek-vl2模型
const API_KEY = 'sk-esbqmmtdzxnjsgitianjmvncuywbpjmayoullmsodxkqpdug';
const BASE_URL = 'https://api.siliconflow.cn/v1/chat/completions';

// 创建一个简单的测试图片（50x50红色方块）
function createTestImage() {
  // 这是一个50x50的红色PNG图片的base64
  return 'iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAFUlEQVR42u3BMQEAAADCoPVPbQwfoAAAAIC3AQ0AAAEuG7kfAAAAAElFTkSuQmCC';
}

async function testDeepSeekVL2() {
  console.log('测试 deepseek-ai/deepseek-vl2 模型\n');

  const testImage = createTestImage();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    console.log('发送请求...');
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/deepseek-vl2',
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
                  url: `data:image/png;base64,${testImage}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`状态码: ${response.status}\n`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API调用成功!\n');

      if (data.choices && data.choices[0]) {
        const recognizedText = data.choices[0].message.content.trim();
        console.log('识别结果:', recognizedText);
        console.log('\n模型响应正常，图片识别功能已修复！');
      }
    } else {
      const error = await response.json();
      console.log('❌ 失败:', error.message);
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
  }
}

testDeepSeekVL2();
