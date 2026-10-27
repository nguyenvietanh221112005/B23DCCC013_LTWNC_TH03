import { Brand } from "./brand";
import { NavLinks, type NavItem } from "./nav-links";
import { UserMenu } from "./user-menu";

/** Menu chung cho mọi trang. "Dashboard" và "Quản trị" được NavLinks tự thêm theo phiên đăng nhập. */
export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Trang chủ" },
  { href: "/deadlines", label: "Deadline" },
  { href: "/subjects", label: "Môn học" },
];

/** Server Component: chỉ phần nav (tô sáng trang hiện tại) và user menu là client. */
export function SiteHeader({ nav, showRoleKey }: { nav?: NavItem[]; showRoleKey?: boolean }) {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Brand />
        {nav && <NavLinks items={nav} />}
        <UserMenu showRoleKey={showRoleKey} />
      </div>
    </header>
  );
}

/** Header tối giản (404, error): chỉ có logo. */
export function BareHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Brand />
      </div>
    </header>
  );
}
