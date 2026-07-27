import { cn } from "@/lib/utils";

/**
 * Soft, glossy color-blob shapes echoing the F&C logo's 3D look — used
 * as a full-bleed decorative backdrop in Direction B ("Bold & Kinetic")
 * sections. Purely decorative: aria-hidden, no F&C content knowledge.
 */
export default function BlobBackdrop({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-fnc-red/25 blur-3xl" />
      <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-fnc-blue/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-fnc-green/20 blur-3xl" />
    </div>
  );
}
