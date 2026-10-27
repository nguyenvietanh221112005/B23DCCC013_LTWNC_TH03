import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard-view";

// SSR: mỗi request render lại theo phiên đăng nhập và tiến độ mới nhất.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DashboardView filter="all" path="/dashboard" />;
}
