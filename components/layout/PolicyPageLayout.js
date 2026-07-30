import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";

export default function PolicyPageLayout({ title, lastUpdated, children }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-offwhite">
        <Section background="offwhite" spacing="md">
          <Container className="max-w-3xl">
            <div className="border-b border-bordergray pb-6 mb-8">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-charcoal mb-2">
                {title}
              </h1>
              {lastUpdated && (
                <p className="font-body text-xs text-slate">
                  Last Updated: {lastUpdated}
                </p>
              )}
            </div>
            <div className="font-body text-base text-slate leading-relaxed flex flex-col gap-6">
              {children}
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
