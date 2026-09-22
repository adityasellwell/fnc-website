import FncLoader from "@/components/ui/FncLoader";

export default function AccountLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-offwhite">
      <FncLoader text="Fetching your order history & account details..." />
    </div>
  );
}
