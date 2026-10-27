"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Nội dung trang 404 của dự án. not-found.tsx không nhận params nên id được đọc từ URL. */
export function NotFoundView({ kind = "page" }: { kind?: "page" | "deadline" }) {
  const pathname = usePathname();
  const id = kind === "deadline" ? pathname?.split("/").filter(Boolean)[1] : undefined;

  return (
    <div className="status-page">
      <div>
        <p className="status-page__code" aria-hidden="true">
          404
        </p>
        <h1>{kind === "deadline" ? "Không tìm thấy deadline" : "Không tìm thấy trang"}</h1>
        <p>
          {kind === "deadline" ? (
            <>
              Deadline {id ? <>#{decodeURIComponent(id)} </> : null}không tồn tại hoặc đã bị lớp trưởng xoá. Kiểm tra
              lại đường dẫn, hoặc xem danh sách đầy đủ.
            </>
          ) : (
            // Không in pathname: trang 404 chung được prerender lúc build nên sẽ lệch khi hydrate.
            <>Đường dẫn bạn mở không tồn tại. Có thể trang đã được đổi tên hoặc xoá.</>
          )}
        </p>
        <div className="status-page__actions">
          <Link href="/deadlines" className="btn btn--primary">
            Xem tất cả deadline
          </Link>
          <Link href="/" className="btn btn--outline">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
