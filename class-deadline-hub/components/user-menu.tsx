"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ROLE_LABEL } from "@/lib/permissions";

export function initials(name?: string | null) {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  const picked = words.length === 1 ? [words[0]] : [words[0], words[words.length - 1]];
  return picked.map((w) => w[0]?.toUpperCase() ?? "").join("");
}

/** Phần bên phải header: tên + vai trò + Đăng xuất, hoặc "Khách" + Đăng nhập. */
export function UserMenu({ showRoleKey = false }: { showRoleKey?: boolean }) {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();

  // Auth.js không tự lấy lại phiên khi client đang ở trạng thái "Khách" (session = null).
  // Nếu đã đăng nhập/đăng xuất ở tab khác hoặc bị server chuyển hướng, header sẽ lệch với cookie thật,
  // nên ta chủ động đồng bộ khi quay lại tab/lấy lại focus. Dùng ref vì hàm update đổi tham chiếu mỗi lần render.
  const updateRef = useRef(update);
  updateRef.current = update;

  useEffect(() => {
    const sync = () => {
      if (document.visibilityState === "visible") void updateRef.current();
    };
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("focus", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  // Đổi trang (điều hướng mềm) cũng đồng bộ lại một lần.
  useEffect(() => {
    void updateRef.current();
  }, [pathname]);

  // Chỉ để trống ở lần tải đầu; các lần đồng bộ lại sau đó giữ nguyên giao diện hiện tại để không nháy.
  const settled = useRef(false);
  if (status !== "loading") settled.current = true;

  if (status === "loading" && !settled.current) {
    return <div className="user-menu" aria-busy="true" />;
  }

  if (!session?.user) {
    const loginHref = pathname && pathname !== "/" && pathname !== "/login"
      ? `/login?callbackUrl=${encodeURIComponent(pathname)}`
      : "/login";
    return (
      <div className="user-menu">
        <span className="user-menu__guest">Khách</span>
        {pathname !== "/login" && (
          <Link href={loginHref} className="btn btn--dark">
            Đăng nhập
          </Link>
        )}
      </div>
    );
  }

  const { name, role, image } = session.user;
  return (
    <div className="user-menu">
      <div className="user-menu__who">
        <span className={`avatar${role === "admin" ? " avatar--admin" : ""}`}>
          {image ? <Image src={image} alt="" width={30} height={30} /> : initials(name)}
        </span>
        <span className="user-menu__text">
          <span className="user-menu__name" style={{ display: "block" }}>
            {name}
          </span>
          <span className="user-menu__role">
            {ROLE_LABEL[role]}
            {showRoleKey && ` · ${role}`}
          </span>
        </span>
      </div>
      <button type="button" className="btn btn--outline" onClick={() => signOut({ callbackUrl: "/" })}>
        Đăng xuất
      </button>
    </div>
  );
}
