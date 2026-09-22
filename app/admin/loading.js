import FncLoader from "@/components/ui/FncLoader";

export default function AdminLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-warmwhite">
      <FncLoader text="Loading F&C Admin Console..." />
    </div>
  );
}
