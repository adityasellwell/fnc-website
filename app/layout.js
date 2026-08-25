import { FirebaseAuthProvider } from "@/components/auth/AuthProvider";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://fncmumbai.com"),
  title: {
    default: "F&C — Fresh Proteins & More",
    template: "%s | F&C — Fresh Proteins & More",
  },
  description:
    "Premium, hygienically sourced fish, chicken, crab, eggs and ready-to-cook proteins. Delivered fresh to your door.",
  keywords: ["fresh fish", "chicken", "crab", "proteins", "Thane", "F&C"],
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
    shortcut: "/images/logo.png",
  },
  openGraph: {
    title: "F&C — Fresh Proteins & More",
    description:
      "Premium, hygienically sourced fish, chicken, crab, eggs and ready-to-cook proteins.",
    url: "https://fncmumbai.com",
    siteName: "F&C Fresh Proteins",
    images: [{ url: "/images/logo.png", width: 1024, height: 1024 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "F&C — Fresh Proteins & More",
    description: "Premium, hygienically sourced fish, chicken, crab, eggs.",
    images: ["/images/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <FirebaseAuthProvider>
      <html
        lang="en"
        className={`${bricolage.variable} ${inter.variable} h-full antialiased overflow-x-hidden`}
      >
        <body
          className="min-h-full flex flex-col bg-offwhite text-charcoal overflow-x-hidden pb-16 lg:pb-0"
          suppressHydrationWarning
        >
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
          <MobileBottomNav />
        </body>
      </html>
    </FirebaseAuthProvider>
  );
}
