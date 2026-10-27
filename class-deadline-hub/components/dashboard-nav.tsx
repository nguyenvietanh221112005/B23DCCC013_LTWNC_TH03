"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckIcon, ClockIcon, GridIcon } from "./icons";

const ITEMS = [
  { href: "/dashboard", label: "Tổng quan", Icon: GridIcon, key: "all" },
  { href: "/dashboard/pending", label: "Chưa xong", Icon: ClockIcon, key: "pending" },
  { href: "/dashboard/done", label: "Đã hoàn thành", Icon: CheckIcon, key: "done" },
] as const;

/** Sidebar của layout lồng /dashboard — tô sáng trang hiện tại. */
export function DashboardNav({ counts }: { counts: Record<(typeof ITEMS)[number]["key"], number> }) {
  const pathname = usePathname();
  return (
    <nav className="card sidenav" aria-label="Dashboard">
      {ITEMS.map(({ href, label, Icon, key }) => (
        <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
          <Icon />
          {label}
          <span className="sidenav__count">{counts[key]}</span>
        </Link>
      ))}
    </nav>
  );
}
