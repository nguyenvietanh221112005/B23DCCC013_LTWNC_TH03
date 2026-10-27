import { formatDate, weekday } from "@/lib/date";
import { getDeadlines, getDoneIds } from "@/lib/db";
import { requirePermission } from "@/lib/session";
import { DashboardTask } from "./dashboard-task";

type Filter = "all" | "pending" | "done";

const TITLES: Record<Filter, string> = {
  all: "Deadline của tôi",
  pending: "Chưa xong",
  done: "Đã hoàn thành",
};

/** Nội dung chung của 3 trang /dashboard, /dashboard/pending, /dashboard/done (Server Component, SSR). */
export async function DashboardView({ filter, path }: { filter: Filter; path: string }) {
  const user = await requirePermission("deadline:mark", path);
  const [deadlines, doneIds] = await Promise.all([getDeadlines(), getDoneIds(user.id)]);
  const doneSet = new Set(doneIds);
  const pendingCount = deadlines.filter((d) => !doneSet.has(d.id)).length;

  const tasks = deadlines
    .map((d) => ({
      id: d.id,
      title: d.title,
      dueAt: d.dueAt,
      subjectName: d.subject.shortName,
      done: doneSet.has(d.id),
    }))
    .filter((t) => (filter === "all" ? true : filter === "done" ? t.done : !t.done));

  const now = new Date();
  const firstName = user.name?.trim().split(/\s+/).pop() ?? "bạn";

  return (
    <>
      <h1 className="page-title" style={{ fontSize: 26 }}>
        Chào {firstName}
      </h1>
      <p className="page-sub">
        {weekday(now)}, {formatDate(now)} · bạn còn {pendingCount} deadline chưa xong
      </p>

      <section className="card" style={{ marginTop: 16 }} aria-labelledby="my-deadlines">
        <div className="panel__head">
          <h2 id="my-deadlines" className="panel__title">
            {TITLES[filter]}
          </h2>
          <span className="panel__hint">Tích vào ô để đánh dấu đã xong</span>
        </div>
        {tasks.length === 0 ? (
          <p className="empty">
            {filter === "done" ? "Bạn chưa hoàn thành deadline nào." : "Tuyệt! Bạn đã xong hết deadline."}
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {tasks.map((t) => (
              <DashboardTask key={t.id} task={t} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
