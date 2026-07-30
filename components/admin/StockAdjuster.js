"use client";

import { useState, useTransition } from "react";
import { Minus, Plus, Loader2 } from "lucide-react";
import { updateStockAction } from "@/app/admin/inventory/actions";

export default function StockAdjuster({ productId, stock }) {
  const [value, setValue] = useState(stock);
  const [pending, startTransition] = useTransition();

  function adjust(delta) {
    const next = Math.max(0, value + delta);
    setValue(next);
    startTransition(() => updateStockAction(productId, next));
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => adjust(-1)}
        disabled={pending || value <= 0}
        className="h-8 w-8 flex items-center justify-center rounded-full border border-bordergray hover:bg-warmwhite transition-colors disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={`font-body text-sm font-semibold w-8 text-center ${value <= 0 ? "text-fnc-red" : "text-charcoal"}`}>
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : value}
      </span>
      <button
        type="button"
        onClick={() => adjust(1)}
        disabled={pending}
        className="h-8 w-8 flex items-center justify-center rounded-full border border-bordergray hover:bg-warmwhite transition-colors disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
