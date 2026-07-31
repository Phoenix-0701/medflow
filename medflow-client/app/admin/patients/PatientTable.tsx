"use client";

import Image from "next/image";
import { useState } from "react";
import { Patient } from "./types";

interface PatientTableProps {
  patients: Patient[];
  onToggleLock?: (patientId: string) => void;
}

export default function PatientTable({ patients, onToggleLock }: PatientTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter(
    (pat) =>
      pat.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pat.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pat.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 mt-6 overflow-hidden">
      {/* Header & Search Bar */}
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Danh sách Bệnh nhân
          </h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
            {patients.length} Users
          </span>
        </div>
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
          <svg
            className="absolute left-3.5 top-3 h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase tracking-wider dark:bg-zinc-800/50 dark:text-zinc-400">
            <tr>
              <th className="px-6 py-4">BỆNH NHÂN</th>
              <th className="px-6 py-4">NGÀY SINH / GIỚI TÍNH</th>
              <th className="px-6 py-4">SỐ ĐIỆN THOẠI</th>
              <th className="px-6 py-4">TRẠNG THÁI</th>
              <th className="px-6 py-4 text-right">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-zinc-400">
                  Không tìm thấy bệnh nhân nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredPatients.map((pat) => (
                <tr
                  key={pat.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors group"
                >
                  {/* Cột Bệnh nhân */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-11 w-11 shrink-0">
                        <Image
                          src={pat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(pat.fullName || "User")}&background=random&size=150`}
                          alt={pat.fullName || "Patient Avatar"}
                          fill
                          className="rounded-full object-cover border border-gray-200 dark:border-zinc-700"
                          unoptimized={true}
                        />
                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900 ${!pat.isLocked ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {pat.fullName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                          {pat.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cột Ngày sinh / Giới tính */}
                  <td className="px-6 py-4 text-gray-900 dark:text-zinc-300">
                    <div className="font-semibold">{pat.dateOfBirth ? new Date(pat.dateOfBirth).toLocaleDateString("vi-VN") : "Chưa cập nhật"}</div>
                    <div className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                      {pat.gender || "Chưa rõ"}
                    </div>
                  </td>

                  {/* Cột Số điện thoại */}
                  <td className="px-6 py-4 text-sm text-gray-400 dark:text-zinc-500 font-medium tracking-wide">
                    {pat.phone || "---"}
                  </td>

                  {/* Cột Trạng thái */}
                  <td className="px-6 py-4">
                    {!pat.isLocked ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 tracking-wide dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 tracking-wide dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
                        LOCKED
                      </span>
                    )}
                  </td>

                  {/* Cột Thao tác */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title={!pat.isLocked ? "Khóa tài khoản" : "Mở khóa"}
                        onClick={() => onToggleLock && onToggleLock(pat.id)}
                        className="rounded p-1.5 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {!pat.isLocked ? "🔒" : "🔓"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer Pagination */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-xs font-medium text-gray-500">
          Showing 1 to {filteredPatients.length} of {patients.length} patients
        </p>
        <div className="flex items-center gap-1 text-sm font-medium">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">&lt;</button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm">1</button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">&gt;</button>
        </div>
      </div>
    </div>
  );
}
