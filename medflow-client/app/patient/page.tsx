// app/patient/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  doctor: {
    user: {
      fullName: string;
    };
    specialty?: string;
  };
}

export default function PatientDashboard() {
  const [patientName, setPatientName] = useState("Bạn");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy thông tin user từ LocalStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.fullName) {
          // Lấy tên gọi (First name)
          const nameParts = u.fullName.split(" ");
          setPatientName(nameParts[nameParts.length - 1]);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch lịch khám sắp tới
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/appointments/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          const allApps = json.data || json || [];
          // Lọc ra các lịch sắp tới (PENDING, CONFIRMED)
          const upcoming = allApps.filter(
            (a: any) => a.status === "PENDING" || a.status === "CONFIRMED"
          );
          setAppointments(upcoming.slice(0, 2)); // Hiển thị tối đa 2 lịch
        }
      } catch (err) {
        console.error("Lỗi fetch lịch khám:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Format date helper
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-100 flex flex-col md:flex-row items-center justify-between dark:bg-zinc-900 border border-gray-200/50 dark:border-zinc-800 shadow-sm">
        <div className="p-8 md:p-12 md:w-2/3 z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            Hôm nay bạn cảm thấy thế nào, {patientName}?
          </h1>
          <p className="mt-4 text-base text-gray-600 dark:text-zinc-400 max-w-xl">
            Hệ thống AI Triage của chúng tôi đã sẵn sàng để đánh giá triệu chứng của bạn và hướng dẫn bạn đến dịch vụ chăm sóc phù hợp ngay lập tức.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => window.dispatchEvent(new Event("open-ai-chat"))}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-800 transition-colors"
            >
              <span className="text-lg">🤖</span> Bắt đầu Tư vấn AI
            </button>
            <Link href="/patient/booking" className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-700 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors dark:bg-zinc-800 dark:text-blue-400 dark:border-zinc-700 dark:hover:bg-zinc-750">
              Đặt lịch thông thường
            </Link>
          </div>
        </div>
        {/* Decorative graphic for Hero */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-100/50 to-transparent hidden md:block dark:from-blue-900/20" />
        <div className="relative md:w-1/3 p-8 flex justify-center hidden md:flex">
          <div className="relative w-48 h-48 rounded-full bg-blue-200/50 dark:bg-blue-900/30 flex items-center justify-center animate-pulse shadow-inner">
            <span className="text-7xl">🌐</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Upcoming Appointments + Recent Insights) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Upcoming Appointments */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Lịch khám sắp tới</h2>
            {loading ? (
              <div className="h-40 rounded-2xl bg-gray-100 animate-pulse dark:bg-zinc-800" />
            ) : appointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Bạn chưa có lịch khám nào sắp tới.</p>
                <Link href="/patient/booking" className="mt-4 inline-block text-sm font-bold text-blue-600 hover:underline dark:text-blue-400">Đặt lịch ngay &rarr;</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {appointments.map(app => (
                  <div key={app.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 relative hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${app.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                        {app.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bs. {app.doctor?.user?.fullName || "Bác sĩ"}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{app.doctor?.specialty || 'Chuyên khoa chung'}</p>
                    
                    <div className="mt-5 border-t border-gray-100 dark:border-zinc-800 pt-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-300 font-medium">
                        <span className="text-gray-400">📅</span> {formatDate(app.startTime)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-300 font-medium">
                        <span className="text-gray-400">🕒</span> {formatTime(app.startTime)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-300 font-medium">
                        <span className="text-gray-400">🏥</span> Khám trực tiếp
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Health Insights */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Phân tích sức khỏe gần đây</h2>
              <Link href="/patient/history" className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400">Xem lịch sử</Link>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shadow-sm dark:bg-emerald-900/40 dark:text-emerald-400">
                🌿
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Kiểm tra triệu chứng: Đau đầu</h3>
                <p className="text-sm text-gray-600 mt-1 dark:text-zinc-300 leading-relaxed">
                  Dựa trên nhật ký ngày hôm qua của bạn, AI khuyên bạn nên tăng cường uống nước và theo dõi thời gian sử dụng màn hình máy tính. Không phát hiện triệu chứng nguy hiểm.
                </p>
                <p className="text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-wide">
                  Hôm qua, 16:15
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Reminders + Quick Access) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Reminders */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Nhắc nhở</h2>
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:bg-rose-950/20 dark:border-rose-900/30 flex items-start gap-3 shadow-sm">
                <span className="text-rose-600 text-lg mt-0.5">⚠️</span>
                <div>
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-400">Cần mua thêm thuốc</h4>
                  <p className="text-xs text-rose-700 mt-1 dark:text-rose-300">Lisinopril 10mg sắp hết (còn 4 ngày).</p>
                  <button className="text-xs font-bold text-rose-700 underline mt-2 hover:text-rose-800 dark:text-rose-400">Yêu cầu mua thêm</button>
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-white p-4 dark:bg-zinc-900 dark:border-zinc-800 flex items-start gap-3 shadow-sm">
                <span className="text-blue-600 text-lg mt-0.5">ℹ️</span>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Đã có kết quả xét nghiệm</h4>
                  <p className="text-xs text-gray-500 mt-1 dark:text-zinc-400">Kết quả xét nghiệm máu gần đây của bạn đã được tải lên bởi phòng khám.</p>
                  <button className="text-xs font-bold text-blue-600 mt-2 hover:underline dark:text-blue-400">Xem kết quả</button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Truy cập nhanh</h2>
            <div className="flex flex-col gap-2">
              <Link href="/patient/booking" className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900/50 group">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    📅
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-zinc-200 group-hover:text-blue-700 transition-colors">Đặt lịch khám</span>
                </div>
                <span className="text-gray-400 group-hover:text-blue-600 transition-colors">&rarr;</span>
              </Link>
              
              <Link href="/patient/history" className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900/50 group">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    📂
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-zinc-200 group-hover:text-blue-700 transition-colors">Lịch sử khám bệnh</span>
                </div>
                <span className="text-gray-400 group-hover:text-blue-600 transition-colors">&rarr;</span>
              </Link>

              <Link href="/patient/profile" className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900/50 group">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    💵
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-zinc-200 group-hover:text-blue-700 transition-colors">Thanh toán & Bảo hiểm</span>
                </div>
                <span className="text-gray-400 group-hover:text-blue-600 transition-colors">&rarr;</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
