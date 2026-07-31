// app/admin/doctors/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import DoctorStats from "./DoctorStats";
import DoctorTable from "./DoctorTable";
import AddDoctorModal, { NewDoctorForm } from "./AddDoctorModal";
import { Doctor } from "./types";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch danh sách Bác sĩ từ Server API
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

      if (res.ok) {
        const resJson = await res.json();
        const users = resJson.data || resJson;
        const doctorList = users
          .filter((u: { role: string }) => u.role === "DOCTOR")
          .map((u: { id: string; fullName: string; email: string; phone: string; avatarUrl?: string; doctorProfile?: { specialty: string; department: string; licenseNumber: string }; isLocked: boolean }) => ({
            id: u.id,
            avatar: u.avatarUrl,
            fullName: u.fullName || "Bác sĩ",
            email: u.email,
            phone: u.phone || "Chưa cập nhật",
            specialty: u.doctorProfile?.specialty || "Tổng quát",
            department: u.doctorProfile?.department || "Chưa phân khoa",
            licenseNumber: u.doctorProfile?.licenseNumber || "MED-2026-VN",
            status: u.isLocked ? "INACTIVE" : "ACTIVE",
          }));
        setDoctors(doctorList);
      }
    } catch (err) {
      console.error("Lỗi fetch danh sách bác sĩ:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // 2. Xử lý Thêm Bác Sĩ Mới từ Modal
  const handleAddDoctor = async (formData: NewDoctorForm) => {
    try {
      const token = localStorage.getItem("accessToken");
      
      // Gọi API thêm bác sĩ của NestJS
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/admin/doctors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          specialty: formData.specialty,
          department: formData.specialty ? "Khoa " + (formData.specialty.split(' (')[1]?.replace(')', '') || formData.specialty) : "Khoa Khám Bệnh",
          licenseNumber: formData.licenseNumber,
          experienceYears: formData.yearsOfExperience,
          bio: formData.bio,
          password: formData.password, // Mật khẩu do Admin nhập
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        toast.success("Thêm Bác sĩ thành công!");
        fetchDoctors(); // Cập nhật lại danh sách tự động
      } else {
        const errData = await res.json();
        toast.error(`Lỗi: ${errData.message || "Không thể tạo tài khoản bác sĩ"}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi kết nối với máy chủ.");
    }
  };

  // 3. Khóa / Mở khóa tài khoản
  const handleToggleLock = async (doctorId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/admin/users/${doctorId}/toggle-lock`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        toast.success("Đã thay đổi trạng thái tài khoản!");
        fetchDoctors();
      }
    } catch (err) {
      console.error("Lỗi toggle lock:", err);
    }
  };

  return (
    <div className="relative flex flex-col gap-6 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header Page */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Quản lý Tài khoản Bác sĩ
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Manage active clinicians and add new medical staff with clinical precision.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#004b93] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#003970] min-h-[44px] cursor-pointer"
        >
          <span className="text-lg leading-none mb-0.5">+</span> Thêm Bác sĩ Mới
        </button>
      </div>

      {/* Stats Section */}
      <DoctorStats
        totalDoctors={doctors.length}
        activeDoctors={doctors.filter((d) => d.status === "ACTIVE").length}
        newDoctors={doctors.length}
      />

      {/* Doctor Table */}
      {loading ? (
        <div className="p-12 text-center text-sm text-gray-500">
          Đang tải danh sách bác sĩ...
        </div>
      ) : (
        <DoctorTable doctors={doctors} onToggleLock={handleToggleLock} />
      )}

      {/* Add Doctor Popup Modal */}
      <AddDoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddDoctor}
      />
    </div>
  );
}
