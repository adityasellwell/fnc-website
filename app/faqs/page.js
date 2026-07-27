import { ChevronDown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: "FAQs",
  description: "Answers to common questions about ordering, delivery, freshness and hygiene at F&C.",
};

const faqs = [
  {
    q: "How fresh are the fish, chicken and other proteins?",
    a: "Everything is cut and packed in-store daily — nothing sits in cold storage for days before it reaches you. Perishables are best used within 1-2 days of delivery, or frozen for longer storage as noted on each product page.",
  },
  {
    q: "How do I place an order?",
    a: "Browse products on the Shop page, add what you need to your cart, then checkout directly over WhatsApp — our team confirms availability, exact total and delivery time with you personally before dispatch.",
  },
  {
    q: "What are your delivery areas and timings?",
    a: "We currently deliver in and around Hiranandani Estate, Thane West. Same-day delivery is available for orders placed before the cutoff time confirmed on WhatsApp. Visit our Store Locator page for exact coverage.",
  },
  {
    q: "Is your packaging hygienic and cold-chain maintained?",
    a: "Yes — every order is vacuum-sealed or leak-proof packed and kept cold-chain from our counter to your door. See our Health & Hygiene page for the full process.",
  },
  {
    q: "What if something arrives damaged or not fresh?",
    a: "Message us on WhatsApp with a photo within a few hours of delivery and we'll sort a replacement or refund — no long forms, no back-and-forth.",
  },
  {
    q: "Do you offer pickup instead of delivery?",
    a: "Yes, pickup is available at our Thane West store during opening hours. Choose pickup when confirming your order on WhatsApp.",
  },
  {
    q: "How can I open an F&C franchise in my city?",
    a: "We're actively expanding. Visit our Franchise page for the overview, or request our full brochure for investment and support details.",
  },
];

export default function FAQsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Section background="offwhite" spacing="md">
          <div className="max-w-2xl mb-10">
            <p className="font-body text-sm font-medium uppercase tracking-wider text-fnc-red mb-3">
              Support
            </p>
            <h1 className="font-display text-section-heading font-bold text-charcoal">
              Frequently Asked Questions
            </h1>
          </div>

          <div className="max-w-3xl flex flex-col divide-y divide-bordergray border-t border-b border-bordergray">
            {faqs.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <span className="font-display text-base sm:text-lg font-semibold text-charcoal">
                    {item.q}
                  </span>
                  <ChevronDown className="h-5 w-5 text-slate shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="font-body text-sm sm:text-base text-slate mt-3 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <p className="font-body text-sm text-slate mt-8">
            Still have a question?{" "}
            <a href={`mailto:${BRAND.email}`} className="text-fnc-red font-semibold hover:underline">
              Email us
            </a>{" "}
            or reach out on{" "}
            <a
              href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fnc-red font-semibold hover:underline"
            >
              WhatsApp
            </a>
            .
          </p>
        </Section>
      </main>
      <Footer />
    </>
  );
}
