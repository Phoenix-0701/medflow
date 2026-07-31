// app/patient/layout.tsx
"use client";

import PatientSidebar from "./Sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ChatWidget from "../ChatWidget";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Trang chủ", href: "/patient", icon: "🏠" },
    { name: "Đặt lịch", href: "/patient/booking", icon: "📅" },
    { name: "Lịch sử", href: "/patient/history", icon: "🕒" },
    { name: "Hồ sơ", href: "/patient/profile", icon: "👤" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black font-sans flex-col md:flex-row">
      {/* Mobile Top Header (Visible only on mobile) */}
      <header className="md:hidden sticky top-0 z-40 flex h-16 items-center justify-center border-b border-gray-100 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Link href="/patient" className="text-lg font-extrabold text-blue-900 dark:text-blue-400 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-700">
            <path d="M12 2L3 6v6.5c0 5.05 3.81 9.8 8.74 11.45 4.93-1.65 8.76-6.4 8.76-11.45V6l-9-4zm4 11h-3v3h-2v-3H8v-2h3V8h2v3h3v2z"/>
          </svg>
          BKMed AI
        </Link>
      </header>

      {/* Desktop Sidebar (Hidden on mobile) */}
      <PatientSidebar />

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-x-hidden pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white border-t border-gray-200 px-2 py-3 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] dark:bg-zinc-900 dark:border-zinc-800 pb-[calc(12px+env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive =
            item.href === "/patient"
              ? pathname === "/patient"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 min-w-[70px]"
            >
              <div className={`flex items-center justify-center w-12 h-8 rounded-full transition-colors ${isActive ? "bg-blue-100 dark:bg-blue-900/40" : "bg-transparent"}`}>
                <span className={`text-xl ${isActive ? "opacity-100" : "opacity-70 grayscale"}`}>{item.icon}</span>
              </div>
              <span className={`text-[10px] font-bold ${isActive ? "text-blue-700 dark:text-blue-400" : "text-gray-500 dark:text-zinc-500"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Global AI Chat Widget for Patient */}
      <ChatWidget />
    </div>
  );
}
