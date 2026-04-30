// 尝试获取可用模型列表
const API_KEY = 'sk-esbqmmtdzxnjsgitianjmvncuywbpjmayoullmsodxkqpdug';

async function listModels() {
  console.log('获取硅基流动可用模型列表...\n');

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      }
    });

    console.log(`状态码: ${response.status}\n`);

    if (response.ok) {
      const data = await response.json();
      console.log('可用模型总数:', data.data?.length || 0);

      // 筛选出包含VL或vision的模型
      const visionModels = data.data?.filter(m =>
        m.id.toLowerCase().includes('vl') ||
        m.id.toLowerCase().includes('vision') ||
        m.id.toLowerCase().includes('qwen2-vl') ||
        m.id.toLowerCase().includes('internvl')
      );

      console.log('\n视觉相关模型:');
      console.log('='.repeat(60));
      visionModels?.forEach(m => {
        console.log(`- ${m.id}`);
        if (m.owned_by) console.log(`  所有者: ${m.owned_by}`);
      });

      // 也列出所有Qwen模型
      const qwenModels = data.data?.filter(m =>
        m.id.toLowerCase().includes('qwen')
      );

      console.log('\n\nQwen系列模型:');
      console.log('='.repeat(60));
      qwenModels?.forEach(m => {
        console.log(`- ${m.id}`);
      });

    } else {
      const error = await response.text();
      console.log('获取失败:', error);
    }
  } catch (error) {
    console.log('错误:', error.message);
  }
}

listModels();
