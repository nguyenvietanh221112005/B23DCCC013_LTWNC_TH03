import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/site";

/**
 * Chặn crawler vào khu vực riêng tư. /login KHÔNG bị chặn ở đây mà dùng thẻ
 * <meta name="robots" content="noindex"> — nếu chặn bằng robots.txt, Google không đọc được thẻ noindex
 * và vẫn có thể lập chỉ mục URL đó từ link bên ngoài.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/api/", "/403"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
