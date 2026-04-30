import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "DevHub | Modular Developer Tools",
  description: "A fast, modern hub for developer tools. JSON formatting, encoding, and more.",
  keywords: ["developer tools", "JSON formatter", "dev tools hub", "web tools"],
  openGraph: {
    title: "DevHub | Developer Tools Hub",
    description: "The ultimate developer utility belt.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevHub",
    description: "Modular tools for developers.",
  },
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${mono.variable} font-sans antialiased bg-[#0F0F0F] text-[#E0E0E0] min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
