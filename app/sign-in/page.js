import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import SignInForm from "@/components/auth/SignInForm";
import { Suspense } from "react";

export const metadata = {
  title: "Sign In — F&C Fresh Proteins & More",
  description: "Sign in to your F&C account to track orders and manage addresses.",
};

export default function SignInPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-offwhite">
        <Section background="offwhite" spacing="md">
          <div className="flex justify-center py-6">
            <Suspense fallback={<div className="h-40 flex items-center justify-center font-body text-sm text-slate">Loading Sign In...</div>}>
              <SignInForm />
            </Suspense>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
