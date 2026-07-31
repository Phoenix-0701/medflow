"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardStats {
  totalDoctors: number;
  activeDoctors: number;
  totalPatients: number;
  todayAppointments: number;
  patientsByDepartment: { name: string; value: number }[];
  appointmentsTrend: { name: string; thisWeek: number; lastWeek: number }[];
  recentActivities: { id: string; event: string; role: string; time: string; status: string }[];
}

const COLORS = ["#0284c7", "#059669", "#d97706", "#dc2626", "#7c3aed"];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        window.location.href = "/auth/login";
        return;
      }
      if (res.ok) {
        const resJson = await res.json();
        const data = resJson.data || resJson;
        setStats(data);
      }
    } catch (err) {
      console.error("Lỗi fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading || !stats) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-gray-500">
        Đang tải dữ liệu tổng quan...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tổng quan hệ thống
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Chào mừng quay lại, quản trị viên. Đây là tóm tắt hoạt động y tế hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <span>📅</span> {today}
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between hover:-translate-y-1 transition-transform">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
              <span className="text-xl">🏥</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Tổng số Bác sĩ</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.totalDoctors}</h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between hover:-translate-y-1 transition-transform">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
              <span className="text-xl">🩺</span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              Live
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Bác sĩ đang hoạt động</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.activeDoctors}</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between hover:-translate-y-1 transition-transform">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/30">
              <span className="text-xl">👥</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Tổng số Bệnh nhân</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.totalPatients}</h3>
          </div>
        </div>

        {/* Card 4 (Thế cho Doanh thu) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between hover:-translate-y-1 transition-transform">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30">
              <span className="text-xl">📅</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Lượt khám hôm nay</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.todayAppointments}</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Xu hướng lượt khám bệnh</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.appointmentsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="thisWeek" name="Tuần này" fill="#0284c7" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="lastWeek" name="Tuần trước" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Bệnh nhân theo khoa</h3>
          <div className="h-[250px] w-full relative flex items-center justify-center">
            {stats.patientsByDepartment.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.patientsByDepartment}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.patientsByDepartment.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalPatients}</span>
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">TỔNG BỆNH NHÂN</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 text-sm h-full">
                <span className="text-3xl mb-2">🤷‍♂️</span>
                Chưa có dữ liệu khoa
              </div>
            )}
          </div>
          
          <div className="mt-4 flex flex-col gap-3">
            {stats.patientsByDepartment.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="font-medium text-gray-600 dark:text-zinc-300">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mt-2 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hoạt động gần đây</h3>
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-400">
            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Sự kiện</th>
                <th className="px-6 py-4 font-semibold">Vai trò</th>
                <th className="px-6 py-4 font-semibold">Thời gian</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {stats.recentActivities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Chưa có hoạt động nào.
                  </td>
                </tr>
              ) : (
                stats.recentActivities.map((act) => (
                  <tr key={act.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs shrink-0">
                          {act.event.charAt(0)}
                        </div>
                        {act.event}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{act.role}</td>
                    <td className="px-6 py-4">
                      {new Date(act.time).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        act.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
