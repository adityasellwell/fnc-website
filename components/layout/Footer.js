import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Clock, MapPin } from "lucide-react";
import Container from "./Container";
import SocialIcon from "@/components/ui/SocialIcon";
import { BRAND, FOOTER_LINKS } from "@/lib/constants";
import { getActiveStores } from "@/lib/data/stores";
import { getSettings } from "@/services/settings";

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="font-body text-base font-bold text-charcoal mb-4">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-body text-base font-bold text-slate hover:text-fnc-red transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function Footer() {
  const [store, settings] = await Promise.all([
    getActiveStores().then((stores) => stores[0]),
    getSettings(),
  ]);
  const contactPhone = settings?.businessInfo?.phone || BRAND.phone;
  const contactEmail = settings?.businessInfo?.email || BRAND.email;

  return (
    <footer className="bg-warmwhite border-t border-bordergray">
      <Container className="py-section-sm">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <Link href="/" className="flex items-center mb-5">
              <Image
                src={BRAND.logo}
                alt={`${BRAND.fullName} logo`}
                width={160}
                height={160}
                className="h-28 w-32 object-contain"
              />
            </Link>
            <p className="font-body text-lg font-bold text-charcoal max-w-xs leading-snug">
              {BRAND.tagline} — premium, hygienically sourced fish, chicken,
              crab and eggs.
            </p>

            {store && (
              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={store.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2.5 font-body text-base font-bold text-charcoal hover:text-fnc-red transition-colors w-fit leading-snug"
                >
                  <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-fnc-red" />
                  <span>{store.address}, {store.city}, {store.state}</span>
                </a>
                <span className="inline-flex items-center gap-2.5 font-body text-base font-bold text-charcoal leading-snug">
                  <Clock className="h-5 w-5 text-fnc-green shrink-0" />
                  <span>Open today · {store.openingHours.mon}</span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-4 mt-6">
              {["Instagram", "Facebook"].map((label) => (
                <a
                  key={label}
                  href={`https://${label.toLowerCase()}.com`}
                  aria-label={label}
                  className="h-11 w-11 flex items-center justify-center rounded-full border-2 border-bordergray text-charcoal hover:border-fnc-red hover:text-fnc-red transition-colors bg-white shadow-xs"
                >
                  <SocialIcon name={label} className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Shop" links={FOOTER_LINKS.shop} />
          <FooterColumn title="Company" links={FOOTER_LINKS.company} />
          <FooterColumn title="Support" links={FOOTER_LINKS.support} />
        </div>

        <div className="mt-12 pt-8 border-t border-bordergray flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-body text-sm font-bold text-charcoal">
            © {new Date().getFullYear()} {BRAND.fullName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center gap-2 font-body text-sm font-bold text-charcoal hover:text-fnc-red transition-colors"
            >
              <Phone className="h-4.5 w-4.5 text-fnc-red" />
              {contactPhone}
            </a>
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2 font-body text-sm font-bold text-charcoal hover:text-fnc-red transition-colors"
            >
              <Mail className="h-4.5 w-4.5 text-fnc-red" />
              {contactEmail}
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
