// 测试Qwen2.5-VL系列模型
const API_KEY = 'sk-esbqmmtdzxnjsgitianjmvncuywbpjmayoullmsodxkqpdug';
const BASE_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const TEST_IMAGE = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

async function testModel(modelName) {
  console.log(`\n测试: ${modelName}`);
  console.log('='.repeat(60));

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
        model: modelName,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请识别图片中的芯片型号'
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

    console.log(`状态码: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 成功!');
      if (data.choices && data.choices[0]) {
        console.log('响应:', data.choices[0].message.content);
      }
      return true;
    } else {
      const error = await response.json();
      console.log(`❌ 失败: ${error.message}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    return false;
  }
}

async function main() {
  const models = [
    'Pro/Qwen/Qwen2.5-VL-7B-Instruct',
    'Qwen/Qwen2.5-VL-32B-Instruct',
    'Qwen/Qwen3-VL-8B-Instruct',
    'deepseek-ai/deepseek-vl2',
  ];

  for (const model of models) {
    const success = await testModel(model);
    if (success) {
      console.log(`\n\n✅✅✅ 推荐使用: ${model} ✅✅✅\n`);
      break;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

main();
