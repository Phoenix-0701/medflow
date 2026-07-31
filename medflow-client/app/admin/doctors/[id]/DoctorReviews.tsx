import React from "react";

interface DoctorReviewsProps {
  reviews: Array<{
    id: string;
    rating: number;
    reviewText: string;
    createdAt: string;
    patientName: string;
  }>;
}

export default function DoctorReviews({ reviews }: DoctorReviewsProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Đánh giá gần đây của bệnh nhân
      </h3>
      
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-zinc-400 py-4 text-center">
          Chưa có đánh giá nào cho bác sĩ này.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                  {review.patientName}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <div className="flex items-center mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'text-amber-400' : 'text-gray-300 dark:text-zinc-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-700 dark:text-zinc-300">
                {review.reviewText}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
