# ClipScript

把字幕文件直接变成适合 Shorts、Reels、TikTok 的短视频切片方案。

`ClipScript` 是一个“先看字幕、再做剪辑”的 AI 工具。你上传 `.srt` 字幕，设置片段数量和时长范围，模型会先帮你找出最值得剪的高光时刻，再生成标题、hook、字幕强调方式、旁白角度和剪辑建议。确认后，你还可以上传原视频，一键导出切好的片段和执行表。

## Demo

![ClipScript demo](./public/screenshots/demo.gif)

## 适合谁

- 播客切条
- 访谈和对谈内容
- 剧情类或故事类内容高光提取
- 知识课程、讲座、课堂内容拆条
- 需要先做 paper edit、再交给剪辑执行的团队

## 它会输出什么

- 推荐剪辑片段区间
- 每个片段的开头 hook
- 适合短视频的字幕强调方式
- 解说型内容可用的旁白角度
- 剪辑节奏、镜头处理、结构安排建议
- 给剪辑师或运营同学使用的 CSV 执行表

## 当前能力

- 基于 `.srt` 的高光片段发现
- 生成标题、hook、字幕文案、旁白角度、剪辑方向
- 可调节片段数量和时长范围
- 支持 OpenAI 兼容接口
- 上传源视频后一键切片和合并
- 导出执行表，便于人工复核和二次编辑

## 快速体验

本地启动项目后，可以直接打开内置 demo：

`http://localhost:3000/preview?demo=1`

也可以查看示例字幕文件：

[`public/examples/founder-confession-demo.srt`](./public/examples/founder-confession-demo.srt)

## 本地启动

### 环境要求

- Node.js 20+
- 本机已安装 `ffmpeg`，并且已经加入 `PATH`

### 启动命令

```bash
git clone https://github.com/a77ming/clipscript.git
cd clipscript
npm install
cp .env.example .env
npm run dev
```

打开 `http://localhost:3000`。

然后：

1. 点击右上角 `Model API`
2. 填入 API Key
3. 如果需要，配置兼容接口地址和模型名
4. 上传 `.srt` 字幕文件
5. 审核生成的 clip ideas
6. 在预览页上传源视频并导出结果

## Docker

```bash
docker compose up -d --build
```

## 工作流

```text
.srt 字幕
  -> AI 识别高光时刻
  -> 生成 hook / 字幕 / 旁白 / 剪辑建议
  -> 人工筛选
  -> 上传源视频
  -> 导出片段和执行表
```

## 配置

环境变量是可选的，主要配置入口仍然是浏览器右上角设置面板。

```bash
API_BASE_URL=https://api.openai.com/v1
API_MODEL=gpt-4o-mini
```

## 路线图

- 更好的预览和审批流
- 支持 `.vtt`、纯文本等更多 transcript 格式
- 支持内容库批量处理
- 更强的 paper-edit / editor handoff 导出
- 更完善的 macOS 和 Windows 桌面版打包

## 参与贡献

见 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。

## 说明

- API Key 只保存在本地浏览器存储中。
- 项目默认使用 OpenAI 兼容接口。
- 真正的视频切片和合并依赖本地 `ffmpeg`。

## License

MIT
