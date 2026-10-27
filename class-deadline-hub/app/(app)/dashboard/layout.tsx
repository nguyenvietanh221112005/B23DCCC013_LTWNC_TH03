import { DashboardNav } from "@/components/dashboard-nav";
import { getDeadlines, getDoneIds } from "@/lib/db";
import { requirePermission } from "@/lib/session";

/** Layout lồng của /dashboard: sidebar bên trái, nội dung từng trang con bên phải. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePermission("deadline:mark", "/dashboard");
  const [deadlines, doneIds] = await Promise.all([getDeadlines(), getDoneIds(user.id)]);
  const done = deadlines.filter((d) => doneIds.includes(d.id)).length;

  return (
    <div className="container dash">
      <DashboardNav counts={{ all: deadlines.length, pending: deadlines.length - done, done }} />
      <div>{children}</div>
    </div>
  );
}
