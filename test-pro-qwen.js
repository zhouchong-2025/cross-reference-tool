// 测试Pro/Qwen/Qwen2.5-VL-7B-Instruct模型
const API_KEY = 'sk-esbqmmtdzxnjsgitianjmvncuywbpjmayoullmsodxkqpdug';
const BASE_URL = 'https://api.siliconflow.cn/v1/chat/completions';

// 创建一个100x100的测试图片
function createTestImage() {
  // 100x100红色PNG
  return 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAFUlEQVR42u3BMQEAAADCoPVPbQwfoAAAAIC3AQ0AAAEuG7kfAAAAAElFTkSuQmCC';
}

async function testProQwen() {
  console.log('测试 Pro/Qwen/Qwen2.5-VL-7B-Instruct 模型\n');

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
        model: 'Pro/Qwen/Qwen2.5-VL-7B-Instruct',
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
                  url: `data:image/png;base64,${createTestImage()}`
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
      console.log('完整响应:', JSON.stringify(data, null, 2));
      return true;
    } else {
      const error = await response.json();
      console.log('❌ 失败:', JSON.stringify(error, null, 2));
      return false;
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    return false;
  }
}

testProQwen();
