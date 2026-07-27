import { Bricolage_Grotesque, Inter } from "next/font/google";
import SmoothScrollProvider from "@/components/motion/SmoothScrollProvider";
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
    "Premium, hygienically sourced fish, chicken, crab, eggs and ready-to-cook proteins. Fresh Proteins & More.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col bg-offwhite text-charcoal overflow-x-hidden">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
