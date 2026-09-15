import type { Metadata } from "next";
import "./globals.css";
import SessionContext from "@/context/SessionContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import NextTopLoader from "nextjs-toploader";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Flipzone",
    template: "%s | Flipzone",
  },
  description:
    "Flipzone — browse products, compare prices, and shop with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionContext>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextTopLoader />
            <Navbar />
            <main className="min-h-[80vh] bg-background">{children}</main>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </SessionContext>
  );
}
