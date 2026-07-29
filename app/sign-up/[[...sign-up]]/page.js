import { SignUp } from "@clerk/nextjs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";

export const metadata = {
  title: "Create Account",
  description: "Create an F&C account to track orders and save addresses.",
};

export default function SignUpPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Section background="offwhite" spacing="md">
          <div className="flex justify-center">
            <SignUp signInUrl="/sign-in" />
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
