// app/admin/doctors/[id]/DoctorStatsCards.tsx
import React from "react";

interface DoctorStatsProps {
  totalPatients: number;
  yearsOfExperience: number;
  averageRating: number;
}

export default function DoctorStatsCards({ totalPatients, yearsOfExperience, averageRating }: DoctorStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Thẻ Bệnh Nhân */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-transform hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Tổng Bệnh Nhân</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPatients.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Thẻ Kinh Nghiệm */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-transform hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Số năm kinh nghiệm</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{yearsOfExperience}</p>
              <span className="text-sm font-bold text-gray-900 dark:text-white">năm</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Kinh nghiệm lâm sàng chuyên sâu</p>
          </div>
        </div>
      </div>

      {/* Thẻ Đánh Giá */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-transform hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-400 dark:bg-teal-900/30 dark:text-teal-400">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Đánh giá</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageRating}</p>
              <span className="text-sm font-bold text-gray-900 dark:text-white">/5</span>
            </div>
            {averageRating > 0 ? (
              <p className="text-xs text-gray-500 mt-1">Dựa trên các đánh giá thực tế</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Chưa có đánh giá nào</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}