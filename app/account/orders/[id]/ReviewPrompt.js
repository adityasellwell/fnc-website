"use client";

import { useState } from "react";
import { Star, ChevronDown } from "lucide-react";
import ReviewForm from "@/components/product/ReviewForm";
import { cn } from "@/lib/utils";

const REVIEWABLE_STATUSES = ["DELIVERED", "COLLECTED"];

export function canReviewOrder(order) {
  return REVIEWABLE_STATUSES.includes(order.status);
}

export default function ReviewPrompt({ order }) {
  const [openProductId, setOpenProductId] = useState(null);
  const [submittedIds, setSubmittedIds] = useState([]);

  if (!canReviewOrder(order)) return null;

  const reviewedProductIds = new Set((order.reviews || []).map((r) => r.productId));
  const items = (order.items || []).filter(
    (item) => item.product && !reviewedProductIds.has(item.productId) && !submittedIds.includes(item.productId)
  );

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-bordergray bg-white p-5 flex flex-col gap-3">
      <h3 className="font-display text-sm font-bold text-charcoal flex items-center gap-2">
        <Star className="h-4 w-4 text-fnc-red" />
        Rate your order
      </h3>
      <div className="flex flex-col divide-y divide-bordergray">
        {items.map((item) => (
          <div key={item.id} className="py-3">
            <button
              onClick={() => setOpenProductId((cur) => (cur === item.productId ? null : item.productId))}
              className="w-full flex items-center justify-between gap-3 text-left"
            >
              <span className="font-body text-sm font-semibold text-charcoal truncate">
                {item.product.name}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate shrink-0 transition-transform",
                  openProductId === item.productId && "rotate-180"
                )}
              />
            </button>
            {openProductId === item.productId && (
              <div className="mt-3">
                <ReviewForm
                  productId={item.productId}
                  orderId={order.id}
                  onSubmitted={() => {
                    setSubmittedIds((cur) => [...cur, item.productId]);
                    setOpenProductId(null);
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
