import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Reveal from "@/components/motion/Reveal";
import ContactForm from "@/components/contact/ContactForm";
import { BRAND, CURRENT_LOCATION } from "@/lib/constants";

export const metadata = {
  title: "Contact Us — F&C Fresh Proteins & More",
  description:
    "Get in touch with F&C — call, WhatsApp, email, or send us a message directly. We're happy to help with orders, stores, or franchise queries.",
};

function whatsAppLink(phone, message) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

const contactMethods = [
  {
    icon: Phone,
    label: "Call us",
    value: BRAND.phone,
    href: `tel:${BRAND.phone.replace(/\s+/g, "")}`,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: BRAND.whatsapp,
    href: whatsAppLink(BRAND.whatsapp, "Hi! I have a question about F&C."),
  },
  {
    icon: Mail,
    label: "Email us",
    value: BRAND.email,
    href: `mailto:${BRAND.email}`,
  },
  {
    icon: MapPin,
    label: "Visit us",
    value: CURRENT_LOCATION.fullLabel,
    href: "/stores",
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-offwhite">
        <div className="bg-charcoal text-white py-12 sm:py-16">
          <Container>
            <p className="font-body text-xs sm:text-sm font-semibold uppercase tracking-wider text-fnc-red mb-3">
              Get In Touch
            </p>
            <h1 className="font-display text-hero sm:text-section-heading-lg font-extrabold tracking-tight max-w-xl">
              We&apos;d love to hear from you.
            </h1>
            <p className="font-body text-body text-white/70 mt-3 max-w-xl">
              Questions about an order, a store, or a franchise opportunity —
              reach us however&apos;s easiest.
            </p>
          </Container>
        </div>

        <Section background="offwhite" spacing="md">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16">
            <Reveal className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {contactMethods.map((method) => (
                  <a
                    key={method.label}
                    href={method.href}
                    target={method.href.startsWith("http") ? "_blank" : undefined}
                    rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-4 bg-white border border-bordergray rounded-2xl p-5 hover:border-fnc-red transition-colors group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-fnc-red/10 flex items-center justify-center text-fnc-red shrink-0">
                      <method.icon className="h-5.5 w-5.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-body text-xs font-semibold uppercase tracking-wide text-slate">
                        {method.label}
                      </p>
                      <p className="font-body text-base font-bold text-charcoal truncate">
                        {method.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>

              <div className="flex items-start gap-3 bg-warmwhite border border-bordergray rounded-2xl p-5">
                <Clock className="h-5 w-5 text-fnc-red shrink-0 mt-0.5" />
                <p className="font-body text-sm text-slate">
                  Our support team typically responds within a few hours
                  during store hours, 7:00 AM – 9:00 PM, every day.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="bg-white border border-bordergray rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-bold text-charcoal mb-1">
                Send us a message
              </h2>
              <p className="font-body text-sm text-slate mb-6">
                Fill in the form and we&apos;ll get back to you shortly.
              </p>
              <ContactForm />
            </Reveal>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
