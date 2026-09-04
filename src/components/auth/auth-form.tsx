"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

const AUTH_KEY = "aws-journal:auth:v1";

export function AuthForm({ locale, mode }: { locale: Locale; mode: "login" | "signup" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const vi = locale === "vi";
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true);
    try { localStorage.setItem(AUTH_KEY, "signed-in"); } catch {}
    window.dispatchEvent(new Event("aws-journal-auth"));
    window.setTimeout(() => { router.push(`/${locale}`); }, 280);
  }
  return <form className="auth-form" onSubmit={submit}>{mode === "signup" ? <label><span>{vi ? "Tên" : "Name"}</span><input name="name" autoComplete="name" required placeholder={vi ? "Tên hiển thị" : "Display name"} /></label> : null}<label><span>Email</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label><label><span>{vi ? "Mật khẩu" : "Password"}</span><input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required /></label>{mode === "signup" ? <label><span>{vi ? "Xác nhận mật khẩu" : "Confirm password"}</span><input name="confirm-password" type="password" autoComplete="new-password" minLength={6} required /></label> : <div className="form-inline"><label className="checkbox"><input type="checkbox" name="remember" /><span>{vi ? "Ghi nhớ tôi" : "Remember me"}</span></label><button type="button" className="text-button">{vi ? "Quên mật khẩu?" : "Forgot password?"}</button></div>}<button className="button auth-submit" type="submit" disabled={loading}>{loading ? (vi ? "Đang mở nhật ký..." : "Opening journal...") : mode === "login" ? (vi ? "Đăng nhập bản demo" : "Demo log in") : (vi ? "Tạo tài khoản demo" : "Create demo account")}</button><p className="form-note">{vi ? "Chỉ là trạng thái giao diện. Không có dữ liệu đăng nhập nào được gửi đi." : "UI state only. No credentials are sent or stored."}</p></form>;
}
