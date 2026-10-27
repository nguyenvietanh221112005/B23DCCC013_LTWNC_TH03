"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { toggleDoneAction } from "@/lib/actions";
import { can } from "@/lib/permissions";
import { CheckIcon } from "./icons";

/**
 * Nút "Đánh dấu đã xong" ở trang chi tiết (trang ISR, HTML giống nhau cho mọi người).
 * Trạng thái riêng của từng sinh viên được lấy phía client qua /api/progress.
 */
export function MarkDoneButton({ deadlineId }: { deadlineId: number }) {
  const { data: session, status } = useSession();
  const [done, setDone] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const allowed = can(session?.user?.role, "deadline:mark");

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    fetch("/api/progress", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { doneIds: [] }))
      .then((data: { doneIds: number[] }) => {
        if (!cancelled) setDone(data.doneIds.includes(deadlineId));
      })
      .catch(() => !cancelled && setDone(false));
    return () => {
      cancelled = true;
    };
  }, [allowed, deadlineId]);

  if (status === "loading") {
    return (
      <button type="button" className="btn btn--primary btn--lg" disabled>
        Đang tải…
      </button>
    );
  }

  if (!session?.user) {
    return (
      <>
        <Link href={`/login?callbackUrl=/deadlines/${deadlineId}`} className="btn btn--primary btn--lg">
          Đăng nhập để đánh dấu đã xong
        </Link>
        <span className="muted" style={{ fontSize: 13 }}>
          Chỉ sinh viên đã đăng nhập mới đánh dấu được.
        </span>
      </>
    );
  }

  if (!allowed) return null;

  const toggle = () =>
    startTransition(async () => {
      setError(null);
      const next = !done;
      const res = await toggleDoneAction(deadlineId, next);
      if (res.ok) setDone(res.done);
      else setError(res.error);
    });

  return (
    <>
      <button
        type="button"
        className={`btn btn--lg ${done ? "btn--outline" : "btn--primary"}`}
        onClick={toggle}
        disabled={done === null || pending}
        aria-pressed={done ?? false}
      >
        <span className="checkbox-icon">{done && <CheckIcon size={11} strokeWidth={3} />}</span>
        {done ? "Đã xong — bỏ đánh dấu" : "Đánh dấu đã xong"}
      </button>
      {done && <span className="badge badge--done">Đã xong</span>}
      {error && (
        <span role="alert" className="field__error">
          {error}
        </span>
      )}
    </>
  );
}
