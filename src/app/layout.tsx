import type { Metadata } from "next";
// import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";

import Header from "@/components/Header";

// const poppins = Poppins({
//   variable: "--font-poppin-sans",
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Dating DNA - Discover Your Relationship Style",
  description:
    "Take the Dating DNA assessment to discover your unique relationship approach and get personalized insights for better dating and relationships.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="My Dating" />
      </head>
      <body className={`antialiased`}>
        <Toaster position="bottom-center" />
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
