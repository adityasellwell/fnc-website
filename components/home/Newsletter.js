import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";

/**
 * Visual signup band — no email backend wired yet (that's Phase 6+
 * territory per the roadmap), so the form doesn't submit anywhere real
 * yet. Structure is ready for that wiring later.
 */
export default function Newsletter() {
  return (
    <Section background="warmwhite" spacing="sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-charcoal">
            Recipes, offers and store launches — straight to your inbox.
          </h2>
          <p className="font-body text-base text-slate mt-2">
            No spam. Unsubscribe anytime.
          </p>
        </div>

        <form className="flex flex-col sm:flex-row w-full max-w-md gap-3">
          <input
            type="email"
            required
            placeholder="you@email.com"
            className="min-w-0 flex-1 h-12 rounded-full border border-bordergray bg-white px-5 font-body text-base text-charcoal placeholder:text-slate focus:outline-none focus:border-fnc-red"
          />
          <Button type="submit" size="md" className="shrink-0">
            Subscribe
          </Button>
        </form>
      </div>
    </Section>
  );
}
