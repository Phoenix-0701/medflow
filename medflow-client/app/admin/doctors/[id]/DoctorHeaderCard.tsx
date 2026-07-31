import React from "react";
import Image from "next/image";
import { DoctorDetail } from "./types";

interface DoctorHeaderProps {
  doctor: DoctorDetail;
  onToggleLock: () => void;
  onEdit: () => void;
}

export default function DoctorHeaderCard({ doctor, onToggleLock, onEdit }: DoctorHeaderProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mt-4">
      
      {/* Left Content: Avatar + Info */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full md:w-auto">
        {/* Avatar */}
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-gray-50 dark:border-zinc-800 shadow-sm">
          <Image
            src={doctor.avatar}
            alt={doctor.fullName}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col items-center sm:items-start gap-2">
          {/* Name & Badge */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              BS. {doctor.fullName}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                doctor.status === "ACTIVE"
                  ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  doctor.status === "ACTIVE" ? "bg-teal-600" : "bg-red-600"
                }`}
              ></span>
              {doctor.status === "ACTIVE" ? "Đang hoạt động" : "Đã khóa"}
            </span>
          </div>

          {/* Title */}
          <p className="text-base text-gray-700 dark:text-zinc-300 font-medium">
            {doctor.title || "Chưa cập nhật chức danh/khoa"}
          </p>

          {/* Contact Badges */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1">
            {/* ID Badge */}
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-sm text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span>GP: {doctor.licenseNumber}</span>
            </div>

            {/* Email Badge */}
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-sm text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{doctor.email || "Chưa cập nhật"}</span>
            </div>

            {/* Phone Badge */}
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-sm text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{doctor.phone === "---" ? "Chưa cập nhật" : doctor.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content: Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
        <button
          onClick={onEdit}
          className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Chỉnh sửa
        </button>
      </div>

    </div>
  );
}