// app/doctor/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import ConsultationModal from "./ConsultationModal";

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  patient: {
    gender?: string;
    dateOfBirth?: string;
    user: {
      fullName: string;
      avatarUrl?: string;
    };
  };
  notes?: string;
  triageSession?: {
    severity?: string;
    recommendedSpecialty?: string;
    symptomsSummary?: string;
    aiReport?: string;
  };
  status: string;
}

export default function DoctorSchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Modal Khám Bệnh
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  // Lấy ngày hôm nay định dạng YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/appointments/doctor-schedule`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const json = await res.json();
        setAppointments(json.data || json || []);
      }
    } catch (err) {
      console.error("Lỗi fetch lịch khám:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Thống kê nhanh
  const totalCount = appointments.length;
  const waitingCount = appointments.filter((a) => a.status === "CONFIRMED" || a.status === "PENDING").length;
  
  const todayAppointments = appointments.filter(a => {
    // Chuyển startTime về múi giờ local (hoặc cắt chuỗi cẩn thận) để so sánh với todayStr (cũng là local)
    // Tốt nhất là so sánh ngày, tháng, năm
    const dateObj = new Date(a.startTime);
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    const localToday = new Date();
    const localTodayStr = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, '0')}-${String(localToday.getDate()).padStart(2, '0')}`;
    return dateStr === localTodayStr;
  });
  
  const todayCount = todayAppointments.length;

  // Helper format giờ
  const formatTimeStr = (isoStr: string) => {
    return new Date(isoStr).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };
  const formatDateStr = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Danh sách lịch hẹn
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 font-medium">
            Thứ {new Date().getDay() + 1 === 1 ? 'Chủ nhật' : new Date().getDay() + 1}, {new Date().getDate()} Tháng {new Date().getMonth() + 1}, {new Date().getFullYear()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSchedule}
            className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            Lọc
          </button>
          <button
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Thêm lịch
          </button>
        </div>
      </div>

      {/* 3 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="relative z-10">
            <p className="text-sm font-semibold text-gray-500">
              Tổng số lịch hẹn
            </p>
            <h3 className="text-5xl font-black text-blue-700 mt-3 tracking-tighter">
              {totalCount}
            </h3>
          </div>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-50/50" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="relative z-10">
            <p className="text-sm font-semibold text-gray-500">
              Chờ khám
            </p>
            <h3 className="text-5xl font-black text-emerald-600 mt-3 tracking-tighter">
              {waitingCount}
            </h3>
          </div>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-50/50" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="relative z-10">
            <p className="text-sm font-semibold text-gray-500">
              Lịch hẹn trong ngày
            </p>
            <h3 className="text-5xl font-black text-rose-600 mt-3 tracking-tighter">
              {todayCount}
            </h3>
          </div>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-50/50" />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden mt-2">
        <div className="grid grid-cols-12 bg-gray-50/50 px-6 py-4 text-xs font-bold text-gray-500 border-b border-gray-100">
          <div className="col-span-2">Giờ</div>
          <div className="col-span-3">Bệnh nhân</div>
          <div className="col-span-4">Thông tin</div>
          <div className="col-span-2">Phân loại AI</div>
          <div className="col-span-1 text-right">Thao tác</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">
            Đang tải dữ liệu ca khám từ Server...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-sm font-medium text-gray-400">
            Hôm nay không có lịch hẹn khám nào.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((item) => {
              const fullName = item.patient?.user?.fullName || "Bệnh nhân";
              const patientInitials = fullName.split(" ").slice(-2).map((n) => n[0]).join("");

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAppt(item)}
                  className="grid grid-cols-12 items-center px-6 py-5 hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <div className="col-span-2">
                    <p className="text-base font-bold text-gray-900">
                      {formatTimeStr(item.startTime)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 font-semibold">
                      {formatDateStr(item.startTime)}
                    </p>
                  </div>

                  <div className="col-span-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 overflow-hidden items-center justify-center rounded-full bg-amber-600 font-bold text-white text-xs shadow-sm">
                      {item.patient?.user?.avatarUrl ? (
                        <img src={item.patient.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        patientInitials
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        {fullName}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.patient?.gender === 'MALE' ? "Nam" : "Nữ"}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-4 pr-4">
                    <p className="text-sm font-bold text-gray-800">
                      {item.triageSession?.symptomsSummary || "Khám định kỳ"}
                    </p>
                    <p className="text-xs mt-0.5">
                      {item.status === 'COMPLETED' ? (
                        <span className="text-emerald-600 font-bold">✓ Đã khám</span>
                      ) : item.status === 'CANCELLED' ? (
                        <span className="text-rose-600 font-bold">✕ Đã hủy</span>
                      ) : (
                        <span className="text-blue-600 font-bold">⏳ Chờ khám</span>
                      )}
                    </p>
                  </div>

                  <div className="col-span-2">
                    {item.triageSession?.severity === "RED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                        <span>🤖</span> AI Triage: {item.triageSession?.recommendedSpecialty || "Nguy cơ cao"}
                      </span>
                    ) : item.triageSession?.severity === "GREEN" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        <span className="bg-emerald-500 rounded-full w-3 h-3 text-white flex items-center justify-center text-[8px]">✓</span> Bình thường
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
                        <span className="text-gray-400 font-black">...</span> Đang phân tích
                      </span>
                    )}
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <svg className="w-5 h-5 text-gray-400 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Visual Timeline (Lịch trình trong ngày) */}
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white shadow-sm p-8">
        <h2 className="text-xl font-extrabold text-gray-900 mb-8">
          Khung giờ làm việc hôm nay
        </h2>
        <div className="relative border-l-2 border-gray-100 ml-4 pl-8 pb-2">
          {["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((hour, index, arr) => {
            const isLast = index === arr.length - 1;
            const hourApps = todayAppointments.filter(a => formatTimeStr(a.startTime).startsWith(hour.split(":")[0]));
            
            return (
              <div key={hour} className={`${isLast ? "mb-0" : "mb-10"} relative`}>
                {/* Timeline Dot */}
                <div className={`absolute -left-[39px] top-1.5 h-4 w-4 rounded-full ${isLast ? "bg-gray-300" : "bg-gray-200"} border-4 border-white`} />
                <span className="text-sm font-extrabold text-gray-400 absolute -left-[85px] top-0.5">{hour}</span>
                
                {!isLast && (
                  hourApps.length === 0 ? (
                    <div className="text-sm font-medium text-gray-300 italic mt-0.5">
                      — Trống
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {hourApps.map(app => (
                        <div 
                          key={app.id} 
                          onClick={() => setSelectedAppt(app)}
                          className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 w-full sm:w-2/3 transition-all hover:shadow-md cursor-pointer group"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-sm font-black text-blue-700">
                              {formatTimeStr(app.startTime)} - {formatTimeStr(app.endTime)} <span className="text-xs text-blue-500 font-semibold ml-1">({formatDateStr(app.startTime)})</span>
                            </span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${app.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-gray-600 border border-gray-200'}`}>
                              {app.status}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                            Bệnh nhân: {app.patient?.user?.fullName || "BN"}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1.5">
                            {app.triageSession?.symptomsSummary || "Khám định kỳ"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ConsultationModal
        isOpen={!!selectedAppt}
        onClose={() => setSelectedAppt(null)}
        appointment={selectedAppt}
        onComplete={() => {
          fetchSchedule();
        }}
      />
    </div>
  );
}
