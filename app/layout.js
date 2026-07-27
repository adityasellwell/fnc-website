import { Bricolage_Grotesque, Inter } from "next/font/google";
import SmoothScrollProvider from "@/components/motion/SmoothScrollProvider";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "F&C — Fresh Proteins & More",
    template: "%s | F&C — Fresh Proteins & More",
  },
  description:
    "Premium, hygienically sourced fish, chicken, crab, eggs and ready-to-cook proteins. Delivered fresh to your door.",
  keywords: ["fresh fish", "chicken", "crab", "proteins", "Thane", "F&C"],
  icons: {
    icon: [
      { url: "/images/fnc-logo.jpg", type: "image/jpeg" },
    ],
    apple: "/images/fnc-logo.jpg",
    shortcut: "/images/fnc-logo.jpg",
  },
  openGraph: {
    title: "F&C — Fresh Proteins & More",
    description:
      "Premium, hygienically sourced fish, chicken, crab, eggs and ready-to-cook proteins.",
    url: "https://fncmumbai.com",
    siteName: "F&C Fresh Proteins",
    images: [{ url: "/images/fnc-logo.jpg", width: 1024, height: 1024 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "F&C — Fresh Proteins & More",
    description: "Premium, hygienically sourced fish, chicken, crab, eggs.",
    images: ["/images/fnc-logo.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col bg-offwhite text-charcoal overflow-x-hidden pb-16 lg:pb-0">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <MobileBottomNav />
      </body>
    </html>
  );
}
