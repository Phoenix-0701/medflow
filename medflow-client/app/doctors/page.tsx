"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "../Header";

interface TopDoctor {
  id: string;
  specialty: string;
  department: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  totalReviews: number;
  averageRating: number;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<TopDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTopDoctors() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/users/public/top-doctors`);
        if (res.ok) {
          const json = await res.json();
          setDoctors(json.data || json);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách bác sĩ:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTopDoctors();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-gray-900 dark:text-zinc-100 flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Banner */}
        <section className="bg-blue-50 dark:bg-zinc-900 py-16 border-b border-blue-100 dark:border-zinc-800">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Đội ngũ Chuyên gia Hàng đầu
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Tìm kiếm và đặt lịch với các bác sĩ chuyên khoa giỏi nhất. Chất lượng khám chữa bệnh luôn được ưu tiên hàng đầu.
            </p>
          </div>
        </section>

        {/* Danh sách Bác sĩ */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="py-20 text-center text-gray-500">
                Đang tải dữ liệu...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {doctors.map((doc) => (
                  <div key={doc.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md flex flex-col">
                    <div className="h-48 w-full bg-gray-100 dark:bg-zinc-800 relative shrink-0">
                      <Image
                        src={doc.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.user?.fullName || "Doctor")}&background=random&size=300`}
                        alt={doc.user?.fullName || "Doctor"}
                        fill
                        className="object-cover"
                        unoptimized={true}
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                          {doc.user?.fullName || "Bác sĩ chuyên khoa"}
                        </h3>
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                          {doc.specialty}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 flex items-center gap-1">
                          📍 {doc.department || "Bệnh viện Trung ương"}
                        </p>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-amber-500">
                            <span>★</span>
                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                              {doc.averageRating > 0 ? doc.averageRating : "Chưa có"}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-500">
                            {doc.totalReviews} đánh giá
                          </span>
                        </div>
                        <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                          Đặt lịch
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      
      {/* Footer (Simplified) */}
      <footer className="bg-white dark:bg-zinc-950 py-8 border-t border-gray-100 dark:border-zinc-800 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6">
          © {new Date().getFullYear()} MedFlow. Tất cả các quyền được bảo lưu.
        </div>
      </footer>
    </div>
  );
}
