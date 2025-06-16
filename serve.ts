import {getVideoUrl} from "./douyin.ts";

// 静态文件服务函数
async function serveFile(path: string) {
    try {
        const file = await Deno.readFile(path);
        let contentType = "text/plain";
        if (path.endsWith(".html")) contentType = "text/html";
        if (path.endsWith(".js")) contentType = "application/javascript";
        if (path.endsWith(".css")) contentType = "text/css";
        if (path.endsWith(".json")) contentType = "application/json";
        if (path.endsWith(".png")) contentType = "image/png";
        if (path.endsWith(".jpg") || path.endsWith(".jpeg")) contentType = "image/jpeg";
        return new Response(file, { headers: { "content-type": contentType } });
    } catch {
        return new Response("Not found", { status: 404 });
    }
}

const handler = async (req:Request) => {
    console.log("Method:", req.method);

    const url = new URL(req.url);

    // API 路由
    if (url.pathname === "/api" && url.searchParams.has("url")) {
        const inputUrl = url.searchParams.get("url")!;
        console.log("inputUrl:", inputUrl);
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

    // 静态文件路由
    let filePath = "./public" + (url.pathname === "/" ? "/index.html" : url.pathname);
    return await serveFile(filePath);
}

export {handler}