import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đã hoàn thành",
  robots: { index: false, follow: false },
};

export default function DonePage() {
  return <DashboardView filter="done" path="/dashboard/done" />;
}
