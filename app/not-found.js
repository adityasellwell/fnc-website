import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-offwhite">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-bordergray shadow-sm space-y-6">
          <span className="font-display text-6xl font-black text-fnc-red">404</span>
          <h1 className="font-display text-2xl font-extrabold text-charcoal">
            Page Not Found
          </h1>
          <p className="font-body text-sm text-slate">
            The page or product you are looking for doesn&apos;t exist or may have been moved.
          </p>
          <div className="pt-2">
            <Link href="/">
              <Button variant="primary">Return Home</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
