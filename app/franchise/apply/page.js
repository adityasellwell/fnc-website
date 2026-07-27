import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Reveal from "@/components/motion/Reveal";
import ApplyForm from "@/components/franchise/ApplyForm";
import { FRANCHISE_STATS } from "@/lib/constants";

export const metadata = {
  title: "Apply for Franchise — F&C Fresh Proteins & More",
  description:
    "Apply to bring F&C's fresh protein retail model to your city. Tell us about your city, budget, and background — our franchise team will take it from there.",
};

export default function FranchiseApplyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-offwhite">
        <div className="border-b border-bordergray bg-white py-4">
          <Container>
            <Link
              href="/franchise"
              className="inline-flex items-center gap-2 font-body text-sm font-semibold text-slate hover:text-fnc-red transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to franchise overview
            </Link>
          </Container>
        </div>

        <Section background="offwhite" spacing="md">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-16">
            <Reveal className="flex flex-col gap-6">
              <div>
                <p className="font-body text-xs sm:text-sm font-semibold uppercase tracking-wider text-fnc-red mb-3">
                  Franchise Application
                </p>
                <h1 className="font-display text-section-heading font-bold text-charcoal leading-tight">
                  Let&apos;s bring F&amp;C to your city.
                </h1>
                <p className="font-body text-body text-slate mt-4">
                  Fill in a few details below and our franchise team will
                  reach out to discuss next steps — site evaluation,
                  training, and setup.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-charcoal text-white rounded-2xl p-6">
                {FRANCHISE_STATS.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-2xl font-bold text-fnc-red">
                      {stat.value}
                    </p>
                    <p className="font-body text-xs text-white/70 mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-bordergray rounded-2xl p-6 flex flex-col gap-3">
                <h3 className="font-display text-base font-bold text-charcoal">
                  What happens next?
                </h3>
                <ol className="flex flex-col gap-2 font-body text-sm text-slate">
                  <li>1. We review your application within a few business days.</li>
                  <li>2. Our team calls to discuss your city, timeline and budget.</li>
                  <li>3. If it&apos;s a fit, we move to site evaluation and agreement.</li>
                </ol>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="bg-white border border-bordergray rounded-3xl p-6 sm:p-8 shadow-xs">
              <ApplyForm />
            </Reveal>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
