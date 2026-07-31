// app/doctor/layout.tsx
import DoctorSidebar from "./Sidebar";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50/40 dark:bg-black font-sans">
      <DoctorSidebar />
      <main className="flex-1 p-8 overflow-x-hidden">{children}</main>
    </div>
  );
}
