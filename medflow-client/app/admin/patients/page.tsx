"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import PatientStats from "./PatientStats";
import PatientTable from "./PatientTable";
import AddPatientModal, { NewPatientForm } from "./AddPatientModal";
import { Patient } from "./types";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Fetch danh sách Bệnh nhân từ Server API
  const fetchPatients = useCallback(async () => {
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
        const patientList = users
          .filter((u: { role: string }) => u.role === "PATIENT")
          .map((u: { id: string; fullName: string; email: string; phone: string; avatarUrl?: string; patientProfile?: { dateOfBirth: string; gender: string }; isLocked: boolean }) => ({
            id: u.id,
            avatar: u.avatarUrl,
            fullName: u.fullName || "Bệnh nhân",
            email: u.email,
            phone: u.phone || "Chưa cập nhật",
            dateOfBirth: u.patientProfile?.dateOfBirth,
            gender: u.patientProfile?.gender,
            isLocked: u.isLocked,
          }));
        setPatients(patientList);
      }
    } catch (err) {
      console.error("Lỗi fetch danh sách bệnh nhân:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // 2. Xử lý Thêm Bệnh nhân Mới từ Modal
  const handleAddPatient = async (formData: NewPatientForm) => {
    try {
      const token = localStorage.getItem("accessToken");
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/admin/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        toast.success("Thêm Bệnh nhân thành công!");
        fetchPatients(); 
      } else {
        const errData = await res.json();
        toast.error(`Lỗi: ${errData.message || "Không thể tạo tài khoản bệnh nhân"}`);
      }
    } catch (err) {
      console.error("Lỗi thêm bệnh nhân:", err);
      toast.error("Đã xảy ra lỗi kết nối với máy chủ.");
    }
  };

  // 3. Khóa / Mở khóa tài khoản
  const handleToggleLock = async (patientId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/admin/users/${patientId}/toggle-lock`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        showToast("Đã thay đổi trạng thái tài khoản!");
        fetchPatients();
      }
    } catch (err) {
      console.error("Lỗi toggle lock:", err);
    }
  };

  return (
    <div className="relative flex flex-col gap-6 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[10000] rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-bounce">
          ✓ {toastMessage}
        </div>
      )}

      {/* Header Page */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Quản lý Bệnh nhân
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Manage active patients and add new users to the platform.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#004b93] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#003970] min-h-[44px] cursor-pointer"
        >
          <span className="text-lg leading-none mb-0.5">+</span> Thêm Bệnh nhân
        </button>
      </div>

      {/* Stats Section */}
      <PatientStats
        totalPatients={patients.length}
        activePatients={patients.filter((d) => !d.isLocked).length}
        newPatients={patients.length}
      />

      {/* Patient Table */}
      {loading ? (
        <div className="p-12 text-center text-sm text-gray-500">
          Đang tải danh sách bệnh nhân...
        </div>
      ) : (
        <PatientTable patients={patients} onToggleLock={handleToggleLock} />
      )}

      {/* Add Patient Popup Modal */}
      <AddPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddPatient}
      />
    </div>
  );
}
