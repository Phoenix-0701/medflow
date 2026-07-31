// app/admin/doctors/[id]/page.tsx
"use client";

import { useEffect, useState, use, useCallback } from "react";
import toast from "react-hot-toast";
import DoctorHeaderCard from "./DoctorHeaderCard";
import DoctorStatsCards from "./DoctorStatsCards";
import DoctorAppointments from "./DoctorAppointments";
import DoctorReviews from "./DoctorReviews";
import EditDoctorModal from "./EditDoctorModal";
import { DoctorDetail, RecentAppointment } from "./types";

export default function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const doctorId = resolvedParams.id;

  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [appointments, setAppointments] = useState<RecentAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 1. Fetch Chi tiết Bác sĩ
  const fetchDoctorDetail = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/admin/doctors/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Không thể tải thông tin bác sĩ");

      const rawData = await res.json();
      const data = rawData.data || rawData;

      const mappedDoctor: DoctorDetail = {
        id: data.id,
        fullName: data.fullName,
        title: (data.doctorProfile?.specialty || data.doctorProfile?.department) 
          ? `${data.doctorProfile?.specialty || ""} - ${data.doctorProfile?.department || ""}`.replace(/^- | -$/, '') 
          : "",
        specialty: data.doctorProfile?.specialty || "",
        department: data.doctorProfile?.department || "",
        email: data.email || "",
        phone: data.phone || "---",
        docCode: `DOC-${doctorId.slice(0, 4).toUpperCase()}`,
        licenseNumber: data.doctorProfile?.licenseNumber || "Chưa cập nhật",
        status: data.isActive ? "ACTIVE" : "INACTIVE",
        avatar: data.avatarUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=250",
        totalPatients: data.totalPatients || 0,
        yearsOfExperience: data.doctorProfile?.yearsOfExperience || 0,
        bio: data.doctorProfile?.bio || "",
        averageRating: data.averageRating > 0 ? data.averageRating : 0,
        reviews: data.reviews || [],
      };

      setDoctor(mappedDoctor);
      setAppointments(data.recentAppointments || []);
    } catch (err: unknown) {
      console.error("Lỗi fetch chi tiết bác sĩ:", err);
      setError("Không tìm thấy thông tin bác sĩ này.");
    }
  }, [doctorId]);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await fetchDoctorDetail();
      setLoading(false);
    };

    loadAllData();
  }, [fetchDoctorDetail]);

  const handleToggleLock = async () => {
    if (!doctor) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/admin/users/${doctorId}/toggle-lock`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setDoctor({ ...doctor, status: doctor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
      }
    } catch (err) {
      console.error("Lỗi khóa tài khoản:", err);
    }
  };

  const handleSaveEdit = async (data: any) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/admin/doctors/${doctorId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchDoctorDetail();
        toast.success("Cập nhật thông tin thành công!");
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật!");
      }
    } catch(err) {
      console.error(err);
      toast.error("Lỗi kết nối đến máy chủ");
    }
  };

  if (loading) return <div className="flex min-h-[400px] items-center justify-center p-8 text-center text-sm text-gray-500">Đang tải...</div>;
  if (error || !doctor) return <div className="flex min-h-[400px] items-center justify-center p-8 text-center text-rose-600">{error}</div>;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Nút Quay lại */}
      <div>
        <button onClick={() => window.history.back()} className="text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center gap-2">
          &larr; Quay lại danh sách
        </button>
      </div>

      <DoctorHeaderCard doctor={doctor} onToggleLock={handleToggleLock} onEdit={() => setIsEditModalOpen(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <DoctorStatsCards totalPatients={doctor.totalPatients} yearsOfExperience={doctor.yearsOfExperience} averageRating={doctor.averageRating} />
          
          {/* Tiểu Sử Chuyên Môn */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Tiểu Sử Chuyên Môn
              </h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed dark:text-zinc-300 text-justify">
              {doctor.bio || <span className="italic text-gray-400">Chưa cập nhật tiểu sử chuyên môn.</span>}
            </p>
          </div>

          <DoctorReviews reviews={doctor.reviews} />
        </div>
        <div className="lg:col-span-5">
          <DoctorAppointments appointments={appointments} />
        </div>
      </div>

      {isEditModalOpen && (
        <EditDoctorModal 
          doctor={doctor} 
          onClose={() => setIsEditModalOpen(false)} 
          onSave={handleSaveEdit} 
        />
      )}
    </div>
  );
}