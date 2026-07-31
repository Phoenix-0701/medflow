"use client";

import { useEffect, useState, useCallback } from "react";
import HistoryDetailModal from "./HistoryDetailModal";

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  doctor: {
    user: {
      fullName: string;
      phone: string;
    };
  };
  triageSession?: {
    severity: string;
    symptomsSummary: string;
  };
  medicalRecord?: {
    clinicalFindings: string;
    finalDiagnosis: string;
    prescription: string;
  };
  rating?: number;
  reviewText?: string;
}

export default function PatientHistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/appointments/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setAppointments(json.data || json || []);
      }
    } catch (err) {
      console.error("Lỗi fetch lịch sử khám:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">✓ Đã khám</span>;
      case "CANCELLED":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">✕ Đã hủy</span>;
      case "CONFIRMED":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Sắp tới</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 md:px-0">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Lịch sử khám bệnh</h1>
        <p className="text-gray-500 mt-2">Xem lại thông tin chẩn đoán và đơn thuốc của các ca khám trước đây.</p>
      </div>

      {/* Data List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Đang tải lịch sử khám...</div>
        ) : appointments.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có lịch sử khám</h3>
            <p className="text-gray-500">Bạn chưa thực hiện ca khám nào trên hệ thống.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((appt) => {
              const doctorName = appt.doctor?.user?.fullName || "Bác sĩ ẩn danh";
              const dateObj = new Date(appt.startTime);
              const dateStr = dateObj.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
              const timeStr = dateObj.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
              
              const isCompleted = appt.status === "COMPLETED";

              return (
                <div 
                  key={appt.id} 
                  className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isCompleted ? "hover:bg-blue-50/50 cursor-pointer group" : "opacity-80"
                  }`}
                  onClick={() => isCompleted && setSelectedAppt(appt)}
                >
                  
                  {/* Info Left */}
                  <div className="flex gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex flex-col items-center justify-center text-blue-700 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5">{dateObj.toLocaleString("vi-VN", { month: "short" })}</span>
                      <span className="text-xl font-black leading-none">{dateObj.getDate()}</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">Khám với {doctorName}</h3>
                        {getStatusBadge(appt.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          {timeStr}
                        </span>
                        {appt.triageSession && (
                          <span className="flex items-center gap-1 text-gray-400">
                            • AI: {appt.triageSession.severity === "RED" ? "Nguy cơ cao" : appt.triageSession.severity === "YELLOW" ? "Cần khám" : "Ổn định"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Right */}
                  <div className="flex items-center md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                    {isCompleted ? (
                      <button className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl group-hover:bg-blue-100 transition-colors">
                        Xem bệnh án
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </button>
                    ) : appt.status === "CONFIRMED" ? (
                      <span className="text-sm text-gray-400 font-medium italic">Chưa tới giờ khám</span>
                    ) : null}
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <HistoryDetailModal 
        isOpen={!!selectedAppt} 
        onClose={() => setSelectedAppt(null)} 
        appointment={selectedAppt}
        onReviewSuccess={() => {
          fetchHistory();
          setSelectedAppt(null);
        }}
      />

    </div>
  );
}
