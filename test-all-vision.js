// 测试更多可能的视觉模型
const API_KEY = 'sk-esbqmmtdzxnjsgitianjmvncuywbpjmayoullmsodxkqpdug';
const BASE_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const TEST_IMAGE = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

async function testVisionModel(modelName) {
  console.log(`\n测试: ${modelName}`);
  console.log('='.repeat(60));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

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
        max_tokens: 100,
        temperature: 0.1
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 成功!');
      if (data.choices && data.choices[0]) {
        console.log('响应:', data.choices[0].message.content);
      }
      return true;
    } else {
      const error = await response.json();
      console.log(`❌ 失败: ${error.message} (code: ${error.code})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('测试硅基流动视觉模型...\n');

  const visionModels = [
    'Pro/Qwen/Qwen2-VL-72B-Instruct',
    'Qwen/Qwen2-VL-7B-Instruct',
    'OpenGVLab/InternVL2-26B',
    'OpenGVLab/InternVL2-8B',
    'OpenGVLab/InternVL2-4B',
    'OpenGVLab/InternVL2-2B',
    'deepseek-ai/deepseek-vl-7b-chat',
    'THUDM/glm-4v-9b',
  ];

  for (const model of visionModels) {
    const success = await testVisionModel(model);
    if (success) {
      console.log(`\n\n✅✅✅ 找到可用的视觉模型: ${model} ✅✅✅\n`);
      break;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

main();
