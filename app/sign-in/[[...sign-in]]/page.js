import { SignIn } from "@clerk/nextjs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";

export const metadata = {
  title: "Sign In",
  description: "Sign in to your F&C account.",
};

export default function SignInPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Section background="offwhite" spacing="md">
          <div className="flex justify-center">
            <SignIn signUpUrl="/sign-up" />
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
