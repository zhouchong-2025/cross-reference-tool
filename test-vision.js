// 测试Qwen2-VL-72B的视觉功能
const API_KEY = 'sk-esbqmmtdzxnjsgitianjmvncuywbpjmayoullmsodxkqpdug';
const BASE_URL = 'https://api.siliconflow.cn/v1/chat/completions';

// 一个简单的测试图片（1x1红色像素）
const TEST_IMAGE = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

async function testVision() {
  console.log('测试Qwen2-VL-72B视觉功能...\n');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2-VL-72B-Instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请描述这张图片'
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
        max_tokens: 200,
        temperature: 0.1
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`状态码: ${response.status}\n`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 视觉功能测试成功!\n');
      console.log('模型响应:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const error = await response.json();
      console.log('❌ 视觉功能测试失败:');
      console.log(JSON.stringify(error, null, 2));
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
  }
}

testVision();
