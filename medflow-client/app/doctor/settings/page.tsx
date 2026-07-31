"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

interface WeeklySchedule {
  monday: any[];
  tuesday: any[];
  wednesday: any[];
  thursday: any[];
  friday: any[];
  saturday: any[];
  sunday: any[];
}

interface Leave {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
}

const defaultSchedule: WeeklySchedule = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

export default function DoctorSettingsPage() {
  const [schedule, setSchedule] = useState<WeeklySchedule>(defaultSchedule);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit mode for weekly schedule
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Leave Form State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      const [scheduleRes, leavesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/availabilities/weekly-schedule`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/availabilities/leaves`, { headers })
      ]);

      if (scheduleRes.status === 401 || leavesRes.status === 401) {
        localStorage.clear();
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
        return;
      }

      if (scheduleRes.ok) {
        const json = await scheduleRes.json();
        setSchedule(json.data || json || defaultSchedule);
      }
      if (leavesRes.ok) {
        const json = await leavesRes.json();
        setLeaves(json.data || json || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleDay = (day: keyof WeeklySchedule) => {
    if (!isEditing) return; // Only allow toggle when in edit mode
    
    // Toggle logic: If it has slots, clear them. If empty, add default slots.
    const currentSlots = schedule[day];
    const newSlots = currentSlots && currentSlots.length > 0 
      ? [] 
      : [{ start: "08:00", end: "11:00" }, { start: "14:00", end: "17:00" }];
    
    setSchedule({ ...schedule, [day]: newSlots });
  };

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/availabilities/weekly-schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(schedule)
      });
      if (res.ok) {
        setIsEditing(false);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(`Lỗi khi lưu lịch làm việc: ${err.message || res.status}`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd || !leaveReason) return toast.error("Vui lòng điền đủ thông tin");
    
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/availabilities/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ startDate: leaveStart, endDate: leaveEnd, reason: leaveReason })
      });

      if (res.ok) {
        setShowLeaveModal(false);
        setLeaveStart(""); setLeaveEnd(""); setLeaveReason("");
        fetchData();
      } else {
        const data = await res.json();
        toast.error(`Lỗi: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLeave = async (id: string) => {
    if (!confirm("Bạn có chắc muốn hủy ngày nghỉ này?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/availabilities/leaves/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const daysConfig: { key: keyof WeeklySchedule; label: string }[] = [
    { key: "monday", label: "Thứ 2" },
    { key: "tuesday", label: "Thứ 3" },
    { key: "wednesday", label: "Thứ 4" },
    { key: "thursday", label: "Thứ 5" },
    { key: "friday", label: "Thứ 6" },
    { key: "saturday", label: "Thứ 7" },
    { key: "sunday", label: "Chủ nhật" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Thiết lập Lịch trống
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 font-medium">
            Quản lý thời gian làm việc và khóa lịch đột xuất.
          </p>
        </div>
        <button
          onClick={() => setShowLeaveModal(true)}
          className="flex items-center gap-2 rounded-xl bg-rose-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-rose-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          Đánh dấu bận/Nghỉ
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lịch làm việc cố định */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Lịch làm việc cố định</h2>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    fetchData(); // Reset to saved version
                  }}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSaveSchedule}
                  disabled={isSaving}
                  className="text-sm font-semibold rounded-lg bg-blue-600 text-white px-4 py-1.5 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            {daysConfig.map(({ key, label }) => {
              const slots = schedule?.[key] || [];
              const isActive = slots.length > 0;

              return (
                <div key={key} className={`flex items-center justify-between ${isEditing ? '' : 'opacity-80'}`}>
                  <div className="flex items-center w-full max-w-sm gap-8">
                    <span className={`w-16 text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {label}
                    </span>
                    
                    {isActive ? (
                      <div className="flex gap-2 flex-wrap">
                        {slots.map((s, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100/50 text-blue-800 rounded-full text-xs font-bold border border-blue-200">
                            {s.start} - {s.end}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs italic text-gray-400">Không có ca làm việc</span>
                    )}
                  </div>

                  {/* Toggle Switch */}
                  <button 
                    onClick={() => handleToggleDay(key)}
                    disabled={!isEditing}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-blue-600' : 'bg-gray-200'} ${!isEditing && 'cursor-not-allowed'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lịch đã khóa */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Lịch đã khóa</h2>
          
          <div className="flex flex-col gap-4">
            {leaves.length === 0 && (
              <p className="text-sm text-gray-500 italic">Chưa có ngày nghỉ nào được lên lịch.</p>
            )}
            
            {leaves.map((leave) => {
              const start = new Date(leave.startDate);
              const end = new Date(leave.endDate);
              const isSameDay = start.toDateString() === end.toDateString();
              const dateStr = isSameDay 
                ? `${start.toLocaleDateString('vi-VN')} (Cả ngày)`
                : `${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`;

              return (
                <div key={leave.id} className="rounded-xl border border-rose-100 bg-rose-50/30 p-4">
                  <h4 className="text-sm font-bold text-rose-700 flex items-center gap-2 mb-1.5">
                    <span>⚠️</span> {leave.reason}
                  </h4>
                  <p className="text-base font-semibold text-gray-900 mb-4">{dateStr}</p>
                  
                  <div className="flex items-center justify-between border-t border-rose-100/50 pt-3">
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Đã báo 0 BN
                    </span>
                    <button 
                      onClick={() => handleDeleteLeave(leave.id)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700"
                    >
                      Hủy khóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Đánh dấu ngày nghỉ</h3>
            <form onSubmit={handleAddLeave} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Lý do nghỉ</label>
                <input
                  type="text" required
                  placeholder="VD: Nghỉ ốm, Công tác..."
                  value={leaveReason} onChange={e => setLeaveReason(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-rose-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Từ ngày</label>
                  <input
                    type="date" required
                    value={leaveStart} onChange={e => setLeaveStart(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Đến ngày</label>
                  <input
                    type="date" required
                    value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-rose-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowLeaveModal(false)} className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200">Hủy</button>
                <button type="submit" className="flex-1 rounded-xl bg-rose-700 py-2.5 text-sm font-semibold text-white hover:bg-rose-800">Xác nhận Nghỉ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
