// app/admin/layout.tsx
import Sidebar from "./Sidebar";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-black">
      {/* 1. Sidebar Bên Trái */}
      <Sidebar />

      {/* 2. Main Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Header trên cùng */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="text-sm font-medium text-gray-500 dark:text-zinc-400">
            Hệ thống Quản trị Y tế
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-semibold text-gray-600 hover:text-blue-600 dark:text-zinc-300"
            >
              🌐 Xem Trang Chủ
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Nội dung thay đổi từng trang */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
