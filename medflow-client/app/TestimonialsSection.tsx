// app/TestimonialsSection.tsx
"use client";

import { useEffect, useState } from "react";

interface Review {
  name: string;
  comment: string;
  stars: number;
}

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/users/public/reviews`);
        if (res.ok) {
          const json = await res.json();
          const responseData = json.data || json;
          if (responseData && Array.isArray(responseData)) {
            const mappedReviews = responseData.map((item: any) => ({
              name: item.patient?.user?.fullName || "Bệnh nhân ẩn danh",
              comment: item.reviewText || "",
              stars: item.rating || 5,
            }));
            setReviews(mappedReviews);
          }
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (loading) {
    return <div className="py-20 text-center">Loading reviews...</div>;
  }

  return (
    <section className="py-20 bg-gray-50/50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          Khách hàng nói về chúng tôi
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 text-left">
          {reviews.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-zinc-800 font-bold text-gray-600 dark:text-zinc-300 text-xs">
                  {item.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.name}
                  </h4>
                  <div className="text-amber-400 text-xs">
                    {"★".repeat(item.stars)}
                  </div>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-gray-600 dark:text-zinc-400 italic">
                {item.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
