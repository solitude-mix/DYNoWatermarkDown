# DY无水印视频下载服务

## 📌 项目简介

本项目支持通过粘贴DY视频分享内容，一键解析并下载无水印视频。
支持 Deno 本地运行、Deno Deploy、Cloudflare Workers、Vercel Serverless 多种部署方式。

---

## 🖥️ 前端功能

- 输入框粘贴DY分享内容。
- 点击"开始解析"按钮，自动提取视频直链并在线播放。
- 点击"下载视频"按钮，可直接下载无水印视频。
- 点击"清空"按钮，快速清空输入内容并重置页面。
- 视频播放区域居中显示，体验更佳。

---

## 🔧 API 使用方式

- **方法**：GET
- **接口**：`/api?url=https://v.douyin.com/xxxx/`
  - Cloudflare Worker 环境下也支持 `/?url=https://v.douyin.com/xxxx/`
- **参数**：
    - `url`：DY视频分享链接

**返回：**
```json
{
  "videoUrl": "https://final.douyin.video/xxx.mp4"
}
```

---

## 🚀 本地运行

1. **安装 Deno**  
   参考 [Deno 官方文档](https://deno.com/manual/getting_started/installation)

2. **启动服务**
   ```bash
   deno run --allow-net --allow-read main.ts
   ```
   默认监听 8000 端口。

3. **访问页面**  
   浏览器打开 [http://localhost:8000/](http://localhost:8000/)

---

## 🚀 部署方式

本项目支持多种部署方式，方便快速上线使用。

### 1. Deno Deploy 部署

- 进入 [Deno Deploy](https://dash.deno.com/) 控制台。
- 创建新项目，选择可执行文件为 [main.ts](./main.ts)。
- 部署后即可通过 HTTPS 访问服务。

### 2. Cloudflare Workers 部署

- 安装 [`denoflare`](https://github.com/skymethod/denoflare) CLI 工具。
- 在项目根目录配置 `.denoflare` 文件。
- 执行部署命令：

  ```bash
  denoflare push cfworker.ts
  ```

- 部署后到worker设置开启访问即可
- Worker 支持 `/api?url=...` 和 `/?url=...` 两种接口形式，前端无需修改即可适配。
- 参考文档：[Cloudflare Workers 教程](https://docs.deno.com/examples/cloudflare_workers_tutorial/)

### 3. vercel 部署

- fork 本项目后，进入vercel dashboard导入项目
- 直接点击deploy即可部署
- 访问链接为 https://yourdomain.vercel.app/api/hello?url=https://v.douyin.com/xxxx/

---

## 📁 目录结构

```
public/         # 前端页面（index.html）
main.ts         # Deno 本地/云函数入口
serve.ts        # 路由与静态资源服务
douyin.ts       # DY视频解析核心逻辑
api/hello.ts    # Vercel Serverless Function
cfworker.ts     # Cloudflare Worker 入口
```

---

## 📝 其他说明

- 视频播放和下载均通过后端 `/proxy?url=...` 代理，解决DY防盗链问题。
- 支持多种部署方式，前端无需修改即可适配。

---

如需更详细的部署或二次开发说明，请查阅源码或联系维护者。

---

## 🔗 致谢与社区

- 本项目参考自 [pwh-pwh/douyinVd](https://github.com/pwh-pwh/douyinVd)
- 欢迎加入技术交流与分享社区：[linux.do 论坛](https://linux.do)