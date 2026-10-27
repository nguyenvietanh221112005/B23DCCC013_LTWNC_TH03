"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

/**
 * Trang công khai (SSG/ISR) không đọc cookie ở server, nên phiên đăng nhập
 * được lấy phía client. Nhóm (app) truyền sẵn `session` từ server để không bị nháy.
 */
export function Providers({ session, children }: { session?: Session | null; children: React.ReactNode }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
