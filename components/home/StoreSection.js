import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { getStores } from "@/lib/data/stores";
import StoreLocatorInteractive from "@/components/store/StoreLocatorInteractive";
import Reveal from "@/components/motion/Reveal";

/**
 * Store Locator Section on the homepage.
 * Renders the active store with an interactive map & geolocation. Shows a
 * coming-soon sidebar only once there's a second location to list.
 */
export default async function StoreSection() {
  const stores = await getStores();
  const active = stores.filter((s) => s.status === "active");
  const comingSoon = stores.filter((s) => s.status !== "active");
  const store = active[0];

  if (!store) return null;

  return (
    <Section background="warmwhite">
      <div className="max-w-2xl mb-10">
        <p className="font-body text-sm font-medium uppercase tracking-wider text-fnc-red mb-3">
          Visit Us
        </p>
        <h2 className="font-display text-section-heading font-bold text-charcoal">
          Visit our store, or get it delivered.
        </h2>
      </div>

      <div className={comingSoon.length > 0 ? "grid lg:grid-cols-2 gap-8 items-start" : ""}>
        {/* Interactive Map & Store Card */}
        <Reveal className={comingSoon.length === 0 ? "max-w-5xl mx-auto w-full" : ""}>
          <StoreLocatorInteractive activeStores={active} />
        </Reveal>

        {/* Coming Soon list — only rendered once there's a second location */}
        {comingSoon.length > 0 && (
          <Reveal delay={0.1} className="flex flex-col gap-4 lg:h-full justify-start">
            <h3 className="font-display text-lg sm:text-xl font-bold text-charcoal mb-1">
              Opening Soon
            </h3>
            <div className="flex flex-col gap-4">
              {comingSoon.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-4 bg-white border border-bordergray rounded-2xl p-5 shadow-sm"
                >
                  <div>
                    <p className="font-display text-base font-semibold text-charcoal">
                      {s.name}
                    </p>
                    <p className="font-body text-sm text-slate">
                      {s.city}, {s.state}
                    </p>
                  </div>
                  <span className="rounded-full bg-fnc-blue/10 text-fnc-blue font-body text-xs font-semibold px-3 py-1 shrink-0">
                    Coming Soon
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>

      {/* Button linking to the full /stores page */}
      <div className="mt-12 flex justify-center">
        <Button href="/stores" variant="outline" size="lg" className="shadow-sm">
          View Store Details
        </Button>
      </div>
    </Section>
  );
}
