import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VEYROVA — All Products. All For You.",
    template: "%s | VEYROVA",
  },
  description:
    "VEYROVA - Your premium destination for quality products. Shop phone cases, electronics, fashion, home & kitchen, beauty, fitness, and gifts. Fast delivery, best quality, trusted service.",
  keywords: [
    "VEYROVA",
    "online shopping",
    "phone cases",
    "electronics",
    "fashion",
    "home and kitchen",
    "beauty",
    "fitness",
    "gifts",
    "best deals",
    "fast delivery",
  ],
  openGraph: {
    title: "VEYROVA — All Products. All For You.",
    description:
      "Your premium destination for quality products. Shop • Discover • Enjoy",
    siteName: "VEYROVA",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "VEYROVA — All Products. All For You.",
    description:
      "Your premium destination for quality products. Shop • Discover • Enjoy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-sans)" }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
