import {getVideoUrl} from "./douyin.ts";

// 嵌入 index.html 内容
const INDEX_HTML = `<!DOCTYPE html>
<html lang=\"zh\">
<head>
  <meta charset=\"UTF-8\">
  <title>抖音无水印解析</title>
  <style>
    body {
      background: radial-gradient(#1a1a1a, #000);
      color: white;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 2em;
    }
    textarea {
      width: 80%;
      height: 100px;
      font-size: 1em;
      padding: 1em;
      margin: 1em auto;
      display: block;
      border-radius: 8px;
      border: none;
    }
    video {
      width: 300px;
      margin-top: 20px;
      border-radius: 8px;
    }
    button {
      margin-top: 15px;
      padding: 10px 20px;
      font-size: 1em;
      border: none;
      border-radius: 6px;
      background-color: white;
      color: black;
      cursor: pointer;
    }
    .video-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }
  </style>
</head>
<body>
  <h2>粘贴抖音分享内容，自动提取视频</h2>
  <textarea id=\"input\" placeholder=\"粘贴抖音分享内容\"></textarea>
  <button id=\"parseBtn\">开始解析</button>
  <button id=\"clearBtn\">清空</button>
  <div class=\"video-container\"><video id=\"video\" controls style=\"display:none;\"></video></div>
  <br>
  <a id=\"download\" href=\"#\" download style=\"display:none;\"><button>下载视频</button></a>

  <script type=\"text/javascript\">
  ` + String.raw`
    const input = document.getElementById('input');
    const video = document.getElementById('video');
    const download = document.getElementById('download');
    const parseBtn = document.getElementById('parseBtn');
    const clearBtn = document.getElementById('clearBtn');

    // 自动适配API路径
    function getApiUrl(url) {
      if (location.pathname.startsWith('/api/hello')) {
        return "/api/hello?url=" + encodeURIComponent(url);
      } else if (location.hostname.endsWith('.workers.dev') || location.hostname.endsWith('.cloudflare.dev')) {
        return "/?url=" + encodeURIComponent(url);
      } else if (location.pathname.startsWith('/api')) {
        return "/api?url=" + encodeURIComponent(url);
      } else {
        return "/api?url=" + encodeURIComponent(url);
      }
    }

    parseBtn.addEventListener('click', () => {
      const text = input.value;
      const match = text.match(/https?:\/\/[\S]+douyin\.com\/[\S]+/);
      if (match) {
        const url = match[0];
        fetch(getApiUrl(url))
          .then(res => res.text())
          .then(data => {
            let videoUrl = data;
            try {
              const json = JSON.parse(data);
              if (json && json.videoUrl) videoUrl = json.videoUrl;
            } catch {}
            if (videoUrl && videoUrl.startsWith('http')) {
              const proxyUrl = "/proxy?url=" + encodeURIComponent(videoUrl);
              video.src = proxyUrl;
              video.style.display = 'block';
              download.href = proxyUrl;
              download.style.display = 'inline-block';
            }
          })
          .catch(err => console.error('解析失败:', err));
      }
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      video.src = '';
      video.style.display = 'none';
      download.href = '#';
      download.style.display = 'none';
    });
  ` + `</script>
</body>
</html>`;

const handler = async (req:Request) => {
    const url = new URL(req.url);

    // API 路由，兼容 /api?url=... 和 /?url=...
    if (
        (url.pathname === "/api" && url.searchParams.has("url")) ||
        (url.pathname === "/" && url.searchParams.has("url"))
    ) {
        const inputUrl = url.searchParams.get("url")!;
        try {
            const videoUrl = await getVideoUrl(inputUrl);
            return new Response(JSON.stringify({ videoUrl }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: "解析失败" }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // 代理抖音视频流
    if (url.pathname === "/proxy" && url.searchParams.has("url")) {
        const videoUrl = url.searchParams.get("url")!;
        const headers = new Headers();
        headers.set(
            "User-Agent",
            "Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36",
        );
        const resp = await fetch(videoUrl, { headers });
        const contentType = resp.headers.get("content-type") || "video/mp4";
        return new Response(resp.body, {
            headers: { "content-type": contentType }
        });
    }

    // 首页路由，直接返回嵌入的 index.html
    if (url.pathname === "/" || url.pathname === "/index.html") {
        return new Response(INDEX_HTML, {
            headers: { "content-type": "text/html; charset=utf-8" }
        });
    }

    // 其他路径返回 404
    return new Response("Not found", { status: 404 });
}

export {handler}