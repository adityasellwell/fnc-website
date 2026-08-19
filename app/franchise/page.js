import { icons } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import Image from "next/image";
import { FRANCHISE_STATS, WHY_CHOOSE_FC } from "@/lib/constants";
import { getSettings } from "@/services/settings";

export const metadata = {
  title: "Franchise With F&C — Fresh Proteins & More",
  description:
    "Bring F&C's hygiene-first, cold-chain-disciplined fresh protein retail model to your city. Investment details, process, and ongoing support for franchise partners.",
};

const investmentHighlights = [
  {
    icon: "IndianRupee",
    title: "Structured investment",
    detail:
      "A clear, tiered investment range depending on store size and city — covering fit-out, equipment, and opening inventory.",
  },
  {
    icon: "TrendingUp",
    title: "Proven unit economics",
    detail:
      "Our flagship Thane store gives partners a real, working reference point for footfall, basket size and margins — not projections on a slide.",
  },
  {
    icon: "Handshake",
    title: "Full operational support",
    detail:
      "Sourcing relationships, staff training, store layout, and equipment specifications — you're not building the format from scratch.",
  },
  {
    icon: "ShieldCheck",
    title: "Brand you don't have to build",
    detail:
      "Launch under a hygiene-first brand already earning trust in the market, backed by our sourcing and quality standards.",
  },
];

const process = [
  {
    icon: "MessageSquare",
    title: "Enquiry",
    detail: "Submit your application — city, budget, and a bit about you.",
  },
  {
    icon: "MapPinned",
    title: "Site Evaluation",
    detail: "Our team reviews your proposed location and city fit.",
  },
  {
    icon: "FileCheck",
    title: "Agreement & Training",
    detail: "Sign on, then your team trains on our full hygiene and ops standard.",
  },
  {
    icon: "Hammer",
    title: "Store Setup",
    detail: "Fit-out, equipment, and sourcing pipeline set up to spec.",
  },
  {
    icon: "PartyPopper",
    title: "Launch",
    detail: "Store opens, backed by our marketing and launch playbook.",
  },
  {
    icon: "HeartHandshake",
    title: "Ongoing Support",
    detail: "Continued sourcing, training refreshers, and operational check-ins.",
  },
];

export default async function FranchisePage() {
  const settings = await getSettings();
  const heroImage = settings?.franchiseHeroImage || null;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-offwhite">
        {/* Hero */}
        <Section spacing="lg" className="bg-charcoal text-white">
          <div className={heroImage ? "grid lg:grid-cols-2 gap-12 items-center" : ""}>
            <div>
              <Reveal className={heroImage ? "" : "max-w-3xl"}>
                <p className="font-body text-sm font-semibold uppercase tracking-wider text-fnc-red mb-3">
                  Franchise With F&amp;C
                </p>
                <h1 className="font-display text-hero sm:text-hero-lg font-bold leading-[1.02]">
                  Bring F&amp;C&apos;s fresh protein model to your city.
                </h1>
                <p className={`font-body text-body-lg text-white/75 mt-5 ${heroImage ? "" : "max-w-2xl"}`}>
                  A proven format, a trusted brand, and a supply chain built for
                  hygiene and consistency — ready to launch where you are.
                </p>
              </Reveal>

              <div className={`grid grid-cols-3 gap-6 mt-12 ${heroImage ? "" : "max-w-xl"}`}>
                {FRANCHISE_STATS.map((stat, i) => (
                  <Reveal key={stat.label} delay={0.1 + i * 0.06}>
                    <p className="font-display text-3xl sm:text-4xl font-bold text-fnc-red">
                      {stat.value}
                    </p>
                    <p className="font-body text-sm text-white/70 mt-1">
                      {stat.label}
                    </p>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.3} className="flex flex-wrap gap-4 mt-10">
                <Button href="/franchise/apply" size="lg">
                  Apply for Franchise
                </Button>
                <Button
                  href="/franchise/brochure"
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:border-white"
                >
                  Download Brochure
                </Button>
              </Reveal>
            </div>

            {heroImage && (
              <Reveal delay={0.15} className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden">
                <Image src={heroImage} alt="F&C franchise storefront" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              </Reveal>
            )}
          </div>
        </Section>

        {/* Investment pitch */}
        <Section background="offwhite" spacing="md">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="font-body text-xs sm:text-sm font-extrabold uppercase tracking-wider text-fnc-red mb-3">
              Why Partner With Us
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal leading-[1.1]">
              A format we&apos;ve already proven, so you don&apos;t have to.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            {investmentHighlights.map((item, i) => {
              const Icon = icons[item.icon];
              return (
                <Reveal
                  key={item.title}
                  delay={i * 0.06}
                  className="bg-white border border-bordergray rounded-3xl p-8 flex gap-5"
                >
                  <div className="h-14 w-14 rounded-2xl bg-fnc-red/10 flex items-center justify-center text-fnc-red shrink-0">
                    {Icon && <Icon className="h-7 w-7" strokeWidth={2.25} />}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-lg font-bold text-charcoal">
                      {item.title}
                    </h3>
                    <p className="font-body text-sm text-slate leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* Process */}
        <Section background="warmwhite" spacing="md">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="font-body text-xs sm:text-sm font-extrabold uppercase tracking-wider text-fnc-red mb-3">
              How It Works
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal leading-[1.1]">
              From enquiry to opening day.
            </h2>
          </div>
          <div className="relative max-w-5xl mx-auto">
            <div className="hidden lg:block absolute top-10 left-10 right-10 h-0.5 bg-bordergray" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-12 gap-x-6">
              {process.map((step, i) => {
                const Icon = icons[step.icon];
                return (
                  <Reveal
                    key={step.title}
                    delay={i * 0.06}
                    className="relative flex flex-col items-center text-center gap-4"
                  >
                    <div className="relative z-10 h-20 w-20 rounded-full bg-white border-2 border-bordergray flex items-center justify-center text-fnc-red shadow-sm shrink-0">
                      {Icon && <Icon className="h-9 w-9" strokeWidth={2.25} />}
                    </div>
                    <div>
                      <p className="font-body text-base font-bold text-charcoal">
                        {step.title}
                      </p>
                      <p className="font-body text-xs text-slate leading-relaxed max-w-36 mt-1">
                        {step.detail}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Why choose F&C reused */}
        <Section background="offwhite" spacing="md">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="font-body text-xs sm:text-sm font-extrabold uppercase tracking-wider text-fnc-red mb-3">
              What Comes With The Brand
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal leading-[1.1]">
              The same standard, in every city we open.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {WHY_CHOOSE_FC.slice(0, 6).map((point, i) => {
              const Icon = icons[point.icon];
              return (
                <Reveal
                  key={point.title}
                  delay={i * 0.06}
                  className="bg-white border border-bordergray rounded-3xl p-8 flex flex-col items-center text-center gap-4 shadow-xs"
                >
                  <div className="h-14 w-14 rounded-2xl bg-fnc-green/10 flex items-center justify-center text-fnc-green shrink-0">
                    {Icon && <Icon className="h-7 w-7" strokeWidth={2.25} />}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-display text-lg font-bold text-charcoal">
                      {point.title}
                    </h3>
                    <p className="font-body text-sm text-slate leading-relaxed">
                      {point.detail}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* Final CTA */}
        <Section spacing="lg" className="bg-charcoal text-white">
          <Reveal className="text-center max-w-2xl mx-auto flex flex-col items-center gap-6">
            <h2 className="font-display text-section-heading-lg font-bold leading-[1.05]">
              Ready to bring F&amp;C to your city?
            </h2>
            <p className="font-body text-body text-white/70 max-w-xl">
              Tell us about yourself, your city, and your budget — our
              franchise team will take it from there.
            </p>
            <Button href="/franchise/apply" size="lg">
              Apply for Franchise
            </Button>
          </Reveal>
        </Section>
      </main>
      <Footer />
    </>
  );
}
