import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { findUserByEmail } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(6).max(128),
});

/** Bật đăng nhập GitHub khi đã cấu hình biến môi trường (điểm cộng). */
export const githubEnabled = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await findUserByEmail(parsed.data.email);
        if (!user) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
    ...(githubEnabled
      ? [
          GitHub({
            // Tài khoản GitHub luôn là sinh viên; quyền admin chỉ cấp qua data/users.json.
            profile(p) {
              return {
                id: String(p.id),
                name: p.name ?? p.login,
                email: p.email,
                image: p.avatar_url,
                role: "user" as const,
              };
            },
          }),
        ]
      : []),
  ],
});
