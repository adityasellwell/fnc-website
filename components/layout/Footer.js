import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Clock, MapPin } from "lucide-react";
import Container from "./Container";
import SocialIcon from "@/components/ui/SocialIcon";
import { BRAND, FOOTER_LINKS } from "@/lib/constants";
import { getActiveStores } from "@/lib/data/stores";

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="font-body text-sm font-semibold text-charcoal mb-4">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-body text-sm text-slate hover:text-fnc-red transition-colors"
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
  const [store] = await getActiveStores();

  return (
    <footer className="bg-warmwhite border-t border-bordergray">
      <Container className="py-section-sm">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <Link href="/" className="flex items-center mb-5">
              <Image
                src={BRAND.logo}
                alt={`${BRAND.fullName} logo`}
                width={80}
                height={80}
                className="h-16 w-16 object-contain"
              />
            </Link>
            <p className="font-body text-base text-slate max-w-xs">
              {BRAND.tagline} — premium, hygienically sourced fish, chicken,
              crab and eggs.
            </p>

            {store && (
              <div className="mt-5 flex flex-col gap-2">
                <a
                  href={store.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-1.5 font-body text-xs text-slate hover:text-fnc-red transition-colors w-fit"
                >
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  {store.address}, {store.city}, {store.state}
                </a>
                <span className="inline-flex items-center gap-1.5 font-body text-xs text-slate">
                  <Clock className="h-3.5 w-3.5" />
                  Open today · {store.openingHours.mon}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 mt-5">
              {["Instagram", "Facebook"].map((label) => (
                <a
                  key={label}
                  href={`https://${label.toLowerCase()}.com`}
                  aria-label={label}
                  className="h-9 w-9 flex items-center justify-center rounded-full border border-bordergray text-charcoal hover:border-fnc-red hover:text-fnc-red transition-colors"
                >
                  <SocialIcon name={label} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Shop" links={FOOTER_LINKS.shop} />
          <FooterColumn title="Company" links={FOOTER_LINKS.company} />
          <FooterColumn title="Support" links={FOOTER_LINKS.support} />
        </div>

        <div className="mt-10 pt-6 border-t border-bordergray flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-body text-xs text-slate">
            © {new Date().getFullYear()} {BRAND.fullName}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-5">
            <a
              href={`tel:${BRAND.phone}`}
              className="flex items-center gap-1.5 font-body text-xs text-slate hover:text-fnc-red transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              {BRAND.phone}
            </a>
            <a
              href={`mailto:${BRAND.email}`}
              className="flex items-center gap-1.5 font-body text-xs text-slate hover:text-fnc-red transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              {BRAND.email}
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
