import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, githubEnabled } from "@/auth";
import { LockIcon } from "@/components/icons";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false, follow: false },
};

/** Chỉ chấp nhận đường dẫn nội bộ để tránh open redirect (vd. ?callbackUrl=https://evil.com). */
function safeCallback(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const callbackUrl = safeCallback(sp.callbackUrl);
  const session = await auth();
  if (session?.user) redirect(callbackUrl ?? "/dashboard");

  const target = callbackUrl ?? "/dashboard";
  const targetPath = target.split("?")[0];

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1>Đăng nhập</h1>
        <p className="page-sub">Đăng nhập để đánh dấu deadline đã xong.</p>

        {callbackUrl && (
          <p className="notice">
            <LockIcon size={14} />
            <span>
              Bạn cần đăng nhập để mở <strong>{targetPath}</strong>. Sau khi đăng nhập sẽ quay lại trang đó.
            </span>
          </p>
        )}
        {sp.error && (
          <p className="notice notice--error" role="alert">
            Đăng nhập không thành công. Vui lòng thử lại.
          </p>
        )}

        <LoginForm callbackUrl={target} githubEnabled={githubEnabled} />
      </div>
    </div>
  );
}
