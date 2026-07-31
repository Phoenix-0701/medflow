"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Tự sinh mảng 7 ngày tới (bao gồm hôm nay)
function getNext7Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

// Helper format date
function formatDateStr(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Tên thứ tiếng Việt
const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function BookingPage() {
  // 1. STATE BÁC SĨ & CHUYÊN KHOA
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("Tất cả");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  // 2. STATE NGÀY & GIỜ RẢNH
  const dates = useMemo(() => getNext7Days(), []);
  const [selectedDate, setSelectedDate] = useState<string>(formatDateStr(dates[0]));
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  // 3. LỊCH SỬ ĐẶT LỊCH
  const [history, setHistory] = useState<any[]>([]);

  // 4. TRẠNG THÁI LOADING / SUBMITTING
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // FETCH: 1. Danh sách bác sĩ & 2. Lịch sử đặt lịch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        
        // A. Fetch Bác sĩ (Public API - top-doctors để lấy rating)
        const docsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/users/public/top-doctors`);
        if (docsRes.ok) {
          const docsJson = await docsRes.json();
          const docsData = docsJson.data || docsJson || [];
          setDoctors(docsData);

          // Lọc ra danh sách chuyên khoa unique
          const specs = new Set<string>();
          docsData.forEach((d: any) => {
            if (d.specialty) specs.add(d.specialty);
          });
          setSpecialties(["Tất cả", ...Array.from(specs)]);
        }

        // B. Fetch Lịch sử (nếu có token)
        if (token) {
          const histRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/appointments/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (histRes.ok) {
            const histJson = await histRes.json();
            setHistory(histJson.data || histJson || []);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch initial data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // FETCH: Lịch rảnh khi Bác sĩ hoặc Ngày thay đổi
  useEffect(() => {
    setSelectedSlot(null); // Reset giờ khi đổi ngày/bác sĩ
    
    const fetchSlots = async () => {
      if (!selectedDoctorId) {
        setSlots([]);
        return;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/availabilities/doctors/${selectedDoctorId}?date=${selectedDate}`
        );
        if (res.ok) {
          const json = await res.json();
          setSlots(json.data || json || []);
        } else {
          setSlots([]);
        }
      } catch (error) {
        console.error("Lỗi fetch slot:", error);
        setSlots([]);
      }
    };

    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  // Lọc bác sĩ theo chuyên khoa
  const filteredDoctors = doctors.filter((doc) =>
    selectedSpecialty === "Tất cả" ? true : doc.specialty === selectedSpecialty
  );

  // Phân nhóm Slot Sáng/Chiều
  const morningSlots = slots.filter((s) => new Date(s.startTime).getHours() < 12);
  const afternoonSlots = slots.filter((s) => new Date(s.startTime).getHours() >= 12);

  // Helper format giờ hiển thị
  const formatTimeStr = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  // Lấy text hiển thị thời gian cho thanh Action Bar
  const getSelectedDateTimeText = () => {
    if (!selectedSlot) return "Chưa chọn thời gian";
    const st = new Date(selectedSlot.startTime);
    return `${formatTimeStr(selectedSlot.startTime)} - ${weekDays[st.getDay()]}, ${st.getDate()}/${st.getMonth() + 1}`;
  };

  // HANDLE ĐẶT LỊCH
  const handleBooking = async () => {
    if (!selectedDoctorId || !selectedSlot) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setErrorMsg("Vui lòng đăng nhập để đặt lịch.");
        setSubmitting(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/appointments/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          availabilityId: selectedSlot.id,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || "Đặt lịch thất bại");
      }

      // Đặt lịch thành công, fetch lại lịch sử & reset slot
      toast.success("🎉 Đặt lịch khám thành công!");
      setSelectedSlot(null);
      
      const histRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/appointments/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (histRes.ok) {
        const histJson = await histRes.json();
        setHistory(histJson.data || histJson || []);
      }
      
      // Xóa luôn slot vừa book khỏi UI (Optimistic update)
      setSlots((prev) => prev.filter((s) => s.id !== selectedSlot.id));

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Đã xảy ra lỗi khi đặt lịch");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-32">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Đặt Lịch Hẹn</h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-400">Chọn chuyên khoa, bác sĩ và thời gian phù hợp.</p>
      </div>

      {/* 1. AI ĐỀ XUẤT (Mock UI) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 relative overflow-hidden">
        <div className="flex items-start gap-4 z-10 relative">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 text-xl shadow-sm">
            🤖
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold text-cyan-700 uppercase tracking-wide dark:bg-cyan-900/30 dark:text-cyan-400 mb-2">
              ✨ AI Đề Xuất
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Khoa Tiêu Hóa</h3>
            <p className="text-sm text-gray-600 mt-1 dark:text-zinc-300">
              Dựa trên triệu chứng "đau rát thượng vị" và "khó tiêu" gần đây của bạn.
            </p>
          </div>
        </div>
        {/* Trang trí background */}
        <div className="absolute right-0 top-0 text-gray-50 dark:text-zinc-800/50 text-[120px] leading-none select-none opacity-50 transform translate-x-8 -translate-y-8 pointer-events-none">
          🌱
        </div>
      </div>

      {/* 2. CHỌN CHUYÊN KHOA & BÁC SĨ */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bác sĩ chuyên khoa</h2>
          
          {/* Bộ lọc chuyên khoa nhỏ bên phải */}
          <select 
            className="text-sm font-semibold text-blue-600 bg-blue-50 border-none rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer dark:bg-zinc-800 dark:text-blue-400"
            value={selectedSpecialty}
            onChange={(e) => {
              setSelectedSpecialty(e.target.value);
              setSelectedDoctorId(null);
              setSelectedSlot(null);
            }}
          >
            {specialties.map(sp => (
              <option key={sp} value={sp}>{sp}</option>
            ))}
          </select>
        </div>

        {/* Danh sách Bác sĩ ngang */}
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
          {filteredDoctors.length === 0 ? (
            <p className="text-gray-500 italic text-sm py-4">Không tìm thấy bác sĩ phù hợp.</p>
          ) : (
            filteredDoctors.map((doc) => {
              const isSelected = selectedDoctorId === doc.id;
              return (
                <div 
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoctorId(doc.id);
                    setSelectedSlot(null);
                  }}
                  className={`shrink-0 w-64 snap-start rounded-2xl border-2 p-5 flex flex-col items-center justify-center transition-all cursor-pointer bg-white dark:bg-zinc-900 relative ${
                    isSelected 
                      ? "border-blue-600 shadow-md ring-4 ring-blue-50 dark:ring-blue-900/20" 
                      : "border-gray-100 shadow-sm hover:border-blue-200 dark:border-zinc-800 dark:hover:border-zinc-700"
                  }`}
                >
                  {/* Tích xanh góc phải nếu selected */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-blue-600 bg-white rounded-full">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-4 border-2 border-white shadow-sm ring-1 ring-gray-100 dark:bg-zinc-800 dark:border-zinc-800 dark:ring-zinc-700 relative">
                    <Image
                      src={doc.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.user?.fullName || "Doctor")}&background=random&size=300`}
                      alt={doc.user?.fullName || "Doctor"}
                      fill
                      className="object-cover"
                      unoptimized={true}
                    />
                  </div>

                  <h4 className="font-bold text-gray-900 dark:text-white text-center">BS. {doc.user?.fullName}</h4>
                  <p className="text-xs text-gray-500 mt-1">{doc.specialty || "Bác sĩ điều trị"}</p>
                  
                  <div className="flex items-center gap-1 mt-2 mb-4 text-xs font-medium text-gray-600 dark:text-zinc-400">
                    <span className="text-orange-400">★</span> {doc.averageRating ? doc.averageRating.toFixed(1) : "0.0"} <span className="text-gray-400 font-normal">({doc.totalReviews || 0} đánh giá)</span>
                  </div>

                  <button 
                    className={`w-full rounded-xl py-2.5 text-sm font-bold transition-colors ${
                      isSelected 
                        ? "bg-blue-700 text-white shadow-sm" 
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
                    }`}
                  >
                    {isSelected ? "Đã chọn" : "Chọn bác sĩ"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. CHỌN THỜI GIAN */}
      <div className={`transition-opacity duration-300 ${!selectedDoctorId ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-zinc-800 pb-4">
            <span className="text-blue-600 text-xl">📅</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Thời gian khám</h2>
          </div>

          {/* Chọn ngày ngang */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-700 dark:text-zinc-300 mb-3">Tháng {dates[0].getMonth() + 1}, {dates[0].getFullYear()}</p>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {dates.map((d) => {
                const dateStr = formatDateStr(d);
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex min-w-[64px] shrink-0 flex-col items-center justify-center rounded-xl border p-2 transition-all ${
                      isSelected
                        ? "border-blue-700 bg-blue-700 text-white shadow-md"
                        : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    <span className="text-xs font-medium uppercase">{weekDays[d.getDay()]}</span>
                    <span className={`text-lg font-bold mt-0.5 ${isSelected ? "text-white" : "text-gray-900 dark:text-white"}`}>
                      {d.getDate()}
                    </span>
                    {isSelected && <div className="mt-1 h-1 w-1 rounded-full bg-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hiển thị Khung giờ */}
          {!selectedDoctorId ? (
            <div className="text-center py-8 text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 dark:bg-zinc-800/50 dark:border-zinc-700 mt-4">
              Vui lòng chọn bác sĩ để xem lịch rảnh.
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 dark:bg-zinc-800/50 dark:border-zinc-700 mt-4">
              Bác sĩ không có lịch rảnh vào ngày này. Vui lòng chọn ngày khác.
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-6">
              {/* Sáng */}
              {morningSlots.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400 mb-3">Buổi sáng</p>
                  <div className="flex flex-wrap gap-2.5">
                    {morningSlots.map((s) => {
                      const isSelected = selectedSlot?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSlot(s)}
                          className={`rounded-lg border px-4 py-2 text-sm font-bold transition-all ${
                            isSelected
                              ? "border-blue-700 bg-blue-50 text-blue-700 shadow-inner ring-1 ring-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500 dark:ring-blue-500"
                              : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-500"
                          }`}
                        >
                          {formatTimeStr(s.startTime)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Chiều */}
              {afternoonSlots.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400 mb-3">Buổi chiều</p>
                  <div className="flex flex-wrap gap-2.5">
                    {afternoonSlots.map((s) => {
                      const isSelected = selectedSlot?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSlot(s)}
                          className={`rounded-lg border px-4 py-2 text-sm font-bold transition-all ${
                            isSelected
                              ? "border-blue-700 bg-blue-50 text-blue-700 shadow-inner ring-1 ring-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500 dark:ring-blue-500"
                              : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-500"
                          }`}
                        >
                          {formatTimeStr(s.startTime)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="mt-6 rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-900/50 dark:text-rose-400">
              ⚠️ {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* LỊCH SỬ ĐẶT LỊCH (Chỉ để hiển thị nhanh) */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Lịch sử đặt lịch của bạn</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">Bạn chưa có lịch sử đặt khám.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {history.slice(0, 4).map((app) => (
              <div key={app.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex justify-between items-center mb-2">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    app.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                    app.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                    app.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {app.status}
                  </span>
                  <span className="text-xs text-gray-400">{formatDateStr(new Date(app.startTime))}</span>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">BS. {app.doctor?.user?.fullName}</h4>
                <p className="text-xs text-gray-500 mt-1">{app.doctor?.specialty}</p>
                <div className="text-xs font-bold mt-3 text-gray-700 dark:text-zinc-300">
                  🕒 {formatTimeStr(app.startTime)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING ACTION BAR CHUẨN MẪU */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 md:left-64 bg-white/80 backdrop-blur-xl border-t border-gray-200 px-4 py-4 md:px-8 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] dark:bg-zinc-900/90 dark:border-zinc-800 transition-transform duration-300 pb-[calc(16px+env(safe-area-inset-bottom))] md:pb-4 ${
        selectedSlot ? "translate-y-0" : "translate-y-full"
      }`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Thời gian đã chọn</span>
            <span className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
              {getSelectedDateTimeText()}
            </span>
          </div>
          
          <button 
            onClick={handleBooking}
            disabled={submitting}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-blue-700 px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-blue-700/30 hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
          >
            {submitting ? "Đang xử lý..." : "Xác nhận Đặt lịch"} 
            {!submitting && <span>&rarr;</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
