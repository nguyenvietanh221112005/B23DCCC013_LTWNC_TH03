import type { NextAuthConfig } from "next-auth";
import { isAuthRole } from "@/lib/permissions";

/**
 * Cấu hình dùng chung, KHÔNG phụ thuộc Node (không fs, không bcrypt)
 * để middleware chạy ở Edge runtime cũng import được.
 * Provider thật (Credentials đọc file JSON) được thêm trong auth.ts.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user, account, profile }) {
      // `user` chỉ có ở lần đăng nhập đầu tiên → chép id và role vào token.
      if (user) {
        token.id = account?.provider === "github" && profile?.id ? `github-${profile.id}` : (user.id ?? token.sub);
        token.role = isAuthRole(user.role) ? user.role : "user";
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && isAuthRole(token.role)) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
