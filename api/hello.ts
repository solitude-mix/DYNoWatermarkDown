import { getVideoUrl } from "../douyin.ts";

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    res.status(400).json({ error: '缺少 url 参数' });
    return;
  }
  try {
    // 调用 getVideoUrl 函数获取视频链接
    const videoUrl = await getVideoUrl(url);
    res.status(200).json({ videoUrl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
