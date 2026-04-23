import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Merriweather, Source_Serif_4 } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ScreenSizeIndicator } from "@/components/ui/screen-size-indicator";
import { cn } from "@/lib/utils";

const sourceSerif4Heading = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-heading",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://recomendados.vercel.app"),
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
    url: "/",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ddd490" },
    { media: "(prefers-color-scheme: dark)", color: "#454230" },
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
        jetbrainsMono.variable,
        merriweather.variable,
        sourceSerif4Heading.variable,
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
