// app/ProcessSection.tsx
export default function ProcessSection() {
  const steps = [
    {
      step: "1. AI Triage",
      desc: "Đánh giá sơ bộ triệu chứng thông minh và dự đoán phân loại mức độ ưu tiên.",
      iconBg: "bg-blue-600 text-white",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      step: "2. Expert Consult",
      desc: "Kết nối ngay với bác sĩ chuyên khoa phù hợp thông qua chat hoặc video call.",
      iconBg: "bg-blue-600 text-white",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      step: "3. Treatment",
      desc: "Nhận phác đồ điều trị, đơn thuốc điện tử và hướng dẫn theo dõi sức khỏe chi tiết.",
      iconBg: "bg-blue-600 text-white",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-black border-t border-gray-100 dark:border-zinc-900">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          Quy trình hoạt động
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
          3 bước đơn giản để nhận được sự chăm sóc y tế tốt nhất với sự hỗ trợ của trí tuệ nhân tạo.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {steps.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconBg} shadow-md`}>
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {item.step}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-zinc-400 max-w-xs">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
