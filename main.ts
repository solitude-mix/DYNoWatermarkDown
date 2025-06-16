import {handler} from "./serve.ts";

Deno.serve(handler);

const pattern = /"video":{"play_addr":{"uri":"([a-z0-9]+)"/;
const cVUrl =
  "https://www.iesdouyin.com/aweme/v1/play/?video_id=%s&ratio=1080p&line=0";

async function doGet(url: string): Promise<Response> {
  const headers = new Headers();
  headers.set(
    "User-Agent",
    "Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36",
  );
  const resp = await fetch(url, { method: "GET", headers, redirect: "follow" });
  return resp;
}

async function getVideoId(url: string): Promise<string> {
  const resp = await doGet(url);
  const body = await resp.text();
  const match = pattern.exec(body);
  if (!match || !match[1]) throw new Error("Video ID not found in URL");
  return match[1];
}

async function getVideoUrl(url: string): Promise<string> {
  const id = await getVideoId(url);
  const downloadUrl = cVUrl.replace("%s", id);

  // 关键：后端跟随重定向，拿到最终视频直链
  const resp = await doGet(downloadUrl);
  // 抖音会 302 跳转到真正的无水印视频地址
  // Deno/Node fetch 默认会跟随重定向，但我们要拿到最终的 URL
  // Deno fetch 没有 response.url，需用 resp.headers.get("location")
  // 但如果 fetch 已经跟随重定向，resp.url 就是最终地址
  // 保险起见，尝试获取 resp.url 或 resp.headers.get("location")
  let realUrl = resp.url;
  if (!realUrl || realUrl === downloadUrl) {
    realUrl = resp.headers.get("location") || downloadUrl;
  }
  return realUrl;
}

export { getVideoUrl };
