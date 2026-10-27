import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CountdownBadge, TimelineDot } from "@/components/countdown";
import { subjectTint } from "@/components/subject-card";
import { formatDue } from "@/lib/date";
import { getDeadlinesBySubject, getSubject, getSubjects } from "@/lib/db";

/**
 * SSG: mọi slug được sinh sẵn lúc build (generateStaticParams); slug lạ → notFound() → 404.
 * Không đặt dynamicParams = false: với Next 15, trang bị revalidatePath() (khi admin đổi deadline)
 * sẽ trả 404 lúc tái tạo nếu dynamicParams = false.
 */
export async function generateStaticParams() {
  return (await getSubjects()).map((s) => ({ slug: s.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const subject = await getSubject((await params).slug);
  if (!subject) return {};
  return {
    title: subject.name,
    description: `Lộ trình nộp bài môn ${subject.name}: ${subject.description}.`,
    alternates: { canonical: `/subjects/${subject.slug}` },
  };
}

export default async function SubjectPage({ params }: Props) {
  const { slug } = await params;
  const subject = await getSubject(slug);
  if (!subject) notFound();
  const deadlines = await getDeadlinesBySubject(slug);

  return (
    <div className="container page">
      <ol className="breadcrumb">
        <li>
          <Link href="/">Trang chủ</Link>
        </li>
        <li>
          <Link href="/subjects">Môn học</Link>
        </li>
        <li aria-current="page">{subject.name}</li>
      </ol>

      <header className="card subject-hero">
        <span className="subject-code" style={subjectTint(subject.color)}>
          {subject.code}
        </span>
        <div>
          <h1 className="page-title">{subject.name}</h1>
          <p className="page-sub">{subject.description}</p>
        </div>
      </header>

      <h2 className="section__title" style={{ margin: "28px 0 14px", fontSize: 18 }}>
        Lộ trình nộp bài
      </h2>

      {deadlines.length === 0 ? (
        <p className="card empty">Môn này chưa có deadline.</p>
      ) : (
        <ol className="timeline">
          {deadlines.map((d, i) => (
            <li key={d.id} className="timeline__item">
              <TimelineDot dueAt={d.dueAt} prevDueAt={deadlines[i - 1]?.dueAt} />
              <Link href={`/deadlines/${d.id}`} className="card deadline-row">
                <span className="deadline-row__body">
                  <span className="deadline-row__title" style={{ display: "block", marginTop: 0 }}>
                    {d.title}
                  </span>
                  <span className="deadline-row__meta" style={{ display: "block" }}>
                    #{d.id} · <time dateTime={d.dueAt}>{formatDue(d.dueAt)}</time>
                  </span>
                </span>
                <CountdownBadge dueAt={d.dueAt} />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
