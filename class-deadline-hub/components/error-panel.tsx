"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { AlertIcon, RefreshIcon } from "./icons";

/** Nội dung dùng chung cho các file error.tsx (bắt buộc là Client Component). */
export function ErrorPanel({
  error,
  reset,
  title,
  message = "Máy chủ không đọc được dữ liệu. Bạn thử lại sau ít phút nhé.",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title: string;
  message?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  // Làm mới dữ liệu từ server rồi render lại segment bị lỗi.
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <div className="status-page">
      <div className="card error-card" role="alert">
        <span className="icon-tile icon-tile--warn">
          <AlertIcon size={20} />
        </span>
        <h1>{title}</h1>
        <p>{message}</p>
        {error.digest && (
          <p style={{ fontSize: 12, color: "var(--faint)" }}>Mã lỗi: {error.digest}</p>
        )}
        <div className="status-page__actions">
          <button type="button" className="btn btn--primary" onClick={retry} disabled={pending}>
            <RefreshIcon size={14} /> {pending ? "Đang thử lại…" : "Thử lại"}
          </button>
          <Link href="/" className="btn btn--outline">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
