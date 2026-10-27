"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { GitHubIcon } from "./icons";

export function LoginForm({ callbackUrl, githubEnabled }: { callbackUrl: string; githubEnabled: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const res = await signIn("credentials", { email, password, redirect: false });
      if (!res || res.error) {
        setError("Email hoặc mật khẩu không đúng.");
        return;
      }
      // Tải lại hẳn trang để mọi Server Component đọc cookie phiên mới.
      window.location.assign(callbackUrl);
    });
  };

  return (
    <>
      <form className="form" onSubmit={onSubmit} noValidate>
        {error && (
          <p role="alert" className="notice notice--error" style={{ marginTop: 0 }}>
            {error}
          </p>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            placeholder="ten@ptit.edu.vn"
            autoComplete="email"
            required
            aria-invalid={error ? true : undefined}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            minLength={6}
            aria-invalid={error ? true : undefined}
          />
        </div>
        <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={pending}>
          {pending ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>

      {githubEnabled && (
        <>
          <div className="divider">hoặc</div>
          <button
            type="button"
            className="btn btn--dark btn--lg btn--block"
            onClick={() => signIn("github", { callbackUrl })}
          >
            <GitHubIcon /> Đăng nhập với GitHub
          </button>
        </>
      )}
    </>
  );
}
