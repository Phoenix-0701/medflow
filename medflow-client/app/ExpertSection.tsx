// app/ExpertSection.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface PublicDoctor {
  id: string;
  specialty: string;
  department: string;
  avatar?: string;
  user: {
    fullName: string;
    email: string;
  };
}

export default function ExpertSection() {
  const [doctors, setDoctors] = useState<PublicDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDoctors() {
      try {
        
        const res = await fetch("http://localhost:4000/users/public/doctors?limit=4");
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách bác sĩ công khai:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctors();
  }, []);

  return (
    <section className="py-16 bg-gray-50/50 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Đội ngũ chuyên gia
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
              Những bác sĩ hàng đầu từ các bệnh viện tuyến trung ương.
            </p>
          </div>
          <a href="/doctors" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
            Xem tất cả →
          </a>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-gray-500">Đang tải danh sách bác sĩ...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc) => (
              <div key={doc.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md">
                <div className="h-48 w-full bg-gray-200 relative">
                  <Image
                    src={doc.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300"}
                    alt={doc.user?.fullName || "Doctor"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
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
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}