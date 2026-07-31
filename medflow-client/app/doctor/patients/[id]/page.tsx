"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../../doctor/Sidebar";
import EditPatientModal from "./EditPatientModal";
import HistoryModal from "./HistoryModal";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const fetchPatientDetails = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/users/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      const patientData = json.data || json;
      
      // Inject patient object into appointments so ConsultationModal can read it
      if (patientData.appointments) {
        patientData.appointments = patientData.appointments.map((a: any) => ({
          ...a,
          patient: patientData
        }));
      }
      
      setPatient(patientData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><p className="text-xl font-bold text-gray-400">Đang tải hồ sơ...</p></div>;
  if (!patient) return <div className="flex h-screen items-center justify-center bg-gray-50"><p className="text-xl font-bold text-rose-500">Không tìm thấy bệnh nhân</p></div>;

  const calculateAge = (dob: string) => {
    if (!dob) return "--";
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };
  
  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return "--";
    const h = height / 100;
    const bmi = weight / (h * h);
    return bmi.toFixed(1);
  };

  const getBMIStatus = (bmi: any) => {
    if (bmi === "--") return "";
    const val = parseFloat(bmi);
    if (val < 18.5) return "Thiếu cân";
    if (val >= 18.5 && val <= 24.9) return "Bình thường";
    if (val >= 25 && val <= 29.9) return "Thừa cân";
    return "Béo phì";
  };

  const age = calculateAge(patient.dateOfBirth);
  const bmi = calculateBMI(patient.weight, patient.height);
  const bmiStatus = getBMIStatus(bmi);
  const genderStr = patient.gender === "MALE" ? "Nam" : patient.gender === "FEMALE" ? "Nữ" : "Khác";

  // Lấy danh sách khám bệnh, tối đa 3 ca gần nhất để hiện preview
  const allAppts = patient.appointments || [];
  const recentAppts = allAppts.slice(0, 3);
  
  // Tìm đơn thuốc hiện tại (từ ca khám COMPLETED gần nhất)
  let currentMedicines = [];
  let currentMedDate = "";
  const lastCompletedAppt = allAppts.find((a: any) => a.status === 'COMPLETED' && a.medicalRecord?.prescription);
  if (lastCompletedAppt) {
    try {
      currentMedicines = JSON.parse(lastCompletedAppt.medicalRecord.prescription);
      currentMedDate = new Date(lastCompletedAppt.startTime).toLocaleDateString("vi-VN");
    } catch(e) {}
  }
  
  // Tóm tắt AI Triage gần nhất
  const lastTriage = allAppts.find((a: any) => a.triageSession)?.triageSession;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-2">
            <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => router.back()}>Bệnh nhân</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <span className="text-blue-700">Hồ sơ chi tiết</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">{patient.user?.fullName}</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Mã bệnh nhân: BN-{patient.id.substring(0,8).toUpperCase()}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-5 py-2.5 bg-blue-700 rounded-xl font-bold text-white hover:bg-blue-800 transition-colors shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            Chỉnh sửa
          </button>
        </div>
      </header>

      <main className="w-full">

          
          <div className="grid grid-cols-12 gap-8">
            {/* Cột trái */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              
              {/* Thông tin cá nhân */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-4 right-4 opacity-5">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-6">Thông tin cá nhân</h3>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tuổi</p>
                    <p className="text-2xl font-black text-gray-900">{age}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Giới tính</p>
                    <p className="text-2xl font-black text-gray-900">{genderStr}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nhóm máu</p>
                    <p className="text-2xl font-black text-rose-600">{patient.bloodType || "--"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cân nặng</p>
                    <p className="text-2xl font-black text-gray-900">{patient.weight ? `${patient.weight} kg` : "--"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Chiều cao</p>
                    <p className="text-2xl font-black text-gray-900">{patient.height ? `${patient.height} cm` : "--"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">BMI</p>
                    <div className="flex items-end gap-2">
                      <p className="text-2xl font-black text-blue-600">{bmi}</p>
                      {bmiStatus && <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mb-1">{bmiStatus}</span>}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-4">

                  <div className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <span className="font-medium truncate">{patient.user?.email || "--"}</span>
                  </div>
                </div>
              </div>

              {/* Tóm tắt AI */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-extrabold text-emerald-800 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                    Tóm tắt AI
                  </h3>
                  {lastTriage && (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                      Bản cập nhật {new Date(lastTriage.createdAt).toLocaleDateString("vi-VN", {day: '2-digit', month: '2-digit'})}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 leading-relaxed font-medium mb-6">
                  {lastTriage ? lastTriage.aiReport : "Chưa có báo cáo AI nào cho bệnh nhân này."}
                </p>

                {lastTriage && (
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl">
                    <p className="text-xs font-bold text-emerald-800 mb-1">Khuyến nghị AI:</p>
                    <p className="text-sm text-emerald-700">Ưu tiên khám chuyên khoa: <span className="font-bold">{lastTriage.recommendedSpecialty}</span>. Chú ý theo dõi sát các triệu chứng bất thường.</p>
                  </div>
                )}
              </div>

            </div>

            {/* Cột phải */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              
              {/* Lịch sử khám bệnh */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-extrabold text-gray-900">Lịch sử khám bệnh</h3>
                  <button onClick={() => setIsHistoryModalOpen(true)} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    Xem tất cả
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-32">Ngày</th>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Chẩn đoán</th>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Bác sĩ</th>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                        <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right w-24">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentAppts.length === 0 ? (
                        <tr><td colSpan={5} className="py-6 text-center text-sm font-medium text-gray-400">Chưa có lịch sử khám bệnh.</td></tr>
                      ) : (
                        recentAppts.map((appt: any) => (
                          <tr key={appt.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="py-4 text-sm font-extrabold text-gray-900">
                              {new Date(appt.startTime).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="py-4 text-sm font-bold text-gray-700">
                              {appt.medicalRecord?.finalDiagnosis || appt.triageSession?.recommendedSpecialty || "Khám tổng quát"}
                            </td>
                            <td className="py-4 text-sm font-medium text-gray-600">
                              BS. {appt.doctor?.user?.fullName || "N/A"}
                            </td>
                            <td className="py-4">
                              {appt.status === 'COMPLETED' ? (
                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-md">Đã khám</span>
                              ) : appt.status === 'CANCELLED' ? (
                                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-md">Đã hủy</span>
                              ) : (
                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-md">Chờ khám</span>
                              )}
                            </td>
                            <td className="py-4 text-right">
                              <button 
                                onClick={() => setIsHistoryModalOpen(true)}
                                className="text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1 w-full"
                              >
                                Chi tiết
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grid 2 cột: Đơn thuốc & Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Đơn thuốc hiện tại */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-extrabold text-gray-900 mb-6">Đơn thuốc hiện tại</h3>
                  
                  {currentMedicines.length === 0 ? (
                    <div className="text-center py-8 text-sm font-medium text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                      Không có đơn thuốc nào đang lưu.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentMedicines.slice(0,3).map((med: any, i: number) => {
                        const times = [];
                        if (med.timing.morning) times.push("sáng");
                        if (med.timing.noon) times.push("trưa");
                        if (med.timing.night) times.push("tối");
                        
                        return (
                          <div key={i} className="border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-extrabold text-gray-900 text-lg">{med.name}</h4>
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">{med.quantity}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-4 leading-relaxed">
                              Uống {med.dosage} vào {times.join(", ")}.
                            </p>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              Cập nhật: {currentMedDate}
                            </div>
                          </div>
                        )
                      })}
                      {currentMedicines.length > 3 && (
                        <div className="text-center pt-2">
                          <span className="text-sm font-bold text-blue-600">+{currentMedicines.length - 3} loại thuốc khác</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Xu hướng chỉ số (Placeholder) */}
                <div className="rounded-3xl overflow-hidden relative shadow-sm group">
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-800/40 to-transparent z-10"></div>
                  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" alt="Chart" className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700" />
                  
                  <div className="absolute bottom-0 left-0 p-8 z-20">
                    <h3 className="text-3xl font-black text-white mb-2 leading-tight">Xu hướng<br/>chỉ số</h3>
                    <p className="text-blue-100 text-sm font-medium mb-6">Theo dõi nhịp tim và huyết áp 24h gần nhất.</p>
                    <button className="px-5 py-2.5 bg-white text-blue-900 font-black text-sm rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                      Xem chi tiết
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </main>

      <EditPatientModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        patientData={patient}
        onComplete={fetchPatientDetails}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        appointments={patient.appointments}
        patientName={patient.user?.fullName}
      />
    </div>
  );
}
