// app/doctor/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function DoctorSidebar() {
  const pathname = usePathname();
  const [doctorInfo, setDoctorInfo] = useState<{ fullName: string; specialty: string }>({
    fullName: "Dr. Nguyen Van A",
    specialty: "Tiêu hóa",
  });

  useEffect(() => {
    // 1. Khôi phục từ LocalStorage tạm thời để UI không bị trống
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setDoctorInfo({
          fullName: u.fullName || "Bác sĩ",
          specialty: u.doctorProfile?.specialty || "Đang tải...",
        });
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Fetch API để lấy chức danh chính xác nhất
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        const payload = data.data || data; // Handle TransformInterceptor
        if (payload?.doctorProfile) {
          setDoctorInfo({
            fullName: payload.fullName || "Bác sĩ",
            specialty: payload.doctorProfile.specialty || "Chưa cập nhật",
          });
          // Cập nhật lại localStorage luôn để lần sau load nhanh hơn
          localStorage.setItem("user", JSON.stringify(payload));
        }
      })
      .catch(err => console.error("Lỗi fetch thông tin bác sĩ:", err));
    }
  }, []);

  const navItems = [
    { name: "Lịch khám", href: "/doctor", icon: "📅" },
    { name: "Bệnh nhân", href: "/doctor/patients", icon: "👥" },
    { name: "Thiết lập lịch rảnh", href: "/doctor/settings", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-gray-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 min-h-screen p-5 flex flex-col justify-between">
      <div>
        {/* Brand Logo */}
        <div className="mb-8 px-2">
          <Link href="/doctor" className="text-xl font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-blue-700">
              <path d="M12 2L3 6v6.5c0 5.05 3.81 9.8 8.74 11.45 4.93-1.65 8.76-6.4 8.76-11.45V6l-9-4zm4 11h-3v3h-2v-3H8v-2h3V8h2v3h3v2z"/>
            </svg> 
            BKMed AI
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/doctor"
                ? pathname === "/doctor"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all min-h-[46px] ${
                  isActive
                    ? "bg-blue-50/80 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold shadow-2xs"
                    : "text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Doctor Profile Footer */}
      <div className="border-t border-gray-100 pt-5 dark:border-zinc-800 flex flex-col gap-4">
        {/* Profile Info */}
        <div className="flex items-center gap-3 px-1">
          <div className="h-12 w-12 shrink-0 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop" 
              alt="Doctor Avatar" 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {doctorInfo.fullName}
            </h4>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              Chuyên khoa: {doctorInfo.specialty}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors dark:bg-zinc-800 dark:text-rose-400 dark:hover:bg-rose-900/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
