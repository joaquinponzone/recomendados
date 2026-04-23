import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist_Mono, Montserrat, Raleway } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ScreenSizeIndicator } from "@/components/ui/screen-size-indicator";
import { cn } from "@/lib/utils";

const ralewayHeading = Raleway({
  subsets: ["latin"],
  variable: "--font-heading",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Recomendados",
  description:
    "Recomendaciones de películas, series y libros con votación por la comunidad.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Recomendados",
    description:
      "Recomendaciones de películas, series y libros con votación por la comunidad.",
    url: "https://recomendados.app/",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1b18" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(
        "antialiased h-100dvh",
        "font-sans",
        geistMono.variable,
        montserrat.variable,
        ralewayHeading.variable,
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <ScreenSizeIndicator />
      </body>
    </html>
  );
}
