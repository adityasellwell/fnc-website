import { icons } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import { TRUST_BADGES } from "@/lib/constants";

export const metadata = {
  title: "Health & Hygiene — F&C Fresh Proteins & More",
  description:
    "Every step of F&C's sourcing, cleaning, packaging and cold-chain process, explained — the hygiene standard behind every pack we sell.",
};

const steps = [
  {
    icon: "Sprout",
    label: "Farm",
    detail:
      "Sourced directly from vetted farms and fishing partners — no anonymous middle-market suppliers in between.",
  },
  {
    icon: "ClipboardCheck",
    label: "Inspection",
    detail:
      "Every incoming batch is checked for colour, texture, smell and temperature before it's accepted into the store.",
  },
  {
    icon: "Droplets",
    label: "Cleaning",
    detail:
      "Cutting boards, knives and counters are sanitized before the first order of the day, and between batches.",
  },
  {
    icon: "Package",
    label: "Packaging",
    detail:
      "Cut and packed to order in small batches, sealed in leak-proof, vacuum-sealed packaging within minutes.",
  },
  {
    icon: "Snowflake",
    label: "Cold Chain",
    detail:
      "Held at 0-4°C from the moment it's packed, through delivery bikes and insulated boxes, to your fridge.",
  },
  {
    icon: "Store",
    label: "Store",
    detail:
      "Temperature logs checked multiple times a day. Anything that breaks cold chain is pulled, never discounted and sold.",
  },
  {
    icon: "Smile",
    label: "Customer",
    detail:
      "Delivered or handed over still cold to the touch — the same standard whether you're two minutes or two hours away.",
  },
];

const practices = [
  {
    icon: "ShieldCheck",
    title: "Daily sanitation routine",
    detail:
      "A full cleaning pass on every surface, tool and chiller happens before the shutters go up each morning — not just at closing time.",
  },
  {
    icon: "Thermometer",
    title: "Temperature discipline",
    detail:
      "Chillers are held at 0-4°C and logged multiple times a day. Frozen stock stays at -18°C with no gaps in between.",
  },
  {
    icon: "Users",
    title: "Trained counter staff",
    detail:
      "Aprons, gloves and hairnets are baseline, not optional. Every team member is trained on our hygiene checklist before they touch a single order.",
  },
  {
    icon: "Recycle",
    title: "Waste and pest control",
    detail:
      "Scheduled pest control and strict waste segregation — the unglamorous checks that matter most in a category built on freshness.",
  },
];

export default function HealthHygienePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-offwhite">
        <div className="bg-charcoal text-white py-14 sm:py-20">
          <Container>
            <Reveal>
              <p className="font-body text-xs sm:text-sm font-semibold uppercase tracking-wider text-fnc-red mb-3">
                Health &amp; Hygiene
              </p>
              <h1 className="font-display text-hero sm:text-hero-lg font-extrabold tracking-tight max-w-3xl">
                From farm to your table, every step accounted for.
              </h1>
              <p className="font-body text-body-lg text-white/70 mt-5 max-w-2xl">
                Freshness isn&apos;t a claim we print on packaging — it&apos;s a
                routine we repeat without exception, every single day.
              </p>
            </Reveal>
          </Container>
        </div>

        {/* Process flow */}
        <Section background="offwhite" spacing="md">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="font-body text-xs sm:text-sm font-extrabold uppercase tracking-wider text-fnc-red mb-3">
              Our Process
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal leading-[1.1]">
              Seven checkpoints, before your order ever reaches you.
            </h2>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="hidden lg:block absolute top-10 left-10 right-10 h-0.5 bg-bordergray" />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-y-10 gap-x-6">
              {steps.map((step, i) => {
                const Icon = icons[step.icon];
                return (
                  <Reveal
                    key={step.label}
                    delay={i * 0.06}
                    className="relative flex flex-col items-center text-center gap-3"
                  >
                    <div className="relative z-10 h-20 w-20 rounded-full bg-white border-2 border-bordergray flex items-center justify-center text-fnc-red shadow-sm shrink-0">
                      {Icon && <Icon className="h-9 w-9" strokeWidth={2.25} />}
                    </div>
                    <p className="font-body text-base font-bold text-charcoal">
                      {step.label}
                    </p>
                    <p className="font-body text-xs text-slate leading-relaxed max-w-40">
                      {step.detail}
                    </p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Detailed practices */}
        <Section background="warmwhite" spacing="md">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="font-body text-xs sm:text-sm font-extrabold uppercase tracking-wider text-fnc-red mb-3">
              Behind the Counter
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal leading-[1.1]">
              The routines you don&apos;t see, but benefit from.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            {practices.map((item, i) => {
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

        {/* Trust badges */}
        <Section background="offwhite" spacing="md">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {TRUST_BADGES.map((badge, i) => {
              const Icon = icons[badge.icon];
              return (
                <Reveal
                  key={badge.label}
                  delay={i * 0.05}
                  className="inline-flex items-center gap-2.5 rounded-full border border-bordergray bg-white px-5 py-3"
                >
                  {Icon && <Icon className="h-4.5 w-4.5 text-fnc-red" />}
                  <span className="font-body text-sm font-semibold text-charcoal">
                    {badge.label}
                  </span>
                </Reveal>
              );
            })}
          </div>
        </Section>

        <Section background="warmwhite" spacing="md">
          <Reveal className="text-center max-w-xl mx-auto flex flex-col items-center gap-5">
            <h2 className="font-display text-section-heading font-bold text-charcoal">
              See our quality standards in detail.
            </h2>
            <p className="font-body text-body text-slate">
              Our hygiene routine is one half of the story — our quality
              standards page covers how we grade and check every batch.
            </p>
            <Button href="/quality" size="lg">
              Our Quality Standards
            </Button>
          </Reveal>
        </Section>
      </main>
      <Footer />
    </>
  );
}
