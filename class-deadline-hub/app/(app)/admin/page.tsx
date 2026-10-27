import type { Metadata } from "next";
import Link from "next/link";
import { CreateDeadlineForm, DeleteDeadlineButton } from "@/components/admin-forms";
import { formatDateTime } from "@/lib/date";
import { getDeadlinesById, getSubjects } from "@/lib/db";
import { can } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";

// SSR: chỉ admin, luôn đọc dữ liệu mới nhất.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quản trị deadline",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Tự kiểm tra quyền, KHÔNG dựa vào middleware.
  const user = await requirePermission("deadline:create", "/admin");
  const canDelete = can(user.role, "deadline:delete");
  const [deadlines, subjects] = await Promise.all([getDeadlinesById(), getSubjects()]);

  return (
    <div className="container page">
      <h1 className="page-title">Quản trị deadline</h1>
      <p className="page-sub">
        Thêm hoặc xoá deadline. Trang chi tiết được làm mới ngay sau mỗi thay đổi; danh sách /deadlines cập nhật trong
        tối đa 60 giây.
      </p>

      <div className="admin-grid">
        <section className="card admin-form" aria-labelledby="create-title">
          <h2 id="create-title">Thêm deadline</h2>
          <CreateDeadlineForm subjects={subjects} />
        </section>

        <section className="card admin-table-wrap" aria-labelledby="list-title">
          <div className="panel__head">
            <h2 id="list-title">Danh sách ({deadlines.length})</h2>
          </div>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Deadline</th>
                  <th scope="col">Môn</th>
                  <th scope="col">Hạn nộp</th>
                  {canDelete && (
                    <th scope="col" style={{ textAlign: "center" }}>
                      Thao tác
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {deadlines.map((d) => (
                  <tr key={d.id}>
                    <td className="num">{d.id}</td>
                    <td className="title-cell">
                      <Link href={`/deadlines/${d.id}`}>{d.title}</Link>
                    </td>
                    <td className="muted">{d.subject.shortName}</td>
                    <td className="muted">{formatDateTime(d.dueAt)}</td>
                    {canDelete && (
                      <td style={{ textAlign: "center" }}>
                        <DeleteDeadlineButton id={d.id} title={d.title} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
