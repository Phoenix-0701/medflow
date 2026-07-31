"use client";

import React from "react";
import { RecentAppointment } from "./types";

interface DoctorAppointmentsProps {
  appointments: RecentAppointment[];
}

export default function DoctorAppointments({ appointments }: DoctorAppointmentsProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
        Lịch Khám Gần Đây
      </h3>
      {appointments.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">
          Chưa có lịch khám nào gần đây.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="flex items-start gap-4 rounded-xl border border-gray-100 p-4 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {apt.patientInitials}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {apt.patientName}
                  </h4>
                  <span className="text-xs text-gray-500">{apt.time}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
                  {apt.reason}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      apt.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : apt.status === "CANCELLED"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {apt.status === "FOLLOW_UP" ? "Tái Khám" : apt.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}