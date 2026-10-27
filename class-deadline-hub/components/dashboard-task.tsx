"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { toggleDoneAction } from "@/lib/actions";
import { formatDate } from "@/lib/date";
import { CountdownBadge } from "./countdown";

export interface DashboardTaskData {
  id: number;
  title: string;
  dueAt: string;
  subjectName: string;
  done: boolean;
}

/** Một dòng trong "Deadline của tôi": tích ô để đánh dấu, cập nhật lạc quan. */
export function DashboardTask({ task }: { task: DashboardTaskData }) {
  const [done, setOptimisticDone] = useOptimistic(task.done);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const inputId = `task-${task.id}`;

  const onChange = (checked: boolean) =>
    startTransition(async () => {
      setError(null);
      setOptimisticDone(checked);
      const res = await toggleDoneAction(task.id, checked);
      if (!res.ok) setError(res.error);
    });

  return (
    <li className={`task${done ? " task--done" : ""}`}>
      <input id={inputId} type="checkbox" checked={done} onChange={(e) => onChange(e.target.checked)} />
      <div className="task__body">
        <label htmlFor={inputId} className="sr-only">
          Đánh dấu “{task.title}” đã xong
        </label>
        <p className="task__title">
          <Link href={`/deadlines/${task.id}`}>{task.title}</Link>
        </p>
        <p className="task__meta">
          {task.subjectName} · {formatDate(task.dueAt)}
        </p>
        {error && (
          <p role="alert" className="field__error">
            {error}
          </p>
        )}
      </div>
      <CountdownBadge dueAt={task.dueAt} done={done} />
    </li>
  );
}
