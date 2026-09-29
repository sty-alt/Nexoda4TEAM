import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import type { Locale } from "@/i18n/messages";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexoda4TEAM | Team workspace",
  description:
    "Nexoda4TEAM brings projects, tasks, documents, planning, and team communication into one workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const savedLocale = cookies().get("nexoda_locale")?.value;
  const browserLocale = headers().get("accept-language")?.split(",")[0]?.split("-")[0];
  const locale: Locale = savedLocale === "ru" || (!savedLocale && browserLocale === "ru") ? "ru" : "en";

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  );
}

