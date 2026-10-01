import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Manrope } from "next/font/google";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site-config";
import { getLocale } from "@/lib/i18n/locale";

const sans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const display = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Vireon",
    "quản lý trường học",
    "quản lý lưu xá",
    "ERP",
    "Business Intelligence",
    "chuyển đổi số",
    "Paul Digital Hub",
    "app portal",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10243e",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  sameAs: [
    "https://www.youtube.com/@Technical_Solution_ERP",
    "https://www.linkedin.com/in/nghia-nguyen-790108139/",
    "https://www.facebook.com/nghia.nguyennhuu.3",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <head>
        {/* Root-relative on purpose: metadataBase would otherwise resolve
            this against the production domain, breaking the favicon on
            localhost or any preview deploy. */}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className={`${sans.variable} ${display.variable}`}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
