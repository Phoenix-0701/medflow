import React, { useState, useEffect, useRef } from "react";

interface Medicine {
  name: string;
  quantity: string;
  dosage: string; // Số lượng mỗi lần
  timing: {
    morning: boolean;
    noon: boolean;
    night: boolean;
  };
}

const COMMON_MEDICINES = [
  // Giảm đau, hạ sốt, chống viêm
  "Paracetamol 500mg", "Panadol Extra", "Efferangan 500mg", "Hapacol 250",
  "Ibuprofen 400mg", "Diclofenac 50mg", "Meloxicam 7.5mg", "Celecoxib 200mg",
  "Aspirin 81mg", "Alpha Choay", "Prednisolone 5mg", "Methylprednisolone 16mg",
  
  // Kháng sinh, Kháng virus
  "Amoxicillin 500mg", "Augmentin 1g", "Azithromycin 500mg", "Cefuroxime 500mg",
  "Cefixime 200mg", "Clarithromycin 500mg", "Levofloxacin 500mg", "Ciprofloxacin 500mg",
  "Metronidazole 250mg", "Acyclovir 400mg", "Fluconazole 150mg",
  
  // Dị ứng, Hô hấp
  "Loratadine 10mg", "Cetirizine 10mg", "Fexofenadine 60mg", "Desloratadine 5mg",
  "Chlorpheniramine 4mg", "Salbutamol 2mg", "Bisolvon 8mg", "Acetylcysteine 200mg",
  "Terpin Codein", "Rhumenol", "Eugica", "Prospan",
  
  // Tiêu hóa
  "Omeprazole 20mg", "Esomeprazole 40mg", "Pantoprazole 40mg", "Nexium 40mg",
  "Domperidone 10mg", "Motilium-M", "Phosphalugel (Gói)", "Yumangel (Dạ dày chữ Y)",
  "Smecta (Gói)", "Berberin 50mg", "Loperamide 2mg", "Oresol (Gói)",
  "Enterogermina (Ống)", "Antibio Pro", "Sorbitol 5g", "Duphalac",
  
  // Tim mạch, Huyết áp
  "Amlodipine 5mg", "Losartan 50mg", "Valsartan 80mg", "Bisoprolol 5mg",
  "Concor 5mg", "Enalapril 5mg", "Atorvastatin 20mg", "Rosuvastatin 10mg",
  
  // Vitamin, Khoáng chất, Khác
  "Vitamin C 1000mg", "Vitamin B Complex", "Vitamin D3 1000 IU", "Enat 400 (Vitamin E)",
  "Canxi Corbiere (Ống)", "Magnesium B6", "Sắt (Ferrovit)", "Kẽm ZinC 10mg",
  "Hoạt huyết dưỡng não", "Ginkgo Biloba 120mg", "Glucosamine 1500mg"
];

export default function ConsultationModal({ isOpen, onClose, appointment, onComplete }: any) {
  const [clinicalFindings, setClinicalFindings] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  
  const [newMedName, setNewMedName] = useState("");
  const [newMedQuantity, setNewMedQuantity] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedTiming, setNewMedTiming] = useState({ morning: false, noon: false, night: false });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Popup Modal Message State
  const [modalMessage, setModalMessage] = useState<{title: string, message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (appointment?.medicalRecord) {
        setClinicalFindings(appointment.medicalRecord.clinicalFindings || "");
        setDiagnosis(appointment.medicalRecord.finalDiagnosis || "");
        try {
          const parsed = JSON.parse(appointment.medicalRecord.prescription || "[]");
          setMedicines(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          setMedicines([]);
        }
      } else {
        setClinicalFindings("");
        setDiagnosis("");
        setMedicines([]);
      }
      setNewMedName("");
      setNewMedQuantity("");
      setNewMedDosage("");
      setNewMedTiming({ morning: false, noon: false, night: false });
      setModalMessage(null);
    }
  }, [isOpen, appointment]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen || !appointment) return null;

  const handleAddMedicine = () => {
    if (!newMedName.trim()) return;
    setMedicines([...medicines, { 
      name: newMedName, 
      quantity: newMedQuantity, 
      dosage: newMedDosage, 
      timing: { ...newMedTiming }
    }]);
    setNewMedName("");
    setNewMedQuantity("");
    setNewMedDosage("");
    setNewMedTiming({ morning: false, noon: false, night: false });
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    if (!clinicalFindings.trim() || !diagnosis.trim()) {
      setModalMessage({
        title: "Thiếu thông tin",
        message: "Vui lòng nhập đầy đủ khám lâm sàng và chẩn đoán.",
        type: "error"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("accessToken");
      
      const prescriptionStr = medicines.length > 0 
        ? JSON.stringify(medicines) 
        : "";

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/appointments/${appointment.id}/notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          clinicalFindings,
          diagnosis,
          prescription: prescriptionStr,
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Lỗi khi lưu bệnh án");
      }

      setModalMessage({
        title: "Thành công",
        message: "Lưu hồ sơ bệnh án thành công!",
        type: "success"
      });
      
      setTimeout(() => {
        onComplete();
        onClose();
      }, 1500);
      
    } catch (err: any) {
      setModalMessage({
        title: "Thất bại",
        message: err.message || "Có lỗi xảy ra",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderModal = () => {
    if (!modalMessage) return null;
    return (
      <div className="absolute inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm rounded-3xl">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-gray-100 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
          <div className="flex justify-center mb-5">
            {modalMessage.type === 'success' ? (
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
            ) : (
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center shadow-inner">
                <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
            )}
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">{modalMessage.title}</h3>
          <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">{modalMessage.message}</p>
          <button
            onClick={() => setModalMessage(null)}
            className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-md"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "--";
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const patient = appointment.patient;
  const fullName = patient?.user?.fullName || "Bệnh nhân";
  const genderStr = patient?.gender === "MALE" ? "Nam" : patient?.gender === "FEMALE" ? "Nữ" : "Khác";
  const age = calculateAge(patient?.dateOfBirth);
  const dateStr = new Date(appointment.startTime).toLocaleDateString("vi-VN");

  const triage = appointment.triageSession;
  const symptoms = triage?.symptomsSummary?.split('\n') || ["Không có ghi nhận"];

  const filteredMedicines = COMMON_MEDICINES.filter(m => m.toLowerCase().includes(newMedName.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-gray-900/50 backdrop-blur-sm overflow-y-auto pt-10 pb-10">
      <div className="bg-slate-50 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col overflow-hidden h-max min-h-[90vh] relative">
        
        {renderModal()}

        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-extrabold text-gray-900">{fullName}</h1>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                ID: {appointment.id.substring(0, 8).toUpperCase()}
              </span>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            {genderStr}, {age} tuổi <span className="mx-2">•</span> Khám ngày: {dateStr}
          </p>
        </div>

        {/* Content Body */}
        <div className="flex flex-col lg:flex-row p-6 gap-6 flex-1">
          
          {/* Cột Trái: AI Báo Cáo Sơ Bộ */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                  <span>🤖</span> AI Báo Cáo Sơ Bộ
                </h3>
                {triage?.severity === 'RED' && (
                  <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-md">
                    ⚠️ Cần lưu ý
                  </span>
                )}
              </div>
              
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tóm tắt triệu chứng</h4>
              <ul className="space-y-3 mb-6">
                {symptoms.map((sym: string, i: number) => sym.trim() && (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-emerald-500 font-bold mt-0.5">○</span>
                    <span>{sym.replace(/^- /, '')}</span>
                  </li>
                ))}
              </ul>

              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Gợi ý phân loại</h4>
              <div className={`p-4 rounded-xl border ${triage?.severity === 'RED' ? 'bg-red-50 border-red-200' : triage?.severity === 'YELLOW' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="flex justify-between items-start mb-1">
                  <h5 className={`font-bold ${triage?.severity === 'RED' ? 'text-red-700' : triage?.severity === 'YELLOW' ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {triage?.recommendedSpecialty || "Khám tổng quát"}
                  </h5>
                </div>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {triage?.aiReport || "Không có báo cáo chi tiết"}
                </p>
              </div>
            </div>
          </div>

          {/* Cột Phải: Ghi Chú Khám Bệnh */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex-1">
              <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2 mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Ghi Chú Khám Bệnh
              </h3>

              <div className="space-y-6">
                {/* Khám lâm sàng */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Khám lâm sàng</label>
                  <textarea
                    className="w-full rounded-xl border border-gray-300 p-4 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[120px]"
                    placeholder="Nhập kết quả khám lâm sàng, sinh hiệu, biểu hiện thực thể..."
                    value={clinicalFindings}
                    onChange={(e) => setClinicalFindings(e.target.value)}
                  />
                </div>

                {/* Chẩn đoán */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Chẩn đoán xác định</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Nhập chẩn đoán cuối cùng..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>

                {/* Kê đơn */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-bold text-gray-700">Kê đơn thuốc</label>
                  </div>
                  
                  {medicines.length > 0 && (
                    <div className="mb-4 space-y-3">
                      {medicines.map((med, index) => {
                        const times = [];
                        if (med.timing.morning) times.push("Sáng");
                        if (med.timing.noon) times.push("Trưa");
                        if (med.timing.night) times.push("Tối");
                        
                        return (
                          <div key={index} className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                            <div>
                              <p className="font-bold text-blue-900 text-sm">{med.name} <span className="text-gray-500 font-medium ml-2">SL: {med.quantity}</span></p>
                              <p className="text-xs text-blue-700 font-semibold mt-1">
                                {med.dosage} / lần <span className="mx-2 text-gray-300">•</span> Uống: {times.join(", ") || "Chưa chọn"}
                              </p>
                            </div>
                            <button onClick={() => handleRemoveMedicine(index)} className="text-gray-400 hover:text-red-600 transition-colors p-2 bg-white rounded-full shadow-sm border border-gray-100">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Form thêm thuốc */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="grid grid-cols-12 gap-3 mb-3">
                      <div className="col-span-12 md:col-span-8 relative" ref={dropdownRef}>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Tên thuốc</label>
                        <input
                          type="text"
                          placeholder="Tìm thuốc (VD: Paracetamol)..."
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold text-gray-900"
                          value={newMedName}
                          onChange={(e) => { setNewMedName(e.target.value); setShowDropdown(true); }}
                          onFocus={() => setShowDropdown(true)}
                        />
                        {/* Dropdown gợi ý */}
                        {showDropdown && newMedName && filteredMedicines.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredMedicines.map(m => (
                              <div 
                                key={m} 
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                                onClick={() => { setNewMedName(m); setShowDropdown(false); }}
                              >
                                {m}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Số lượng tổng</label>
                        <input
                          type="text"
                          placeholder="VD: 20 viên"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold text-gray-900"
                          value={newMedQuantity}
                          onChange={(e) => setNewMedQuantity(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Liều 1 lần</label>
                        <input
                          type="text"
                          placeholder="VD: 1 viên"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold text-gray-900"
                          value={newMedDosage}
                          onChange={(e) => setNewMedDosage(e.target.value)}
                        />
                      </div>
                      
                      <div className="col-span-12 md:col-span-5">
                        <label className="block text-xs font-bold text-gray-500 mb-2">Thời gian uống</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                              checked={newMedTiming.morning}
                              onChange={e => setNewMedTiming({...newMedTiming, morning: e.target.checked})}
                            />
                            <span className="font-medium text-gray-700">Sáng</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                              checked={newMedTiming.noon}
                              onChange={e => setNewMedTiming({...newMedTiming, noon: e.target.checked})}
                            />
                            <span className="font-medium text-gray-700">Trưa</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                              checked={newMedTiming.night}
                              onChange={e => setNewMedTiming({...newMedTiming, night: e.target.checked})}
                            />
                            <span className="font-medium text-gray-700">Tối</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="col-span-12 md:col-span-3">
                        <button
                          onClick={handleAddMedicine}
                          className="w-full px-4 py-2 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-sm hover:bg-emerald-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          Thêm
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-gray-200 bg-white flex justify-end gap-4 mt-auto">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? "Đang lưu..." : (appointment.status === "COMPLETED" ? "Lưu thay đổi" : "Hoàn tất ca khám")}
          </button>
        </div>

      </div>
    </div>
  );
}
