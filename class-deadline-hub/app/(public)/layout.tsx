import { MAIN_NAV, SiteHeader } from "@/components/site-header";

/**
 * Layout nhóm (public): trang ai cũng xem được, render tĩnh (SSG/ISR).
 * Không gọi auth() ở đây — đọc cookie sẽ biến mọi trang con thành dynamic.
 */

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader nav={MAIN_NAV} />
      <main id="main">{children}</main>
    </>
  );
}
