"use client";

import { formatDue, getCountdown } from "@/lib/date";
import { useNow } from "./use-now";

/** Huy hiệu "Còn X ngày / Quá hạn Y ngày" — tính theo giờ của trình duyệt, tự cập nhật. */
export function CountdownBadge({ dueAt, done = false }: { dueAt: string; done?: boolean }) {
  const now = useNow();

  if (done) return <span className="badge badge--done">Đã xong</span>;
  if (now === null) {
    return (
      <span className="badge badge--pending" aria-hidden="true">
        ·
      </span>
    );
  }

  const c = getCountdown(dueAt, new Date(now));
  const cls = c.tone === "overdue" ? "badge--overdue" : c.tone === "soon" ? "badge--soon" : "";
  return (
    <span className={`badge ${cls}`} title={`Hạn nộp ${formatDue(dueAt)}`}>
      {c.label}
    </span>
  );
}

/** Ô lớn "Thời gian còn lại" ở trang chi tiết. */
export function CountdownStat({ dueAt }: { dueAt: string }) {
  const now = useNow();

  if (now === null) {
    return (
      <div className="stat" aria-busy="true">
        <p className="stat__label">Thời gian còn lại</p>
        <p className="stat__value">—</p>
      </div>
    );
  }

  const c = getCountdown(dueAt, new Date(now));
  const cls = c.tone === "overdue" ? "stat--overdue" : c.tone === "soon" ? "stat--soon" : "";
  return (
    <div className={`stat ${cls}`} aria-live="polite">
      <p className="stat__label">{c.overdue ? "Đã quá hạn" : "Thời gian còn lại"}</p>
      <p className="stat__value">{c.label}</p>
      <p className="stat__sub">{c.detail}</p>
    </div>
  );
}

/** Chấm trên timeline môn học: cam = deadline gần nhất chưa tới hạn, xám đặc = đã qua. */
export function TimelineDot({ dueAt, prevDueAt }: { dueAt: string; prevDueAt?: string }) {
  const now = useNow();
  let state = "";
  if (now !== null) {
    const passed = new Date(dueAt).getTime() < now;
    const prevPassed = !prevDueAt || new Date(prevDueAt).getTime() < now;
    state = passed ? "timeline__dot--past" : prevPassed ? "timeline__dot--next" : "";
  }
  return <span className={`timeline__dot ${state}`} aria-hidden="true" />;
}
