import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chưa xong",
  robots: { index: false, follow: false },
};

export default function PendingPage() {
  return <DashboardView filter="pending" path="/dashboard/pending" />;
}
