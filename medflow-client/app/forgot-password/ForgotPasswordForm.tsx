"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ForgotPasswordFormData, ResetPasswordFormData } from "./types";

interface ForgotPasswordFormProps {
  onRequestOtp: (data: ForgotPasswordFormData) => Promise<void>;
  onResetPassword: (data: ResetPasswordFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: string | null;
  step: "REQUEST_OTP" | "RESET_PASSWORD";
  email: string;
}

export default function ForgotPasswordForm({
  onRequestOtp,
  onResetPassword,
  loading,
  error,
  success,
  step,
  email,
}: ForgotPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [requestData, setRequestData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [resetData, setResetData] = useState<ResetPasswordFormData>({
    code: "",
    newPassword: "",
  });

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestOtp(requestData);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    onResetPassword(resetData);
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          ✅ {success}
        </div>
      )}

      {step === "REQUEST_OTP" && (
        <form onSubmit={handleRequest} className="flex flex-col gap-4">
          <div className="text-center mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Khôi phục mật khẩu
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Nhập email đăng ký của bạn. Chúng tôi sẽ gửi một mã OTP để thiết lập lại mật khẩu.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-400">📧</span>
              <input
                type="email"
                required
                placeholder="patient@example.com"
                value={requestData.email}
                onChange={(e) =>
                  setRequestData({ email: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white min-h-[44px] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full min-h-[48px] rounded-full bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? "Đang gửi yêu cầu..." : "Nhận mã OTP"}
          </button>
        </form>
      )}

      {step === "RESET_PASSWORD" && (
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <div className="text-center mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Tạo mật khẩu mới
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Mã OTP đã được gửi đến <b>{email}</b>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
              Mã xác nhận (OTP)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-400">💬</span>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={resetData.code}
                onChange={(e) => setResetData({ ...resetData, code: e.target.value })}
                className="w-full text-center tracking-[0.5em] font-mono rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-4 pr-4 text-lg text-gray-900 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white min-h-[44px] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
              Mật khẩu mới
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-400">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="**********"
                value={resetData.newPassword}
                onChange={(e) =>
                  setResetData({ ...resetData, newPassword: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-10 text-sm text-gray-900 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white min-h-[44px] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || resetData.code.length !== 6 || resetData.newPassword.length < 6}
            className="w-full min-h-[48px] rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </form>
      )}
    </div>
  );
}
