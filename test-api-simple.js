// 简化的API测试 - 先测试API连接
const API_KEY = 'sk-esbqmmtdzxnjsgitianjmvncuywbpjmayoullmsodxkqpdug';
const BASE_URL = 'https://api.siliconflow.cn/v1/chat/completions';

async function testAPI() {
  console.log('测试硅基流动API连接...\n');

  const modelName = 'Qwen/Qwen2-VL-7B-Instruct';
  console.log(`测试模型: ${modelName}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

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
            content: '你好'
          }
        ],
        max_tokens: 10
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`\n状态码: ${response.status}`);
    console.log(`状态文本: ${response.statusText}`);

    const text = await response.text();
    console.log(`\n响应内容:\n${text}`);

    if (response.ok) {
      console.log('\n✅ API连接正常');
      const data = JSON.parse(text);
      console.log('\n返回的模型:', data.model);
    } else {
      console.log('\n❌ API返回错误');
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('\n❌ 请求超时（10秒）');
    } else {
      console.log(`\n❌ 错误: ${error.message}`);
    }
  }
}

testAPI();
