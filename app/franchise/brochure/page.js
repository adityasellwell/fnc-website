import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Reveal from "@/components/motion/Reveal";
import Button from "@/components/ui/Button";
import { BRAND, FRANCHISE_STATS } from "@/lib/constants";

export const metadata = {
  title: "Franchise Brochure — F&C Fresh Proteins & More",
  description:
    "An overview of the F&C franchise format — investment, support, and what partners get. Request the full brochure over WhatsApp or email.",
};

const highlights = [
  "Proven fresh-protein retail format with a working flagship store",
  "Cold-chain and hygiene systems set up for you, not left to figure out",
  "Sourcing, supplier relationships and daily quality checks handled centrally",
  "Staff training and store-opening support from our team",
  "Marketing playbook for local launch and ongoing demand",
];

export default function FranchiseBrochurePage() {
  const digits = BRAND.whatsapp.replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent(
    "Hi! I'd like to request the full F&C franchise brochure."
  );

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
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-start">
            <Reveal className="flex flex-col gap-6">
              <div>
                <p className="font-body text-xs sm:text-sm font-semibold uppercase tracking-wider text-fnc-red mb-3">
                  Franchise Brochure
                </p>
                <h1 className="font-display text-section-heading font-bold text-charcoal leading-tight">
                  What you get as an F&amp;C franchise partner.
                </h1>
                <p className="font-body text-body text-slate mt-4">
                  Here&apos;s the short version of what&apos;s in our full brochure. Request
                  the detailed PDF — with investment breakdown, unit economics and
                  timelines — over WhatsApp or email and our franchise team will send
                  it straight to you.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-charcoal text-white rounded-2xl p-6">
                {FRANCHISE_STATS.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-2xl font-bold text-fnc-red">{stat.value}</p>
                    <p className="font-body text-xs text-white/70 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <ul className="flex flex-col gap-3">
                {highlights.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 font-body text-sm text-slate">
                    <CheckCircle2 className="h-4.5 w-4.5 text-fnc-green shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.08} className="bg-white border border-bordergray rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
              <h2 className="font-display text-lg font-bold text-charcoal">
                Request the Full Brochure
              </h2>
              <p className="font-body text-sm text-slate">
                Get the detailed PDF sent directly to you, no forms to fill in.
              </p>
              <Button
                href={`https://wa.me/${digits}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                className="w-full"
              >
                <MessageCircle className="h-5 w-5" />
                Request on WhatsApp
              </Button>
              <Button
                href={`mailto:${BRAND.email}?subject=${encodeURIComponent("Franchise Brochure Request")}`}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Mail className="h-5 w-5" />
                Request by Email
              </Button>

              <div className="pt-4 mt-2 border-t border-bordergray">
                <p className="font-body text-sm text-slate mb-3">
                  Ready to move forward already?
                </p>
                <Button href="/franchise/apply" variant="secondary" size="lg" className="w-full">
                  Apply for Franchise
                </Button>
              </div>
            </Reveal>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
