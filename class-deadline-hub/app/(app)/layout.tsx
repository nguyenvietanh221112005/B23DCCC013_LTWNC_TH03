import type { Metadata } from "next";
import { auth } from "@/auth";
import { Providers } from "@/components/providers";
import { MAIN_NAV, SiteHeader } from "@/components/site-header";

/** Layout nhóm (app): trang cá nhân, render động (SSR) vì phụ thuộc phiên đăng nhập. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <Providers session={session}>
      <SiteHeader nav={MAIN_NAV} showRoleKey />
      <main id="main">{children}</main>
    </Providers>
  );
}
