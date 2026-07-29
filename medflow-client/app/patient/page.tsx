// app/patient/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PatientDashboardPage() {
  const [userName, setUserName] = useState("Sarah");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.fullName) setUserName(u.fullName.split(" ")[0]);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <div className="-m-8 flex min-h-screen flex-col bg-[#f8f9fc] text-gray-900 font-sans dark:bg-zinc-950 dark:text-white">
     

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 flex flex-col gap-8">
        {/* Hero Banner Box */}
        <div className="overflow-hidden rounded-2xl bg-[#e8eef7] dark:bg-zinc-900 border border-blue-100/60 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-12 items-center">
          <div className="p-8 sm:p-12 md:col-span-7 flex flex-col items-start">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              How are you feeling today, <br />
              {userName}?
            </h1>
            <p className="mt-4 text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed max-w-lg">
              Our AI Triage system is ready to help assess your symptoms and guide you to the right care, instantly.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-xl bg-[#004bb4] px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition-all cursor-pointer">
                Start AI Health Consultation
              </button>
              <button className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-bold text-[#004bb4] shadow-2xs hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-blue-300 cursor-pointer">
                Book Standard Appointment
              </button>
            </div>
          </div>

          {/* Banner Graphic Placeholder */}
          <div className="md:col-span-5 h-64 md:h-full bg-gradient-to-tr from-[#d5e2f5] via-[#e2ecf9] to-[#edf3fc] dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center p-6">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-300/30 shadow-inner">
              <span className="text-6xl animate-pulse">🌐</span>
            </div>
          </div>
        </div>

        {/* Two Columns Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Upcoming Appointments & Recent Health Insights */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Upcoming Appointments */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Upcoming Appointments
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Appointment Card 1 */}
                <div className="relative rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#004bb4] rounded-l-2xl" />
                  <div>
                    <div className="flex items-center justify-between pl-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        Confirmed
                      </span>
                      <button className="text-gray-400 hover:text-gray-600 font-bold">
                        ⋮
                      </button>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mt-3 pl-2">
                      Dr. Emily Chen
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 pl-2">
                      Cardiology Follow-up
                    </p>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-3 dark:border-zinc-800 text-xs text-gray-600 dark:text-zinc-300 flex flex-col gap-2 pl-2">
                    <div className="flex items-center gap-2.5">
                      <span>📅</span> Oct 24, 2024
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span>🕒</span> 10:30 AM
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span>📹</span> Telehealth
                    </div>
                  </div>
                </div>

                {/* Appointment Card 2 */}
                <div className="relative rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-gray-300 rounded-l-2xl dark:bg-zinc-700" />
                  <div>
                    <div className="flex items-center justify-between pl-2">
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
                        Pending
                      </span>
                      <button className="text-gray-400 hover:text-gray-600 font-bold">
                        ⋮
                      </button>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mt-3 pl-2">
                      Dr. Marcus Webb
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 pl-2">
                      General Physical
                    </p>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-3 dark:border-zinc-800 text-xs text-gray-600 dark:text-zinc-300 flex flex-col gap-2 pl-2">
                    <div className="flex items-center gap-2.5">
                      <span>📅</span> Nov 12, 2024
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span>🕒</span> 2:00 PM
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span>📍</span> Main Clinic, Rm 302
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Health Insights */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Recent Health Insights
                </h2>
                <button className="text-xs font-bold text-[#004bb4] hover:underline dark:text-blue-400">
                  View History
                </button>
              </div>

              <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300 text-lg">
                  🌱
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                    AI Symptom Check: Headaches
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-zinc-300 mt-1 leading-relaxed">
                    Based on your log yesterday, the AI suggests increasing water intake and monitoring screen time. No red flag symptoms detected.
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    Yesterday, 4:15 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Reminders & Quick Access */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Reminders */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Reminders
              </h2>

              <div className="flex flex-col gap-3">
                {/* Reminder Item 1 */}
                <div className="rounded-2xl border border-rose-200/80 bg-[#fde8e8] p-4.5 dark:border-rose-950 dark:bg-rose-950/40">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
                    <span>⚠️</span> Prescription Refill Needed
                  </div>
                  <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-1">
                    Lisinopril 10mg is running low (4 days left).
                  </p>
                  <button className="mt-3 text-xs font-bold text-rose-800 underline hover:text-rose-900 dark:text-rose-300">
                    Request Refill
                  </button>
                </div>

                {/* Reminder Item 2 */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-4.5 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-2 text-[#004bb4] dark:text-blue-400 font-bold text-xs">
                    <span>ℹ️</span> Lab Results Available
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                    Your recent blood panel results have been uploaded by Dr. Chen.
                  </p>
                  <button className="mt-3 text-xs font-bold text-[#004bb4] underline hover:text-blue-800 dark:text-blue-400">
                    View Results
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Access */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Quick Access
              </h2>

              <div className="flex flex-col gap-2.5">
                <Link
                  href="/patient/profile"
                  className="flex items-center justify-between rounded-xl border border-gray-200/80 bg-white px-4 py-3.5 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-sm">📋</span> Medical Records
                  </span>
                  <span className="text-gray-400">›</span>
                </Link>

                <div className="flex items-center justify-between rounded-xl border border-gray-200/80 bg-white px-4 py-3.5 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-colors cursor-pointer">
                  <span className="flex items-center gap-3">
                    <span className="text-sm">💊</span> Medications
                  </span>
                  <span className="text-gray-400">›</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-200/80 bg-white px-4 py-3.5 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-colors cursor-pointer">
                  <span className="flex items-center gap-3">
                    <span className="text-sm">💳</span> Billing & Insurance
                  </span>
                  <span className="text-gray-400">›</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="border-t border-gray-200/80 bg-white px-8 py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="font-extrabold text-[#1a4b8c] dark:text-blue-400 text-sm">
              MedFlow AI
            </span>
            <span>© 2024 MedFlow AI Healthcare. Clinical Grade Intelligence.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="#" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="#" className="hover:underline">
              HIPAA Compliance
            </Link>
            <Link href="#" className="hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}