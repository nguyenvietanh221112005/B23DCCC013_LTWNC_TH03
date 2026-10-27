import type { Metadata } from "next";
import Link from "next/link";
import { SubjectCard } from "@/components/subject-card";
import { getDeadlines, getSubjects } from "@/lib/db";

// SSG
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Môn học",
  description: "Danh sách 4 môn học của lớp và lộ trình nộp bài từng môn.",
  alternates: { canonical: "/subjects" },
};

export default async function SubjectsPage() {
  const [subjects, deadlines] = await Promise.all([getSubjects(), getDeadlines()]);
  return (
    <div className="container page">
      <ol className="breadcrumb">
        <li>
          <Link href="/">Trang chủ</Link>
        </li>
        <li aria-current="page">Môn học</li>
      </ol>
      <h1 className="page-title">Môn học</h1>
      <p className="page-sub">{subjects.length} môn học trong học kỳ này</p>
      <div className="subject-grid" style={{ marginTop: 20 }}>
        {subjects.map((s) => (
          <SubjectCard key={s.slug} subject={s} count={deadlines.filter((d) => d.subjectSlug === s.slug).length} />
        ))}
      </div>
    </div>
  );
}
