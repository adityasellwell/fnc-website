import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/data/blog";
import { BRAND } from "@/lib/constants";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} — F&C Journal`,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  // Falls back to an empty list if the DB isn't reachable at build time
  // (see the identical comment on app/product/[slug]/page.js for why).
  try {
    const posts = await getBlogPosts();
    return posts.map((p) => ({ slug: p.slug }));
  } catch (error) {
    console.warn("generateStaticParams(/blog/[slug]) skipped — DB unreachable at build time:", error.message);
    return [];
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const paragraphs = post.content.split("\n\n").filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.publishedAt,
    author: {
      "@type": "Organization",
      name: BRAND.fullName,
    },
    publisher: {
      "@type": "Organization",
      name: BRAND.fullName,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1 bg-offwhite">
        <div className="border-b border-bordergray bg-white py-4">
          <Container>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-body text-sm font-semibold text-slate hover:text-fnc-red transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to the journal
            </Link>
          </Container>
        </div>

        <Section background="offwhite" spacing="md">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-body text-xs font-semibold text-fnc-red bg-fnc-red/10 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="font-display text-section-heading sm:text-section-heading-lg font-bold text-charcoal leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center gap-2 font-body text-sm text-slate mt-4">
                <CalendarDays className="h-4 w-4" />
                {formatDate(post.publishedAt)}
              </div>
            </Reveal>

            <Reveal
              delay={0.08}
              className="relative aspect-16/9 w-full rounded-3xl overflow-hidden bg-warmwhite border border-bordergray mt-8"
            >
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
                priority
              />
            </Reveal>

            <Reveal delay={0.14} className="flex flex-col gap-5 mt-10">
              {paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className="font-body text-body-lg text-charcoal/85 leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>

            <Reveal
              delay={0.2}
              className="flex flex-wrap gap-4 mt-12 pt-8 border-t border-bordergray"
            >
              <Button href="/blog" size="lg" variant="outline">
                More from the Journal
              </Button>
              <Button href="/shop" size="lg">
                Shop Fresh Today
              </Button>
            </Reveal>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
