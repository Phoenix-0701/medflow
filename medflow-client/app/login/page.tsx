// app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginForm from "./LoginForm";
import { LoginFormData } from "./types";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.emailOrPhone,
          password: data.password,
        }),
      });

      const rawResult = await res.json();
      const result = rawResult.data || rawResult;

      if (!res.ok) {
        throw new Error(result.message || "Email hoặc mật khẩu không đúng.");
      }

      if (result.user?.isLocked) {
        throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.");
      }

      // Lưu Token & User Object vào LocalStorage
      localStorage.setItem("accessToken", result.accessToken);
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      // Phân luồng theo Role
      const userRole = result.user?.role;
      if (userRole === "ADMIN") {
        router.push("/admin/doctors");
      } else if (userRole === "DOCTOR") {
        router.push("/doctor");
      } else {
        router.push("/patient");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Column (Branding & Info) - Hidden on mobile */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-blue-900 p-12 text-white lg:flex">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173ff9e2fa3?q=80&w=2070&auto=format&fit=crop"
            alt="Medical Background"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center gap-2 text-xl font-bold">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-sm backdrop-blur-md">
            <span className="text-xl">🩺</span>
          </div>
          BKMed AI
        </div>

        <div className="relative z-10 mb-12 max-w-lg">
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
            Chào mừng bạn đến với Hệ thống Y tế BKMed
          </h1>
          <p className="mb-8 text-lg font-medium text-blue-100/90">
            Trải nghiệm dịch vụ chăm sóc sức khỏe chuyên nghiệp cùng công nghệ trí tuệ nhân tạo tiên tiến, giúp quản lý hồ sơ bệnh án và lịch hẹn của bạn một cách an toàn và chính xác nhất.
          </p>
          <div className="flex flex-wrap gap-6 text-sm font-semibold text-blue-50">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                ✓
              </span>
              Bảo mật chuẩn quốc tế
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                ✓
              </span>
              Độ chính xác lâm sàng
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm font-medium text-blue-200/80">
          © {new Date().getFullYear()} BKMed AI Health System. All rights reserved.
        </div>
      </div>

      {/* Right Column (Form) */}
      <div className="flex flex-1 flex-col justify-center bg-white px-4 py-12 sm:px-6 lg:w-1/2 lg:flex-none lg:px-20 xl:px-24 dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8 lg:hidden flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg">
              🩺
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              BKMed AI
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-zinc-400">
              Secure patient portal access
            </p>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Đăng nhập tài khoản
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
              Vui lòng nhập thông tin để truy cập cổng thông tin hệ thống.
            </p>
          </div>

          <LoginForm onSubmit={handleLogin} loading={loading} error={error} />

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-zinc-400">
            {"Bạn chưa có tài khoản? "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
