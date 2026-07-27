import Link from "next/link";
import { User, Heart, Package, MapPin, MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: "My Account",
  description: "Manage your F&C orders, addresses and wishlist.",
};

const upcoming = [
  { icon: Package, label: "Order History", detail: "Track and reorder your past purchases." },
  { icon: MapPin, label: "Saved Addresses", detail: "Save home, work and other delivery spots." },
];

export default function AccountPage() {
  const digits = BRAND.whatsapp.replace(/\D/g, "");

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Section background="offwhite" spacing="md">
          <h1 className="font-display text-section-heading font-bold text-charcoal mb-8">
            My Account
          </h1>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 bg-white border border-bordergray rounded-3xl p-8 flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-fnc-red/10 flex items-center justify-center">
                <User className="h-7 w-7 text-fnc-red" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-charcoal">
                  Accounts &amp; order tracking are launching soon
                </p>
                <p className="font-body text-sm text-slate mt-1.5 max-w-sm">
                  For now, orders are confirmed and tracked directly over WhatsApp —
                  message us any time for order status, past orders, or delivery changes.
                </p>
              </div>
              <Button href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" size="lg" className="mt-2">
                <MessageCircle className="h-5 w-5" />
                Chat with F&amp;C on WhatsApp
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/wishlist"
                className="flex items-center gap-4 bg-white border border-bordergray rounded-2xl p-5 hover:border-fnc-red transition-colors"
              >
                <div className="h-11 w-11 shrink-0 rounded-full bg-fnc-red/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-fnc-red" />
                </div>
                <div>
                  <p className="font-display font-semibold text-charcoal">Your Wishlist</p>
                  <p className="font-body text-xs text-slate">Saved products, ready to order</p>
                </div>
              </Link>

              {upcoming.map(({ icon: Icon, label, detail }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 bg-white border border-bordergray rounded-2xl p-5 opacity-60"
                >
                  <div className="h-11 w-11 shrink-0 rounded-full bg-warmwhite flex items-center justify-center">
                    <Icon className="h-5 w-5 text-slate" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-charcoal">{label}</p>
                    <p className="font-body text-xs text-slate">{detail} — coming soon</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
