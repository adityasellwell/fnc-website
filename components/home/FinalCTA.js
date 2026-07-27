"use client";

import { motion, useReducedMotion } from "framer-motion";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { MapPin, ShoppingBag, MessageCircle, Building2 } from "lucide-react";
import { BRAND } from "@/lib/constants";

function whatsAppLink(phone, message) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

const CARDS = [
  {
    id: "shop",
    icon: ShoppingBag,
    iconBg: "bg-fnc-red/10",
    iconColor: "text-fnc-red",
    title: "Shop Fresh Online",
    body: "Browse our fresh-cut fish, chicken, eggs, and ready-to-eat meals.",
    cta: { label: "Shop Fresh Today", href: "/shop", variant: "primary" },
    hoverBorder: "hover:border-fnc-red",
    dark: false,
  },
  {
    id: "store",
    icon: MapPin,
    iconBg: "bg-fnc-blue/10",
    iconColor: "text-fnc-blue",
    title: "Visit Our Store",
    body: "Stop by our flagship store in Hiranandani Estate, Thane to buy fresh.",
    cta: { label: "Visit Store", href: "/stores", variant: "outline" },
    hoverBorder: "hover:border-fnc-red",
    dark: false,
  },
  {
    id: "whatsapp",
    icon: MessageCircle,
    iconBg: "bg-fnc-green/10",
    iconColor: "text-fnc-green",
    title: "Quick WhatsApp Order",
    body: "Order directly via WhatsApp for lightning-fast support and checkout.",
    cta: {
      label: "Order on WhatsApp",
      href: whatsAppLink(BRAND.whatsapp, "Hi! I'd like to place an order."),
      variant: "outline",
      target: "_blank",
      rel: "noopener noreferrer",
      className: "border-bordergray hover:border-fnc-green hover:bg-fnc-green/5 text-charcoal",
    },
    hoverBorder: "hover:border-fnc-green",
    dark: false,
  },
  {
    id: "franchise",
    icon: Building2,
    iconBg: "bg-fnc-red/20",
    iconColor: "text-fnc-red",
    title: "Become a Franchise Partner",
    body: "Bring F&C's highly successful and hygienic protein model to your city.",
    cta: { label: "Franchise Partner", href: "/franchise", variant: "primary" },
    hoverBorder: "hover:border-fnc-red",
    dark: true,
  },
];

/**
 * Final CTA — enhanced with:
 * - Staggered card entrance from below on scroll
 * - Card hover lift + glowing border transition
 * - Icon container spring scale on card hover
 */
export default function FinalCTA() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Section background="warmwhite" spacing="md">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-2xl mx-auto mb-10"
      >
        <p className="font-body text-xs sm:text-sm font-semibold uppercase tracking-wider text-fnc-red mb-2">
          Get Started
        </p>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal">
          Ready to experience fresh proteins?
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={
                shouldReduceMotion
                  ? {}
                  : { y: -6, transition: { duration: 0.22 } }
              }
              className={`group flex flex-col gap-4 p-6 rounded-2xl border shadow-xs justify-between transition-all duration-300 ${
                card.dark
                  ? "bg-charcoal border-transparent text-white hover:border-fnc-red"
                  : `bg-white border-bordergray ${card.hoverBorder} hover:shadow-lg`
              }`}
            >
              <div className="flex flex-col gap-3">
                {/* Icon with spring scale on group hover */}
                <motion.div
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          scale: 1.12,
                          transition: { type: "spring", stiffness: 300, damping: 16 },
                        }
                  }
                  className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg} ${card.iconColor}`}
                >
                  <Icon className="h-6 w-6" />
                </motion.div>

                <h3
                  className={`font-display text-lg font-bold ${
                    card.dark ? "text-white" : "text-charcoal"
                  }`}
                >
                  {card.title}
                </h3>
                <p
                  className={`font-body text-sm ${
                    card.dark ? "text-white/70" : "text-slate"
                  }`}
                >
                  {card.body}
                </p>
              </div>

              <Button
                href={card.cta.href}
                variant={card.cta.variant}
                size="sm"
                className={`w-full ${card.cta.className ?? ""}`}
                {...(card.cta.target ? { target: card.cta.target } : {})}
                {...(card.cta.rel ? { rel: card.cta.rel } : {})}
              >
                {card.cta.label}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
