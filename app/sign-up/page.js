import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata = {
  title: "Create Account — F&C Fresh Proteins & More",
  description: "Create an F&C account to track orders and save addresses.",
};

export default function SignUpPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-offwhite">
        <Section background="offwhite" spacing="md">
          <div className="flex justify-center py-6">
            <SignUpForm />
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
