// app/admin/doctors/DoctorStats.tsx
import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  bgGradient: string;
  iconBg: string;
  icon: React.ReactNode;
  bgIcon?: React.ReactNode;
}

function StatCard({ title, value, bgGradient, iconBg, icon, bgIcon }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden flex items-center p-6 rounded-2xl text-white shadow-md ${bgGradient}`}>
      <div className="flex items-center gap-4 relative z-10 w-full">
        <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">{title}</p>
          <p className="text-4xl font-black mt-1 leading-none">{value}</p>
        </div>
      </div>
      {bgIcon && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 text-white/10 w-32 h-32 flex items-center justify-center pointer-events-none">
          {bgIcon}
        </div>
      )}
    </div>
  );
}

interface DoctorStatsProps {
  totalDoctors: number;
  activeDoctors: number;
  newDoctors: number;
}

export default function DoctorStats({
  totalDoctors,
  activeDoctors,
  newDoctors,
}: DoctorStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mt-2">
      <StatCard
        title="Tổng số bác sĩ"
        value={totalDoctors}
        bgGradient="bg-gradient-to-br from-blue-600 to-blue-800"
        iconBg="bg-white/20"
        icon={<span className="text-2xl">👥</span>}
        bgIcon={
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
        }
      />
      <StatCard
        title="Đang hoạt động"
        value={activeDoctors}
        bgGradient="bg-gradient-to-br from-teal-400 to-teal-600"
        iconBg="bg-white/20"
        icon={<span className="text-2xl">✔️</span>}
        bgIcon={
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
        }
      />
      <StatCard
        title="Tài khoản mới (tháng)"
        value={newDoctors}
        bgGradient="bg-gradient-to-br from-orange-600 to-amber-700"
        iconBg="bg-white/20"
        icon={<span className="text-2xl">👤</span>}
        bgIcon={
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        }
      />
    </div>
  );
}
