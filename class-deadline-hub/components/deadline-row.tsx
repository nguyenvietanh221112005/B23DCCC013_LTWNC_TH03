import Link from "next/link";
import { calendarChip, formatDue } from "@/lib/date";
import type { DeadlineWithSubject } from "@/lib/types";
import { CountdownBadge } from "./countdown";

/**
 * Một dòng deadline. Không có state nên dùng được ở cả Server Component
 * (trang chủ) lẫn Client Component (bộ lọc ở /deadlines).
 */
export function DeadlineRow({
  deadline,
  showId = false,
  showDot = false,
  hideSubject = false,
}: {
  deadline: DeadlineWithSubject;
  showId?: boolean;
  showDot?: boolean;
  hideSubject?: boolean;
}) {
  const chip = calendarChip(deadline.dueAt);
  return (
    <Link href={`/deadlines/${deadline.id}`} className="card deadline-row">
      <span className="date-chip" aria-hidden="true">
        <span className="date-chip__month">{chip.month}</span>
        <span className="date-chip__day">{chip.day}</span>
      </span>
      <span className="deadline-row__body">
        {!hideSubject && (
          <span className="deadline-row__subject">
            {showDot && <span className="dot" style={{ background: deadline.subject.color }} />}
            {deadline.subject.name}
          </span>
        )}
        <span className="deadline-row__title" style={{ display: "block" }}>
          {deadline.title}
        </span>
        <span className="deadline-row__meta" style={{ display: "block" }}>
          {showId && `#${deadline.id} · `}
          <time dateTime={deadline.dueAt}>{formatDue(deadline.dueAt)}</time>
        </span>
      </span>
      <CountdownBadge dueAt={deadline.dueAt} />
    </Link>
  );
}
