"use client";

import { useEffect, useState } from "react";

interface Medicine {
  name: string;
  quantity: string;
  dosage: string;
  timing: {
    morning: boolean;
    noon: boolean;
    night: boolean;
  };
}

export default function HistoryDetailModal({ isOpen, onClose, appointment, onReviewSuccess }: any) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (isOpen && appointment) {
      if (appointment.medicalRecord?.prescription) {
        try {
          const parsed = JSON.parse(appointment.medicalRecord.prescription);
          setMedicines(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error("Lỗi parse đơn thuốc:", e);
          setMedicines([]);
        }
      } else {
        setMedicines([]);
      }
      
      setRating(appointment.rating || 0);
      setReviewText(appointment.reviewText || "");
      setHoverRating(0);
      setSubmitError("");
    } else {
      setMedicines([]);
    }
  }, [isOpen, appointment]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      setSubmitError("Vui lòng chọn số sao để đánh giá.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/appointments/${appointment.id}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, reviewText })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Không thể gửi đánh giá");
      }
      
      if (onReviewSuccess) {
        onReviewSuccess();
      }
    } catch (err: any) {
      setSubmitError(err.message || "Lỗi kết nối");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !appointment) return null;

  const doctorName = appointment.doctor?.user?.fullName || "Bác sĩ";
  const dateStr = new Date(appointment.startTime).toLocaleString("vi-VN", {
    hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric"
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-blue-700 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold">Hồ sơ bệnh án chi tiết</h2>
            <p className="text-blue-100 text-sm mt-1">
              Khám với <span className="font-semibold">{doctorName}</span> vào lúc {dateStr}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
          
          {/* Thông tin lâm sàng & Chẩn đoán */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3 text-orange-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                <h3 className="font-bold">Khám lâm sàng</h3>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {appointment.medicalRecord?.clinicalFindings || "Không có ghi chú lâm sàng."}
              </p>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3 text-emerald-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                <h3 className="font-bold">Kết luận chẩn đoán</h3>
              </div>
              <p className="text-gray-900 font-medium whitespace-pre-wrap">
                {appointment.medicalRecord?.finalDiagnosis || "Chưa có chẩn đoán."}
              </p>
            </div>
          </div>

          {/* Đơn thuốc */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-blue-800 border-b border-gray-100 pb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              <h3 className="text-xl font-bold">Đơn thuốc bác sĩ kê</h3>
            </div>
            
            {medicines.length === 0 ? (
              <div className="bg-gray-50 text-center p-8 rounded-2xl border border-gray-100 border-dashed">
                <p className="text-gray-500 font-medium">Bác sĩ không kê đơn thuốc cho ca khám này.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {medicines.map((med, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                        <h4 className="text-lg font-bold text-gray-900">{med.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 ml-9">
                        Liều dùng: <span className="font-semibold text-gray-800">{med.dosage}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 ml-9 sm:ml-0 bg-gray-50 p-2 rounded-lg border border-gray-100 shrink-0">
                      <div className={`px-2 py-1 rounded text-xs font-bold flex flex-col items-center gap-1 ${med.timing?.morning ? 'bg-amber-100 text-amber-700' : 'text-gray-300'}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm8.66-10.5a1 1 0 01-.366 1.366l-1.732 1a1 1 0 11-1-1.732l1.732-1a1 1 0 011.366.366zM5.438 15.134a1 1 0 01-.366 1.366l-1.732 1a1 1 0 11-1-1.732l1.732-1a1 1 0 011.366.366zM22 12a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM5 12a1 1 0 01-1 1H2a1 1 0 110-2h2a1 1 0 011 1zm15.66 4.5a1 1 0 01-1.366.366l-1.732-1a1 1 0 111-1.732l1.732 1a1 1 0 01.366 1.366zM7.17 7.866a1 1 0 01-1.366.366l-1.732-1a1 1 0 111-1.732l1.732 1a1 1 0 01.366 1.366zM12 6a6 6 0 100 12 6 6 0 000-12z" /></svg>
                        Sáng
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-bold flex flex-col items-center gap-1 ${med.timing?.noon ? 'bg-orange-100 text-orange-700' : 'text-gray-300'}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                        Trưa
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-bold flex flex-col items-center gap-1 ${med.timing?.night ? 'bg-indigo-100 text-indigo-700' : 'text-gray-300'}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" /></svg>
                        Tối
                      </div>
                      
                      <div className="ml-2 pl-3 border-l border-gray-200">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Số lượng</div>
                        <div className="text-xl font-black text-blue-700 text-center">{med.quantity}</div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Đánh giá bác sĩ */}
          {appointment.status === "COMPLETED" && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-yellow-600 border-b border-gray-100 pb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                <h3 className="text-xl font-bold">Đánh giá bác sĩ</h3>
              </div>
              
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                {appointment.rating ? (
                  // Xem đánh giá đã có
                  <div className="space-y-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className={`w-8 h-8 ${star <= appointment.rating! ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                      ))}
                    </div>
                    {appointment.reviewText && (
                      <p className="text-gray-700 italic border-l-4 border-yellow-400 pl-4 py-1">{appointment.reviewText}</p>
                    )}
                  </div>
                ) : (
                  // Form đánh giá
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          type="button"
                          className="focus:outline-none transition-transform hover:scale-110"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        >
                          <svg className={`w-10 h-10 transition-colors ${(hoverRating || rating) >= star ? "text-yellow-400 drop-shadow" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        </button>
                      ))}
                    </div>
                    <textarea 
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 text-gray-900 focus:ring-blue-500 focus:border-blue-500" 
                      rows={3} 
                      placeholder="Chia sẻ trải nghiệm của bạn với bác sĩ..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    ></textarea>
                    {submitError && <p className="text-rose-500 text-sm font-medium">{submitError}</p>}
                    <div>
                      <button 
                        onClick={handleSubmitReview}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-md"
                      >
                        {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
