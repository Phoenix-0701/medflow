// app/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-zinc-800 pt-16 pb-8 text-xs text-gray-500 dark:text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Col 1: Brand */}
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-bold text-blue-600 dark:text-blue-500">
            BKMed AI
          </h3>
          <p className="leading-relaxed">
            Hệ thống y tế tích hợp AI hàng đầu giúp phân loại bệnh, đặt lịch khám và quản lý hồ sơ sức khỏe thông minh, an toàn và bảo mật.
          </p>
          <div className="flex gap-2 mt-2">
            <span className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 cursor-pointer">🌐</span>
            <span className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 cursor-pointer">✉️</span>
            <span className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 cursor-pointer">🔗</span>
          </div>
        </div>

        {/* Col 2: Dịch vụ */}
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-3">Dịch vụ</h4>
          <ul className="flex flex-col gap-2">
            <li><a href="#" className="hover:underline">Sàng lọc AI Triage</a></li>
            <li><a href="#" className="hover:underline">Khám bệnh từ xa</a></li>
            <li><a href="#" className="hover:underline">Đội ngũ bác sĩ</a></li>
            <li><a href="#" className="hover:underline">Sổ sức khỏe điện tử</a></li>
          </ul>
        </div>

        {/* Col 3: Công ty */}
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-3">Công ty</h4>
          <ul className="flex flex-col gap-2">
            <li><a href="#" className="hover:underline">Về chúng tôi</a></li>
            <li><a href="#" className="hover:underline">Tuyển dụng</a></li>
            <li><a href="#" className="hover:underline">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:underline">Thỏa thuận sử dụng</a></li>
          </ul>
        </div>

        {/* Col 4: Liên hệ */}
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-3">Liên hệ</h4>
          <ul className="flex flex-col gap-2">
            <li>📍 Ho Chi Minh City, Vietnam</li>
            <li>📞 1900 xxxx (Hỗ trợ 24/7)</li>
            <li>✉️ support@BKMed.ai</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 border-t border-gray-100 dark:border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
        <p>© 2026 BKMed AI Healthcare. Clinical Grade Intelligence.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">HIPAA Compliance</a>
        </div>
      </div>
    </footer>
  );
}
