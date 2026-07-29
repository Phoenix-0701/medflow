// app/register/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    if (!agreeTerms) {
      setError("Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          password,
          role: "PATIENT",
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Đăng ký không thành công.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi kết nối với máy chủ.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50/50 p-4 dark:bg-zinc-950 font-sans">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#0052cc] text-white shadow-md">
          <div className="h-6 w-6 rounded-full bg-white/30 backdrop-blur-xs" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#003e9b] dark:text-blue-400">
          HealthAI
        </h1>
        <p className="mt-1.5 text-xs font-medium text-gray-500 dark:text-zinc-400">
          Create your patient portal account
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {success ? (
          <div className="rounded-xl bg-emerald-50 p-4 text-center text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            ✓ Đăng ký tài khoản thành công! Đang chuyển hướng sang trang đăng nhập...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">👤</span>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-xs text-gray-900 focus:border-[#0052cc] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📞</span>
                <input
                  type="tel"
                  required
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-xs text-gray-900 focus:border-[#0052cc] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">✉️</span>
                <input
                  type="email"
                  required
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-xs text-gray-900 focus:border-[#0052cc] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 py-2.5 text-xs text-gray-900 focus:border-[#0052cc] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-xs text-gray-900 focus:border-[#0052cc] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 rounded-md border-gray-300 text-[#0052cc] focus:ring-[#0052cc] cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-gray-600 dark:text-zinc-400 cursor-pointer select-none">
                I agree to the{" "}
                <Link href="#" className="font-semibold text-[#0052cc] hover:underline dark:text-blue-400">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="font-semibold text-[#0052cc] hover:underline dark:text-blue-400">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-[#0052cc] py-3 text-xs font-bold text-white shadow-md hover:bg-[#003e9b] transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Registering..." : "Register Account"}
            </button>

            <p className="mt-2 text-center text-xs text-gray-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#0052cc] hover:underline dark:text-blue-400">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}