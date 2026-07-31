"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { DoctorDetail } from "./types";

interface EditDoctorModalProps {
  doctor: DoctorDetail;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function EditDoctorModal({ doctor, onClose, onSave }: EditDoctorModalProps) {
  const [formData, setFormData] = useState({
    fullName: doctor.fullName,
    phone: doctor.phone,
    specialty: doctor.specialty || "",
    department: doctor.department || "",
    yearsOfExperience: doctor.yearsOfExperience || 0,
    licenseNumber: doctor.licenseNumber || "",
    bio: doctor.bio || "",
    isActive: doctor.status === "ACTIVE",
    avatarUrl: doctor.avatar || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const toastId = toast.loading("Đang tải ảnh lên...");
    
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/users/me/avatar-upload-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Lỗi lấy URL upload");
      const rawRes = await res.json();
      const { uploadUrl, objectUrl } = rawRes.data || rawRes;
      
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });
      
      if (!uploadRes.ok) throw new Error("Lỗi upload ảnh");
      
      setFormData(prev => ({ ...prev, avatarUrl: objectUrl }));
      toast.success("Tải ảnh lên thành công!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải ảnh lên", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 overflow-hidden">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Chỉnh sửa thông tin Bác sĩ
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[75vh] overflow-y-auto p-6 flex flex-col gap-5">
            {/* Top Row: Avatar Upload + Full Name */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex flex-col items-center justify-center shrink-0">
                <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800 transition-all overflow-hidden">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className={`h-full w-full object-cover ${isUploading ? 'opacity-50' : ''}`} />
                  ) : (
                    <>
                      <span className="text-2xl">📷</span>
                      <span className="mt-1 text-[11px] font-medium text-gray-500 dark:text-zinc-400">
                        {isUploading ? "Đang tải..." : "Tải ảnh lên"}
                      </span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
                </label>
              </div>

              <div className="flex-1 w-full flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Họ và Tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập họ tên đầy đủ"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={doctor.email || "Chưa cập nhật"}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Số Điện Thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-zinc-800 my-1" />

            {/* Row 2: Specialty & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Chuyên Khoa
                </label>
                <input
                  type="text"
                  placeholder="Vd: Tim mạch, Da liễu, ..."
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Khoa / Phòng Ban
                </label>
                <input
                  type="text"
                  placeholder="Vd: Khoa Nội, Khoa Khám Bệnh"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>

            {/* Row 2.5: License Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Số Giấy Phép Hành Nghề
              </label>
              <input
                type="text"
                placeholder="Nhập số giấy phép (Vd: GP-12345)"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            {/* Row 3: Experience & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Số Năm Kinh Nghiệm
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Vd: 10"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Trạng Thái Tài Khoản
                </label>
                <select
                  value={formData.isActive ? "true" : "false"}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white cursor-pointer"
                >
                  <option value="true">Đang hoạt động (ACTIVE)</option>
                  <option value="false">Đã khóa (INACTIVE)</option>
                </select>
              </div>
            </div>

            {/* Row 4: Bio */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Tiểu sử chuyên môn
              </label>
              <textarea
                rows={4}
                placeholder="Nhập thông tin giới thiệu, bằng cấp, kinh nghiệm nổi bật..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white resize-none"
              />
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-gray-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
