"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { can } from "@/lib/permissions";

export interface NavItem {
  href: string;
  label: string;
}

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Menu chính. Các mục theo quyền (Dashboard, Quản trị) được thêm ở client dựa trên phiên đăng nhập,
 * nên hiện đúng ở cả trang công khai (SSG/ISR không đọc được cookie ở server).
 */
export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const extra: NavItem[] = [
    ...(can(role, "deadline:mark") ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(can(role, "deadline:create") ? [{ href: "/admin", label: "Quản trị" }] : []),
  ];
  const all = [...items, ...extra.filter((e) => !items.some((i) => i.href === e.href))];

  return (
    <nav className="nav" aria-label="Điều hướng chính">
      {all.map((item) => (
        <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
