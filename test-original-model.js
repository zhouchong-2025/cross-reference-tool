// 测试原始模型名称
const API_KEY = 'sk-esbqmmtdzxnjsgitianjmvncuywbpjmayoullmsodxkqpdug';
const BASE_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const TEST_IMAGE = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

async function testOriginalModel() {
  console.log('测试原始模型: Qwen/Qwen3-VL-30B-A3B-Instruct\n');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
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
                  url: `data:image/png;base64,${TEST_IMAGE}`
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

    console.log(`状态码: ${response.status}`);
    console.log(`状态文本: ${response.statusText}\n`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 成功!\n');
      console.log('完整响应:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ 失败:');
      console.log(error);
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
  }
}

testOriginalModel();
