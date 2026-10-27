import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { LockIcon } from "@/components/icons";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { ROLE_LABEL } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Không có quyền truy cập",
  robots: { index: false, follow: false },
};

export default async function ForbiddenPage() {
  const session = await auth();
  const role = session?.user?.role ?? "guest";

  return (
    <Providers session={session}>
      <SiteHeader showRoleKey={false} />
      <main className="status-page">
        <div>
          <span className="icon-tile icon-tile--danger">
            <LockIcon size={20} />
          </span>
          <p className="forbidden__code">LỖI 403</p>
          <h1 style={{ marginTop: 6 }}>Bạn không có quyền vào trang này</h1>
          <p>
            Trang quản trị chỉ dành cho lớp trưởng. Bạn đang đăng nhập với vai trò <strong>{ROLE_LABEL[role]}</strong>.
          </p>
          <div className="status-page__actions">
            <Link href={session?.user ? "/dashboard" : "/"} className="btn btn--primary">
              {session?.user ? "Về Dashboard" : "Về trang chủ"}
            </Link>
            <Link href="/login?callbackUrl=/admin" className="btn btn--outline">
              Đăng nhập tài khoản khác
            </Link>
          </div>
        </div>
      </main>
    </Providers>
  );
}
