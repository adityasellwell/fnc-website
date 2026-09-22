"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Runtime Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-offwhite">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-bordergray shadow-sm space-y-6">
        <div className="w-16 h-16 bg-fnc-red/10 text-fnc-red rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          !
        </div>
        <h2 className="font-display text-2xl font-extrabold text-charcoal">
          Something went wrong
        </h2>
        <p className="font-body text-sm text-slate">
          We encountered a temporary issue while loading this page. Please try refreshing.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button variant="primary" onClick={() => reset()}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
