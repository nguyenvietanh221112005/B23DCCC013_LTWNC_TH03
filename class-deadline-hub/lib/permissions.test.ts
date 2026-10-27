import { ACTIONS, ROLES, can, isAuthRole, protectedRouteFor, type Action, type Role } from "./permissions";

/** Ma trận kỳ vọng — viết lại độc lập với lib/permissions.ts, đúng như bảng trong đề bài. */
const EXPECTED: Record<Action, Record<Role, boolean>> = {
  "deadline:view": { guest: true, user: true, admin: true },
  "deadline:mark": { guest: false, user: true, admin: true },
  "deadline:create": { guest: false, user: false, admin: true },
  "deadline:delete": { guest: false, user: false, admin: true },
};

describe("can(role, action) — ma trận phân quyền", () => {
  const cases = ACTIONS.flatMap((action) => ROLES.map((role) => [role, action, EXPECTED[action][role]] as const));

  test.each(cases)("%s + %s → %s", (role, action, allowed) => {
    expect(can(role, action)).toBe(allowed);
  });

  test("có đủ 4 hành động × 3 vai trò", () => {
    expect(ACTIONS).toHaveLength(4);
    expect(ROLES).toHaveLength(3);
    expect(cases).toHaveLength(12);
  });

  test("chưa đăng nhập (null/undefined) được coi là guest", () => {
    expect(can(null, "deadline:view")).toBe(true);
    expect(can(undefined, "deadline:view")).toBe(true);
    expect(can(null, "deadline:mark")).toBe(false);
    expect(can(undefined, "deadline:create")).toBe(false);
    expect(can(null, "deadline:delete")).toBe(false);
  });

  test("chỉ admin được thêm và xoá deadline", () => {
    const writers = ROLES.filter((r) => can(r, "deadline:create") || can(r, "deadline:delete"));
    expect(writers).toEqual(["admin"]);
  });

  test("admin có mọi quyền, guest chỉ có quyền xem", () => {
    expect(ACTIONS.every((a) => can("admin", a))).toBe(true);
    expect(ACTIONS.filter((a) => can("guest", a))).toEqual(["deadline:view"]);
  });
});

describe("isAuthRole", () => {
  test("chỉ chấp nhận user và admin", () => {
    expect(isAuthRole("user")).toBe(true);
    expect(isAuthRole("admin")).toBe(true);
    expect(isAuthRole("guest")).toBe(false);
    expect(isAuthRole("superadmin")).toBe(false);
    expect(isAuthRole(undefined)).toBe(false);
  });
});

describe("protectedRouteFor — bảng route cho middleware", () => {
  test("/admin cần quyền thêm deadline, /dashboard cần quyền đánh dấu", () => {
    expect(protectedRouteFor("/admin")?.action).toBe("deadline:create");
    expect(protectedRouteFor("/dashboard")?.action).toBe("deadline:mark");
    expect(protectedRouteFor("/dashboard/pending")?.action).toBe("deadline:mark");
  });

  test("trang công khai không bị bảo vệ, và không khớp nhầm tiền tố", () => {
    expect(protectedRouteFor("/")).toBeUndefined();
    expect(protectedRouteFor("/deadlines/1")).toBeUndefined();
    expect(protectedRouteFor("/administrator")).toBeUndefined();
  });

  test("user vào /admin bị từ chối, admin vào được", () => {
    const rule = protectedRouteFor("/admin")!;
    expect(can("user", rule.action)).toBe(false);
    expect(can("admin", rule.action)).toBe(true);
    expect(can(undefined, rule.action)).toBe(false);
  });
});
