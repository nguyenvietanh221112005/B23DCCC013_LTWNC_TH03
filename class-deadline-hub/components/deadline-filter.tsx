"use client";

import { useMemo, useState } from "react";
import type { DeadlineWithSubject, Subject } from "@/lib/types";
import { DeadlineRow } from "./deadline-row";
import { useNow } from "./use-now";

type StatusFilter = "all" | "upcoming" | "overdue";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "upcoming", label: "Sắp tới" },
  { value: "overdue", label: "Quá hạn" },
];

/** Bộ lọc theo môn và trạng thái — chạy hoàn toàn ở client trên dữ liệu ISR. */
export function DeadlineFilter({ deadlines, subjects }: { deadlines: DeadlineWithSubject[]; subjects: Subject[] }) {
  const [subject, setSubject] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const now = useNow();

  const visible = useMemo(
    () =>
      deadlines.filter((d) => {
        if (subject !== "all" && d.subjectSlug !== subject) return false;
        if (status === "all" || now === null) return true;
        const overdue = new Date(d.dueAt).getTime() < now;
        return status === "overdue" ? overdue : !overdue;
      }),
    [deadlines, subject, status, now],
  );

  return (
    <>
      <div className="card filters" role="group" aria-label="Bộ lọc deadline">
        <div className="filters__row">
          <span className="filters__label">Môn học</span>
          <button type="button" className="chip" aria-pressed={subject === "all"} onClick={() => setSubject("all")}>
            Tất cả
          </button>
          {subjects.map((s) => (
            <button
              key={s.slug}
              type="button"
              className="chip"
              aria-pressed={subject === s.slug}
              onClick={() => setSubject(s.slug)}
            >
              {s.shortName}
            </button>
          ))}
        </div>
        <div className="filters__row">
          <span className="filters__label">Trạng thái</span>
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              className="chip"
              aria-pressed={status === o.value}
              onClick={() => setStatus(o.value)}
            >
              {o.label}
            </button>
          ))}
          <span className="filters__count" aria-live="polite">
            Hiển thị {visible.length} / {deadlines.length}
          </span>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="card empty">Không có deadline nào khớp bộ lọc.</p>
      ) : (
        <ul className="deadline-list">
          {visible.map((d) => (
            <li key={d.id}>
              <DeadlineRow deadline={d} showId showDot />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
