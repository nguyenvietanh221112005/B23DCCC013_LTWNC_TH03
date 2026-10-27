import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { can, type Action } from "./permissions";

/**
 * Kiểm tra quyền ở phía server (không tin vào middleware).
 * Chưa đăng nhập → /login (giữ đường dẫn quay lại); thiếu quyền → /403.
 */
export async function requirePermission(action: Action, callbackUrl: string) {
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  if (!can(session.user.role, action)) redirect(`/403?from=${encodeURIComponent(callbackUrl)}`);
  return session.user;
}
