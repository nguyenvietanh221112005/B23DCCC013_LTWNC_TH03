import type { Metadata } from "next";
import Link from "next/link";
import { DeadlineRow } from "@/components/deadline-row";
import { SubjectCard } from "@/components/subject-card";
import { getDeadlines, getSubjects } from "@/lib/db";
import { SEMESTER } from "@/lib/site";

// SSG: HTML sinh lúc build. Server Action của admin gọi revalidatePath("/") khi dữ liệu đổi.
export const dynamic = "force-static";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [deadlines, subjects] = await Promise.all([getDeadlines(), getSubjects()]);
  const buildTime = Date.now();
  const upcoming = deadlines.filter((d) => new Date(d.dueAt).getTime() >= buildTime).slice(0, 4);

  return (
    <div className="container">
      <section className="hero">
        <p className="eyebrow">{SEMESTER}</p>
        <h1 className="hero__title">
          Mọi hạn nộp của lớp,
          <br />ở cùng một chỗ.
        </h1>
        <p className="hero__lead">
          Xem deadline của {subjects.length} môn học, biết ngay còn bao nhiêu ngày. Đăng nhập để đánh dấu những bài
          bạn đã nộp xong.
        </p>
        <div className="hero__cta">
          <Link href="/deadlines" className="btn btn--primary btn--lg">
            Xem tất cả deadline
          </Link>
        </div>
      </section>

      <section className="section" aria-labelledby="upcoming-title">
        <div className="section__head">
          <h2 id="upcoming-title" className="section__title">
            Sắp đến hạn
          </h2>
          <Link href="/deadlines" className="link">
            Xem tất cả →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="card empty">Không còn deadline nào sắp tới. 🎉</p>
        ) : (
          <ul className="deadline-list">
            {upcoming.map((d) => (
              <li key={d.id}>
                <DeadlineRow deadline={d} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section" aria-labelledby="subjects-title" style={{ paddingBottom: 64 }}>
        <div className="section__head">
          <h2 id="subjects-title" className="section__title">
            Môn học
          </h2>
        </div>
        <div className="subject-grid">
          {subjects.map((s) => (
            <SubjectCard key={s.slug} subject={s} count={deadlines.filter((d) => d.subjectSlug === s.slug).length} />
          ))}
        </div>
      </section>
    </div>
  );
}
