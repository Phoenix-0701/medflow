"use client";

import { useState } from "react";
import ConsultationModal from "../../ConsultationModal";

export default function HistoryModal({ isOpen, onClose, appointments, patientName }: any) {
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterDate, setFilterDate] = useState("");
  
  // Reuse ConsultationModal to view the detail of a completed appointment
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

  if (!isOpen) return null;

  // Filter logic
  let filtered = appointments || [];
  if (filterDoctor) {
    filtered = filtered.filter((a: any) => 
      a.doctor?.user?.fullName?.toLowerCase().includes(filterDoctor.toLowerCase())
    );
  }
  if (filterDate) {
    filtered = filtered.filter((a: any) => 
      new Date(a.startTime).toISOString().startsWith(filterDate)
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-center bg-gray-900/50 backdrop-blur-sm overflow-y-auto pt-10 pb-10 p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col overflow-hidden h-max min-h-[80vh] relative">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 bg-white sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Lịch sử khám bệnh toàn diện</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Bệnh nhân: {patientName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Filters */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-100 flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Lọc theo Bác sĩ</label>
            <input 
              type="text"
              placeholder="Nhập tên bác sĩ..."
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              value={filterDoctor}
              onChange={e => setFilterDoctor(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Lọc theo Ngày khám</label>
            <input 
              type="date"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => { setFilterDoctor(""); setFilterDate(""); }}
              className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-medium">
                Không tìm thấy ca khám nào phù hợp.
              </div>
            ) : (
              filtered.map((appt: any) => {
                const date = new Date(appt.startTime);
                const dateStr = date.toLocaleDateString("vi-VN");
                const timeStr = date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={appt.id} className="border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-6 bg-white">
                    <div className="flex-shrink-0 text-center w-24 border-r border-gray-100 pr-4">
                      <p className="text-sm font-extrabold text-gray-900">{dateStr}</p>
                      <p className="text-xs font-bold text-gray-400 mt-1">{timeStr}</p>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-extrabold text-blue-900 text-lg mb-1">
                        {appt.medicalRecord?.finalDiagnosis || appt.triageSession?.recommendedSpecialty || "Khám tổng quát"}
                      </h4>
                      <p className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        Khám với: BS. {appt.doctor?.user?.fullName || "N/A"}
                      </p>
                      {appt.medicalRecord?.clinicalFindings && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-1 border-l-2 border-gray-200 pl-2">
                          <span className="font-bold text-gray-700">Lâm sàng: </span>
                          {appt.medicalRecord.clinicalFindings}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      {appt.status === 'COMPLETED' ? (
                        <button 
                          onClick={() => setSelectedAppt(appt)}
                          className="px-4 py-2 bg-blue-50 text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                        >
                          Xem chi tiết
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200">
                          Chưa có bệnh án
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Reuse ConsultationModal */}
      {selectedAppt && (
        <ConsultationModal 
          isOpen={!!selectedAppt}
          onClose={() => setSelectedAppt(null)}
          appointment={selectedAppt}
          onComplete={() => {}}
        />
      )}
    </div>
  );
}
