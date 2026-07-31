// app/admin/settings/page.tsx
export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Cài Đặt Hệ Thống
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Cấu hình chung dành cho Quản trị viên.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
            Tên phòng khám / Bệnh viện
          </label>
          <input
            type="text"
            defaultValue="Hệ thống Y tế BKMed AI"
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
            Email thông báo
          </label>
          <input
            type="email"
            defaultValue="admin@BKMed.ai"
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
        <button className="w-fit rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white">
          Lưu cài đặt
        </button>
      </div>
    </div>
  );
}
