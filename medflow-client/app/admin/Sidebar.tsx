// app/admin/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Trang chủ", href: "/admin", icon: "📊" },
    { name: "Bác sĩ", href: "/admin/doctors", icon: "🏥" },
    { name: "Bệnh nhân", href: "/admin/patients", icon: "👥" },
    { name: "Cài đặt", href: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 min-h-screen p-4 flex flex-col justify-between">
      <div>
        {/* Logo Brand */}
        <div className="px-3 py-4 mb-4">
          <Link href="/admin" className="text-xl font-bold text-blue-600 dark:text-blue-500">
            Admin Portal
          </Link>
          <p className="text-[10px] text-gray-400 mt-0.5">Health Systems v2.1</p>
        </div>

        <p className="px-3 text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">
          Admin Menu
        </p>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            // Kiểm tra active route
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all min-h-[44px] ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shadow-xs"
                    : "text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout / User Info */}
      <div className="border-t border-gray-100 pt-4 dark:border-zinc-800">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          🚪 Đăng xuất
        </button>
      </div>
    </aside>
  );
}
