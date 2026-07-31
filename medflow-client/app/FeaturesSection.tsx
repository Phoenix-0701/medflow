// app/FeaturesSection.tsx
export default function FeaturesSection() {
  const features = [
    {
      title: "Phân loại thông minh",
      desc: "Mô hình AI được huấn luyện trên hàng triệu hồ sơ y tế, độ chính xác lâm sàng đạt 98% trong việc nhận diện triệu chứng.",
      icon: "📊",
    },
    {
      title: "Bảo mật HIPAA",
      desc: "Dữ liệu sức khỏe của bạn được mã hóa đầu cuối và tuân thủ nghiêm ngặt các tiêu chuẩn bảo mật y tế quốc tế.",
      icon: "🛡️",
    },
    {
      title: "Kết nối 24/7",
      desc: "Đội ngũ y bác sĩ luôn sẵn sàng hỗ trợ trực tuyến mọi lúc, mọi nơi, đảm bảo bạn không bao giờ phải chờ đợi trong trường hợp khẩn cấp.",
      icon: "🌐",
    },
  ];

  return (
    <section className="py-20 bg-blue-50/30 dark:bg-zinc-900/30">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          Tính năng nổi bật
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
          Hệ sinh thái chăm sóc sức khỏe toàn diện với công nghệ y tế tiên tiến nhất.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 text-left">
          {features.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-blue-100 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-zinc-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
