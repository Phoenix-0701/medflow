// app/HeroSection.tsx
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 mb-6">
          <span className="text-sm">🌐</span> Đã cập nhật AI GPT-4o cho Y tế
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl leading-tight">
          Chẩn đoán thông minh, <br />
          <span className="text-blue-600 dark:text-blue-500">Chăm sóc tận tâm</span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-gray-600 dark:text-zinc-300">
          Hệ thống y tế tích hợp AI hàng đầu Việt Nam giúp bạn phân loại bệnh và đặt lịch với chuyên gia chỉ trong vài phút.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/login" className="w-full sm:w-auto min-h-[48px] rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
            Khám phá ngay <span>→</span>
          </a>
        </div>

        {/* Main Banner Image */}
        <div className="mt-12 sm:mt-16 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <Image
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop"
            alt="BKMed AI Hospital Banner"
            width={1200}
            height={600}
            className="w-full h-auto object-cover max-h-[500px]"
            priority
          />
        </div>

      </div>
    </section>
  );
}
