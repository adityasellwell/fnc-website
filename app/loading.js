import FncLoader from "@/components/ui/FncLoader";

export default function RootLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-offwhite">
      <FncLoader text="Preparing your fresh proteins..." />
    </div>
  );
}
