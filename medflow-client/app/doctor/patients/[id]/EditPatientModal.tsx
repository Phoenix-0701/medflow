"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function EditPatientModal({ isOpen, onClose, patientData, onComplete }: any) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && patientData) {
      setWeight(patientData.weight?.toString() || "");
      setHeight(patientData.height?.toString() || "");
      setBloodType(patientData.bloodType || "");
    }
  }, [isOpen, patientData]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("accessToken");
      
      const body: any = {};
      if (weight) body.weight = parseFloat(weight);
      if (height) body.height = parseFloat(height);
      if (bloodType) body.bloodType = bloodType;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/users/patients/${patientData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");
      
      onComplete(); // Fetch lại dữ liệu
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-extrabold text-gray-900">Cập nhật chỉ số sinh tồn</h3>
          <p className="text-sm text-gray-500 mt-1">Sửa cân nặng, chiều cao, nhóm máu</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Cân nặng (kg)</label>
            <input 
              type="number" 
              className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              placeholder="VD: 65.5"
              value={weight}
              onChange={e => setWeight(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Chiều cao (cm)</label>
            <input 
              type="number" 
              className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              placeholder="VD: 175"
              value={height}
              onChange={e => setHeight(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nhóm máu</label>
            <select 
              className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={bloodType}
              onChange={e => setBloodType(e.target.value)}
            >
              <option value="">Chưa cập nhật</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-blue-700 font-bold text-white hover:bg-blue-800 transition-colors shadow-md disabled:opacity-50"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
