import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyLinkButton } from "@/components/copy-link-button";
import { CountdownStat } from "@/components/countdown";
import { JsonLd } from "@/components/json-ld";
import { MarkDoneButton } from "@/components/mark-done-button";
import { formatDate, formatDue, formatTime, weekday } from "@/lib/date";
import { getDeadline, getDeadlines } from "@/lib/db";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

/**
 * ISR on-demand: các id hiện có được sinh sẵn lúc build và giữ tĩnh vô thời hạn (revalidate = false);
 * Server Action thêm/xoá gọi revalidatePath(`/deadlines/${id}`) nên trang được làm mới NGAY.
 * Id mới do admin thêm sẽ được render lần đầu khi có người truy cập (dynamicParams = true) rồi cache lại.
 */
export const revalidate = false;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getDeadlines()).map((d) => ({ id: String(d.id) }));
}

type Props = { params: Promise<{ id: string }> };

function parseId(raw: string) {
  return /^\d{1,9}$/.test(raw) ? Number(raw) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id);
  const deadline = id ? await getDeadline(id) : undefined;
  if (!deadline) return { title: "Không tìm thấy deadline", robots: { index: false } };

  const title = `${deadline.title} – ${deadline.subject.name}`;
  const description = `Hạn nộp ${formatDue(deadline.dueAt)}. ${deadline.description}`.slice(0, 200);
  const url = `/deadlines/${deadline.id}`;

  // Ảnh OG/Twitter được Next tự gắn từ file opengraph-image.tsx cùng thư mục.
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title, description, siteName: SITE_NAME, locale: "vi_VN" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function DeadlineDetailPage({ params }: Props) {
  const id = parseId((await params).id);
  const deadline = id ? await getDeadline(id) : undefined;
  if (!deadline) notFound();

  const { subject } = deadline;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Deadline", item: absoluteUrl("/deadlines") },
      { "@type": "ListItem", position: 3, name: deadline.title, item: absoluteUrl(`/deadlines/${deadline.id}`) },
    ],
  };

  return (
    <div className="container page">
      <JsonLd data={breadcrumb} />

      <nav aria-label="Breadcrumb">
        <ol className="breadcrumb">
          <li>
            <Link href="/">Trang chủ</Link>
          </li>
          <li>
            <Link href="/deadlines">Deadline</Link>
          </li>
          <li aria-current="page">{deadline.title}</li>
        </ol>
      </nav>

      <article className="card detail">
        <Link
          href={`/subjects/${subject.slug}`}
          className="subject-pill"
          style={{ background: `${subject.color}14`, color: subject.color }}
        >
          <span className="dot" style={{ background: subject.color }} />
          {subject.name}
        </Link>
        <h1 className="detail__title">{deadline.title}</h1>
        <p className="detail__id">Deadline #{deadline.id}</p>

        <div className="detail__stats">
          <CountdownStat dueAt={deadline.dueAt} />
          <div className="stat">
            <p className="stat__label">Hạn nộp</p>
            <p className="stat__value">
              <time dateTime={deadline.dueAt}>{formatTime(deadline.dueAt)}</time>
            </p>
            <p className="stat__sub">
              {weekday(deadline.dueAt)}, {formatDate(deadline.dueAt)}
            </p>
          </div>
        </div>

        <h2 className="detail__section-title">Mô tả</h2>
        <p className="detail__desc">{deadline.description || "Không có mô tả."}</p>

        <div className="detail__actions">
          <MarkDoneButton deadlineId={deadline.id} />
          <CopyLinkButton path={`/deadlines/${deadline.id}`} />
        </div>
      </article>
    </div>
  );
}
