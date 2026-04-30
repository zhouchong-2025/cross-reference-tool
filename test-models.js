// 测试多个可能的模型名称
const API_KEY = 'sk-esbqmmtdzxnjsgitianjmvncuywbpjmayoullmsodxkqpdug';
const BASE_URL = 'https://api.siliconflow.cn/v1/chat/completions';

async function testModel(modelName) {
  console.log(`\n测试: ${modelName}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: '你好' }],
        max_tokens: 10
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ 成功! 模型: ${data.model || modelName}`);
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
  console.log('开始测试硅基流动模型...\n');

  const models = [
    'Qwen/Qwen3-VL-30B-A3B-Instruct',
    'Qwen/Qwen2-VL-7B-Instruct',
    'Qwen/Qwen2-VL-2B-Instruct',
    'Qwen/Qwen2-VL-72B-Instruct',
    'Pro/Qwen/Qwen2-VL-7B-Instruct',
    'Qwen2-VL-7B-Instruct',
    'qwen-vl-plus',
    'Qwen/QwQ-32B-Preview',
  ];

  for (const model of models) {
    const success = await testModel(model);
    if (success) {
      console.log(`\n✅✅✅ 找到可用模型: ${model} ✅✅✅\n`);
      break;
    }
    await new Promise(r => setTimeout(r, 500));
  }
}

main();
