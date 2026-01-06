# 芯片替代查询工具

一个现代化的在线芯片替代型号查询工具，支持单个查询、批量查询和图像识别功能。

## 功能特性

- 🔍 **智能搜索**: 支持单个芯片型号查询和批量查询
- 📷 **图像识别**: 集成硅基流动API，支持图片中芯片型号识别
- 📊 **结果展示**: 清晰展示替代型号、厂牌、功能和替代类型
- 📥 **数据导出**: 支持Excel和CSV格式导出查询结果
- 🎨 **现代UI**: 蓝色科技风格，支持多设备访问
- 🚀 **快速部署**: 基于Next.js，支持Vercel自动部署

## 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **样式**: Tailwind CSS, 响应式设计
- **数据处理**: XLSX.js
- **图像识别**: 硅基流动 API (Qwen2-VL)
- **文件操作**: react-dropzone, file-saver
- **部署**: Vercel

## 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

创建 `.env.local` 文件：

```env
SILICONFLOW_API_KEY=your_siliconflow_api_key_here
```

### 准备数据

1. 将 Excel 数据文件放置在 `database/cross reference table.xlsx`
2. 确保文件格式包含以下列：
   - 原始型号
   - 替代型号  
   - 厂牌
   - 功能
   - 替代类型

### 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

### 构建部署

```bash
npm run build
npm start
```

## 一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/chip-replacement-tool)

### 手动部署步骤

1. Fork 本仓库
2. 在 Vercel 中连接 GitHub 仓库
3. 配置环境变量 `SILICONFLOW_API_KEY`
4. 部署完成

## 使用说明

### 单个查询
输入单个芯片型号进行查询

### 批量查询  
输入多个芯片型号，用逗号或换行分隔

### 图像识别
1. 点击"图片识别"选项卡
2. 上传包含芯片型号的图片
3. 系统自动识别并可手动编辑结果
4. 点击查询获取替代信息

### 导出结果
查询完成后可导出为Excel或CSV格式

## 项目结构

```
chip-replacement-tool/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── search/        # 搜索API
│   │   └── vision/        # 图像识别API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页
├── components/            # React组件
│   ├── Header.tsx         # 页头组件
│   ├── SearchForm.tsx     # 搜索表单
│   ├── ResultsTable.tsx   # 结果表格
│   └── ExportButton.tsx   # 导出按钮
├── lib/                   # 工具库
│   ├── dataProcessor.ts   # 数据处理
│   ├── visionAPI.ts       # 图像识别
│   └── exportUtils.ts     # 导出工具
├── types/                 # 类型定义
│   └── index.ts
└── database/              # 数据文件
    └── cross reference table.xlsx
```

## 开发指南

### 添加新的搜索算法

在 `lib/dataProcessor.ts` 中修改 `search` 方法

### 自定义UI样式

修改 `tailwind.config.js` 和组件中的CSS类

### 集成其他AI服务

在 `lib/visionAPI.ts` 中替换API调用逻辑

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！