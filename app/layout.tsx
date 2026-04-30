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
  title: {
    default: "Developer OS | Professional Developer Utilities",
    template: "%s | Developer OS"
  },
  description: "A comprehensive suite of browser-based utilities for developers: Diff tools, Regex testers, Markdown previews, and data converters. All processing occurs locally in your browser for maximum security.",
  keywords: ["developer tools", "regex tester", "markdown preview", "json formatter", "diff checker", "base64 encoder", "yaml validator"],
  authors: [{ name: "Developer OS" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ais-pre-ux363wemzkx62lhysnmjdz-842599029511.run.app",
    siteName: "Developer OS",
    title: "Developer OS | The Unified Tool Hub",
    description: "Browser-based tools for modern development workflows.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer OS | Developer Utilities",
    description: "Modular tools for developers with no tracking.",
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>',
  },
  robots: "index, follow",
};

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next";

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
          <TooltipProvider>
            {children}
            <Toaster position="top-right" richColors />
            <Analytics />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
