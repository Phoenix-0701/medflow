"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface PatientInfo {
  id: string;
  userId: string;
  gender: string;
  dateOfBirth: string;
  user: {
    fullName: string;
    phone: string;
    email: string;
    avatarUrl?: string;
  };
  latestAppointment: {
    id: string;
    startTime: string;
    triageSession?: {
      severity: string;
      symptomsSummary: string;
    };
  } | null;
}

export default function DoctorPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/appointments/doctor-patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setPatients(json.data || json || []);
      }
    } catch (err) {
      console.error("Lỗi fetch bệnh nhân:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = patients.filter(p => 
    p.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAiBadge = (severity?: string) => {
    if (severity === "RED") {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><span className="text-red-500">⚠</span> Cần theo dõi</span>;
    }
    if (severity === "YELLOW") {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><span className="text-amber-500">⚠</span> Ai Gợi ý khám</span>; // Use amber or teal depending on exact mapping
    }
    if (severity === "GREEN") {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><span className="text-emerald-500">✓</span> Ổn định</span>;
    }
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">Chưa đánh giá</span>;
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý Bệnh nhân</h1>
        <button 
          onClick={() => toast("Tính năng thêm mới bệnh nhân thủ công đang phát triển.")}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Thêm Mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex gap-3">
        <div className="relative flex-1">
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            placeholder="Tìm theo Tên, SĐT, Mã bệnh án..." 
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block pl-11 pr-4 py-3 font-medium transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 bg-white shadow-sm shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          Bộ lọc
        </button>
        <button className="px-6 py-3 rounded-xl bg-teal-700 text-white font-bold hover:bg-teal-800 transition-colors shadow-sm shrink-0">
          Tìm kiếm
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-sm">
                <th className="font-bold py-4 px-6 whitespace-nowrap w-32">Mã BN</th>
                <th className="font-bold py-4 px-6 whitespace-nowrap">Họ tên</th>
                <th className="font-bold py-4 px-6 whitespace-nowrap w-24">Giới tính</th>
                <th className="font-bold py-4 px-6 whitespace-nowrap w-48">Ngày khám gần nhất</th>
                <th className="font-bold py-4 px-6 whitespace-nowrap w-48">Phân loại AI</th>
                <th className="font-bold py-4 px-6 whitespace-nowrap text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">Không tìm thấy bệnh nhân nào.</td>
                </tr>
              ) : (
                filteredPatients.map((p, index) => {
                  const maBN = `BN-${p.id.substring(0, 4).toUpperCase()}`;
                  const genderStr = p.gender === "MALE" ? "Nam" : p.gender === "FEMALE" ? "Nữ" : "Khác";
                  const dateStr = p.latestAppointment ? new Date(p.latestAppointment.startTime).toLocaleDateString("vi-VN") : "--";
                  const severity = p.latestAppointment?.triageSession?.severity;

                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => router.push(`/doctor/patients/${p.id}`)}
                      className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-600">{maBN}</td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-blue-700 text-base group-hover:text-blue-800">{p.user.fullName}</div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 font-medium">{genderStr}</td>
                      <td className="py-4 px-6 text-sm text-gray-600 font-medium">{dateStr}</td>
                      <td className="py-4 px-6">
                        {getAiBadge(severity)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="bg-gray-50/50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            Hiển thị <span className="font-bold text-gray-900">{filteredPatients.length}</span> bệnh nhân
          </p>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-700 text-white font-bold shadow-sm">1</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200 font-medium transition-colors">2</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200 font-medium transition-colors">3</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
