// 测试硅基流动视觉API
const API_KEY = 'sk-esbqmmtdzxnjsgitianjmvncuywbpjmayoullmsodxkqpdug';
const BASE_URL = 'https://api.siliconflow.cn/v1/chat/completions';

// 测试用的简单base64图片（1x1像素的红色PNG）
const TEST_IMAGE = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

async function testModel(modelName) {
  console.log(`\n测试模型: ${modelName}`);
  console.log('='.repeat(50));

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请识别图片中的内容'
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
        max_tokens: 100,
        temperature: 0.1
      }),
    });

    console.log(`状态码: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ 失败: ${errorText}`);
      return false;
    }

    const result = await response.json();
    console.log('✅ 成功!');
    console.log('响应:', JSON.stringify(result, null, 2));
    return true;

  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('开始测试硅基流动视觉API...\n');

  // 测试多个可能的模型名称
  const modelsToTest = [
    'Qwen/Qwen3-VL-30B-A3B-Instruct',  // 当前使用的
    'Qwen/Qwen2-VL-7B-Instruct',
    'Qwen/Qwen2-VL-2B-Instruct',
    'Qwen/Qwen2-VL-72B-Instruct',
    'Pro/Qwen/Qwen2-VL-72B-Instruct',
  ];

  for (const model of modelsToTest) {
    const success = await testModel(model);
    if (success) {
      console.log(`\n✅ 找到可用模型: ${model}`);
      break;
    }
    // 等待一下避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main();
