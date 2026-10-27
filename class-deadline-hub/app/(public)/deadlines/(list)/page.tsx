import type { Metadata } from "next";
import { DeadlineFilter } from "@/components/deadline-filter";
import { getDeadlines, getSubjects } from "@/lib/db";

// ISR theo thời gian: trang tĩnh, tối đa 60 giây sau khi dữ liệu đổi thì request kế tiếp sẽ thấy bản mới.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tất cả deadline",
  description: "Toàn bộ deadline của 4 môn học, sắp xếp theo hạn nộp gần nhất, lọc theo môn và trạng thái.",
  alternates: { canonical: "/deadlines" },
};

export default async function DeadlinesPage() {
  // Demo error.tsx: chạy `npm run dev` với SIMULATE_ERROR=deadlines để giả lập máy chủ không đọc được dữ liệu.
  if (process.env.SIMULATE_ERROR === "deadlines") throw new Error("Giả lập lỗi đọc data/deadlines.json");
  const [deadlines, subjects] = await Promise.all([getDeadlines(), getSubjects()]);
  return (
    <div className="container page">
      <h1 className="page-title">Tất cả deadline</h1>
      <p className="page-sub">
        {deadlines.length} deadline · {subjects.length} môn học · sắp xếp theo hạn nộp gần nhất
      </p>
      <DeadlineFilter deadlines={deadlines} subjects={subjects} />
    </div>
  );
}
