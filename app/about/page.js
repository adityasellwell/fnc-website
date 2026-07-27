import Link from "next/link";
import Image from "next/image";
import { icons } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import { BRAND, WHY_CHOOSE_FC, FRANCHISE_STATS, TRUST_BADGES } from "@/lib/constants";

export const metadata = {
  title: "About Us — F&C Fresh Proteins & More",
  description:
    "F&C's story — why we started, how we source and cut fresh proteins daily, and where the brand is headed next.",
};

const timeline = [
  {
    year: "The Problem",
    title: "Fresh shouldn't be a gamble",
    detail:
      "F&C started with a simple frustration — buying fish or chicken in most neighbourhood markets meant guessing at freshness, hygiene, and consistency every single time.",
  },
  {
    year: "The Format",
    title: "One store, built around discipline",
    detail:
      "Our first store in Hiranandani Estate, Thane, was built to prove a hygiene-first, cold-chain-disciplined format could work at real volume — cut fresh daily, checked in-store, never held over.",
  },
  {
    year: "Today",
    title: "A model worth repeating",
    detail:
      "With the format proven, we're now opening it up to franchise partners in new cities who care as much about the daily hygiene routine as they do about the counter footfall.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-offwhite">
        {/* Hero */}
        <div className="bg-charcoal text-white py-14 sm:py-20">
          <Container>
            <Reveal>
              <p className="font-body text-xs sm:text-sm font-semibold uppercase tracking-wider text-fnc-red mb-3">
                About F&amp;C
              </p>
              <h1 className="font-display text-hero sm:text-hero-lg font-extrabold tracking-tight max-w-3xl">
                Fresh Proteins &amp; More — done properly, every day.
              </h1>
              <p className="font-body text-body-lg text-white/70 mt-5 max-w-2xl">
                F&amp;C exists because fresh protein retail in most
                neighbourhoods runs on trust you can&apos;t verify. We built a
                format where you don&apos;t have to take our word for it.
              </p>
            </Reveal>
          </Container>
        </div>

        {/* Story */}
        <Section background="offwhite" spacing="md">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Reveal className="relative aspect-4/3 w-full rounded-3xl overflow-hidden bg-warmwhite border border-bordergray">
              <Image
                src="/images/categories/fish.jpg"
                alt="Fresh fish prepared at an F&C counter"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </Reveal>
            <Reveal delay={0.08} className="flex flex-col gap-4">
              <h2 className="font-display text-section-heading font-bold text-charcoal">
                Our story
              </h2>
              <p className="font-body text-body text-slate">
                {BRAND.fullName} was built on a straightforward belief: the
                proteins on your plate deserve the same standards you&apos;d
                expect from any other packaged, quality-checked product —
                not the informal, inconsistent experience most fresh
                markets offer.
              </p>
              <p className="font-body text-body text-slate">
                That meant rethinking the basics from the ground up —
                sourcing directly from farms and fishing partners we trust,
                cutting and packing in small batches rather than sitting on
                pre-cut stock, and holding an unbroken cold chain from our
                counter to your kitchen.
              </p>
              <p className="font-body text-body text-slate">
                One store proved the model works. Now we&apos;re growing it —
                through our own stores and through franchise partners who
                share the same standard — one city at a time.
              </p>
              <div className="flex gap-3 mt-2">
                <Button href="/shop" size="lg">
                  Shop Fresh Today
                </Button>
                <Button href="/franchise" size="lg" variant="outline">
                  Explore Franchise
                </Button>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* Timeline */}
        <Section background="warmwhite" spacing="md">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="font-body text-xs sm:text-sm font-extrabold uppercase tracking-wider text-fnc-red mb-3">
              How We Got Here
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal leading-[1.1]">
              From one frustrating trip to the market, to a format worth
              repeating.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {timeline.map((item, i) => (
              <Reveal
                key={item.title}
                delay={i * 0.08}
                className="bg-white border border-bordergray rounded-3xl p-8 flex flex-col gap-3"
              >
                <span className="font-body text-xs font-bold uppercase tracking-wider text-fnc-red">
                  {item.year}
                </span>
                <h3 className="font-display text-xl font-bold text-charcoal">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-slate leading-relaxed">
                  {item.detail}
                </p>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Why choose F&C (reused) */}
        <Section background="offwhite" spacing="md">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="font-body text-xs sm:text-sm font-extrabold uppercase tracking-wider text-fnc-red mb-3">
              What We Stand For
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal leading-[1.1]">
              The details most stores skip.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {WHY_CHOOSE_FC.map((point, i) => {
              const Icon = icons[point.icon];
              return (
                <Reveal
                  key={point.title}
                  delay={i * 0.06}
                  className="bg-white border border-bordergray rounded-3xl p-8 flex flex-col items-center text-center gap-4 shadow-xs"
                >
                  <div className="h-14 w-14 rounded-2xl bg-fnc-red/10 flex items-center justify-center text-fnc-red shrink-0">
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

        {/* Stats + trust */}
        <Section spacing="md" className="bg-charcoal text-white">
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto text-center mb-14">
            {FRANCHISE_STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.06}>
                <p className="font-display text-4xl sm:text-5xl font-bold text-fnc-red">
                  {stat.value}
                </p>
                <p className="font-body text-sm text-white/70 mt-1">
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {TRUST_BADGES.map((badge, i) => {
              const Icon = icons[badge.icon];
              return (
                <Reveal
                  key={badge.label}
                  delay={0.2 + i * 0.05}
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-5 py-3"
                >
                  {Icon && <Icon className="h-4.5 w-4.5 text-fnc-red" />}
                  <span className="font-body text-sm font-semibold text-white/90">
                    {badge.label}
                  </span>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* CTA */}
        <Section background="offwhite" spacing="md">
          <Reveal className="text-center max-w-xl mx-auto flex flex-col items-center gap-5">
            <h2 className="font-display text-section-heading font-bold text-charcoal">
              Taste the difference discipline makes.
            </h2>
            <p className="font-body text-body text-slate">
              Visit a store, shop online, or reach out if you&apos;d like to talk
              to us directly.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/stores" size="lg">
                Find a Store
              </Button>
              <Button href="/contact" size="lg" variant="outline">
                Contact Us
              </Button>
            </div>
          </Reveal>
        </Section>
      </main>
      <Footer />
    </>
  );
}
