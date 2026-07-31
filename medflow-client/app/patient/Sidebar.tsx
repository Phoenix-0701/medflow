// app/patient/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PatientSidebar() {
  const pathname = usePathname();
  const [patientInfo, setPatientInfo] = useState<{ fullName: string, avatarUrl?: string }>({
    fullName: "Bệnh nhân",
  });

  useEffect(() => {
    // 1. Lấy thông tin tạm từ LocalStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setPatientInfo({
          fullName: u.fullName || "Bệnh nhân",
          avatarUrl: u.avatarUrl,
        });
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Tự động lấy lại dữ liệu thật từ Server để đảm bảo có ảnh avatar mới nhất
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          setPatientInfo({
            fullName: data.fullName || "Bệnh nhân",
            avatarUrl: data.avatarUrl,
          });
          localStorage.setItem("user", JSON.stringify(data));
        }
      } catch (e) {}
    }
    fetchUser();
  }, []);

  const navItems = [
    { name: "Trang chủ", href: "/patient", icon: "🏠" },
    { name: "Đặt lịch", href: "/patient/booking", icon: "📅" },
    { name: "Lịch sử khám", href: "/patient/history", icon: "🕒" },
    { name: "Hồ sơ cá nhân", href: "/patient/profile", icon: "👤" },
  ];

  return (
    <aside className="hidden md:flex w-72 shrink-0 border-r border-gray-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 min-h-screen p-6 flex-col justify-between">
      <div>
        {/* Menu Title */}
        <p className="px-3 text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-4">
          MENU CHÍNH
        </p>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/patient"
                ? pathname === "/patient"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all min-h-[52px] ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 dark:bg-blue-600 dark:text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile Footer (Desktop Sidebar) */}
      <div className="border-t border-gray-100 pt-6 dark:border-zinc-800 flex flex-col gap-4">
        {/* Profile Info */}
        <div className="flex items-center gap-3 px-1">
          <div className="h-12 w-12 shrink-0 rounded-full bg-blue-100 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center text-blue-700 font-bold">
            {patientInfo.avatarUrl ? (
              <img src={patientInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              patientInfo.fullName.split(" ").slice(-2).map((n) => n[0]).join("")
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {patientInfo.fullName}
            </h4>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              Thành viên
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors dark:bg-zinc-800 dark:text-rose-400 dark:hover:bg-rose-900/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
