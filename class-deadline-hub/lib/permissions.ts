/**
 * Ma trận phân quyền — NƠI DUY NHẤT định nghĩa ai được làm gì.
 * Middleware, trang /admin, Server Action và UI đều gọi can(role, action).
 * File này không import gì từ Node nên chạy được cả ở Edge (middleware).
 */

export const ROLES = ["guest", "user", "admin"] as const;
export type Role = (typeof ROLES)[number];

/** Vai trò của người đã đăng nhập (guest = chưa đăng nhập, không lưu trong session). */
export type AuthRole = Exclude<Role, "guest">;

export const ACTIONS = ["deadline:view", "deadline:mark", "deadline:create", "deadline:delete"] as const;
export type Action = (typeof ACTIONS)[number];

const MATRIX: Record<Action, Record<Role, boolean>> = {
  "deadline:view": { guest: true, user: true, admin: true },
  "deadline:mark": { guest: false, user: true, admin: true },
  "deadline:create": { guest: false, user: false, admin: true },
  "deadline:delete": { guest: false, user: false, admin: true },
};

export function can(role: Role | null | undefined, action: Action): boolean {
  return MATRIX[action][role ?? "guest"];
}

export function isAuthRole(value: unknown): value is AuthRole {
  return value === "user" || value === "admin";
}

/** Route được bảo vệ → hành động cần có để vào. Middleware đọc bảng này. */
export const PROTECTED_ROUTES: { prefix: string; action: Action }[] = [
  { prefix: "/admin", action: "deadline:create" },
  { prefix: "/dashboard", action: "deadline:mark" },
];

export function protectedRouteFor(pathname: string) {
  return PROTECTED_ROUTES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
}

export const ROLE_LABEL: Record<Role, string> = {
  guest: "Khách",
  user: "Sinh viên",
  admin: "Lớp trưởng",
};
