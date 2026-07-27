import { icons } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";

export const metadata = {
  title: "Quality Standards — F&C Fresh Proteins & More",
  description:
    "How F&C grades sourcing, tests every batch, and holds itself to a consistent quality standard across fish, chicken, crab and eggs.",
};

const standards = [
  {
    icon: "Award",
    title: "Graded sourcing",
    detail:
      "We work with a short list of vetted farms and fishing partners, chosen on consistency, not just price — and reviewed regularly against our own standard.",
  },
  {
    icon: "Scale",
    title: "Batch-level checks",
    detail:
      "Every incoming batch is weighed, inspected for colour, texture and smell, and logged before it's accepted into any store.",
  },
  {
    icon: "Thermometer",
    title: "Cold-chain verification",
    detail:
      "Chillers and freezers are logged multiple times a day. Anything that breaks the 0-4°C (chilled) or -18°C (frozen) threshold is pulled, not sold at a discount.",
  },
  {
    icon: "ScissorsLineDashed",
    title: "Expert butchery",
    detail:
      "Cuts are made by trained hands to a consistent spec, so a curry-cut chicken or fillet looks and cooks the same, order after order.",
  },
  {
    icon: "PackageCheck",
    title: "Leak-proof packaging",
    detail:
      "Vacuum-sealed, leak-proof packs protect both freshness and hygiene in transit — no exposed cuts, no cross-contamination risk.",
  },
  {
    icon: "MessageSquareWarning",
    title: "Customer feedback loop",
    detail:
      "Every quality complaint is tracked back to its batch and supplier — recurring issues lead to a supplier being paused, not excused.",
  },
];

const commitments = [
  "No protein sits pre-cut and exposed for hours before sale — everything is cut and packed close to order.",
  "No batch that fails an inspection check is quietly sold at a discount instead of being pulled.",
  "No cold-chain gap is treated as acceptable, regardless of how short.",
  "No supplier stays on our list without meeting our standard, regardless of how long they've supplied us.",
];

export default function QualityPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-offwhite">
        <div className="bg-charcoal text-white py-14 sm:py-20">
          <Container>
            <Reveal>
              <p className="font-body text-xs sm:text-sm font-semibold uppercase tracking-wider text-fnc-red mb-3">
                Quality Standards
              </p>
              <h1 className="font-display text-hero sm:text-hero-lg font-extrabold tracking-tight max-w-3xl">
                Quality you can verify, not just take our word for.
              </h1>
              <p className="font-body text-body-lg text-white/70 mt-5 max-w-2xl">
                Consistency is the hardest thing to promise in fresh protein
                retail. Here&apos;s exactly how we hold ourselves to it, batch
                after batch.
              </p>
            </Reveal>
          </Container>
        </div>

        <Section background="offwhite" spacing="md">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="font-body text-xs sm:text-sm font-extrabold uppercase tracking-wider text-fnc-red mb-3">
              How We Check
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal leading-[1.1]">
              Six checks that run on every batch, every day.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {standards.map((item, i) => {
              const Icon = icons[item.icon];
              return (
                <Reveal
                  key={item.title}
                  delay={i * 0.06}
                  className="bg-white border border-bordergray rounded-3xl p-8 flex flex-col items-center text-center gap-4 shadow-xs"
                >
                  <div className="h-14 w-14 rounded-2xl bg-fnc-green/10 flex items-center justify-center text-fnc-green shrink-0">
                    {Icon && <Icon className="h-7 w-7" strokeWidth={2.25} />}
                  </div>
                  <div className="flex flex-col gap-1.5">
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

        <Section background="warmwhite" spacing="md">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Reveal className="flex flex-col gap-4">
              <p className="font-body text-xs sm:text-sm font-extrabold uppercase tracking-wider text-fnc-red">
                Our Commitments
              </p>
              <h2 className="font-display text-section-heading font-bold text-charcoal">
                A standard we hold even when it costs us.
              </h2>
              <p className="font-body text-body text-slate">
                Quality standards only mean something if they still apply
                when they&apos;re inconvenient. These are the lines we don&apos;t
                cross, even under pressure to move faster or cut costs.
              </p>
            </Reveal>
            <Reveal delay={0.08} className="flex flex-col gap-4">
              {commitments.map((line) => (
                <div
                  key={line}
                  className="flex items-start gap-3 bg-white border border-bordergray rounded-2xl p-5"
                >
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-fnc-red shrink-0" />
                  <p className="font-body text-sm sm:text-base text-charcoal leading-relaxed">
                    {line}
                  </p>
                </div>
              ))}
            </Reveal>
          </div>
        </Section>

        <Section background="offwhite" spacing="md">
          <Reveal className="text-center max-w-xl mx-auto flex flex-col items-center gap-5">
            <h2 className="font-display text-section-heading font-bold text-charcoal">
              Curious how we handle hygiene day to day?
            </h2>
            <p className="font-body text-body text-slate">
              Our health &amp; hygiene page walks through the full process,
              from farm to your table.
            </p>
            <Button href="/health-hygiene" size="lg">
              Health &amp; Hygiene
            </Button>
          </Reveal>
        </Section>
      </main>
      <Footer />
    </>
  );
}
