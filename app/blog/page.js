import Link from "next/link";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Card from "@/components/ui/Card";
import Reveal from "@/components/motion/Reveal";
import { getBlogPosts } from "@/lib/data/blog";

export const metadata = {
  title: "Blog — F&C Fresh Proteins & More",
  description:
    "Notes from F&C on sourcing, hygiene, franchise growth, and seasonal cooking — the thinking behind the counter, not just what's on it.",
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-offwhite">
        <div className="bg-charcoal text-white py-12 sm:py-16">
          <Container>
            <p className="font-body text-xs sm:text-sm font-semibold uppercase tracking-wider text-fnc-red mb-3">
              The F&amp;C Journal
            </p>
            <h1 className="font-display text-hero sm:text-section-heading-lg font-extrabold tracking-tight max-w-xl">
              Notes from behind the counter.
            </h1>
            <p className="font-body text-body text-white/70 mt-3 max-w-xl">
              Sourcing, hygiene, franchise growth, and the recipes we&apos;re
              cooking at home this season.
            </p>
          </Container>
        </div>

        <Section background="offwhite" spacing="md">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 0.06}>
                <Card
                  as={Link}
                  href={`/blog/${post.slug}`}
                  hoverLift
                  className="group flex flex-col h-full"
                >
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-warmwhite">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1024px) 30vw, 90vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col gap-3 p-5">
                    <div className="flex items-center gap-2 font-body text-xs text-slate">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(post.publishedAt)}
                    </div>
                    <h2 className="font-display text-lg font-semibold text-charcoal leading-snug">
                      {post.title}
                    </h2>
                    <p className="font-body text-sm text-slate line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-body text-xs font-semibold text-fnc-red bg-fnc-red/10 px-2.5 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
