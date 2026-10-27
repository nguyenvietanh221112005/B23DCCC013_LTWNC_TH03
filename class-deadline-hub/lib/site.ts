export const SITE_NAME = "Class Deadline Hub";
export const SITE_DESCRIPTION =
  "Cổng deadline của lớp: xem hạn nộp của 4 môn học, biết còn bao nhiêu ngày và đánh dấu bài đã nộp.";
export const SEMESTER = "Học kỳ 1 · 2026–2027";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
