import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../i18n/routing";
import "../globals.css";
import { Providers } from "../providers";
import LandscapeBlock from "../components/LandscapeBlock";
import { MotionProvider } from "../containers/MotionProvider";
import Script from "next/script";
import CookieBanner from "../components/CookieBanner";
import { LenisProvider } from "../containers/LenisProvider";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "homepage",
  });

  const title = "Sinersys — New Energy Frontiers";

  const description = t("slide0.subtitle").replace(/\n/g, " ").trim();

  const ogLocale =
    locale === "it"
      ? "it_IT"
      : locale === "en"
      ? "en_US"
      : locale === "de"
      ? "de_DE"
      : "fr_FR";

  return {
    title: {
      default: title,
      template: "%s | Sinersys",
    },
    description,
    keywords: [
      "motore elettrico",
      "six phase motor",
      "APWEC",
      "energia rinnovabile",
      "Sinersys",
      "motore a 6 fasi",
      "generatore energia rinnovabile",
      "energia continua",
      "motore elettrico innovativo",
      "brevetto italiano energia",
      "generatore energia",
      "generatore verde",
      "energia verde",
      "green",
      "green energy",
      "six phase electric motor",
      "wave energy converter",
      "APWEC technology",
      "renewable energy",
      "renewable energy generator",
      "Italian clean energy startup",
      "perpetual wave generator",
      "Sechs Phasen Motor",
      "Wellenenergie Konverter",
      "Erneuerbare Energie Italien",
      "innovativer Elektromotor",
      "Meeresenergie",
      "moteur hexaphasé",
      "convertisseur énergie des vagues",
      "énergie renouvelable",
      "startup italienne énergie",
      "moteur électrique innovant",
      "industry partner renewable energy",
      "clean tech manufacturing partner",
      "APWEC commercialization",
      "licenza industriale energia rinnovabile",
    ],
    authors: [{ name: "Sinersys" }],
    creator: "Sinersys",
    metadataBase: new URL("https://www.sinersys.it"),
    openGraph: {
      type: "website",
      url: `https://www.sinersys.it/${locale}`,
      locale: ogLocale,
      alternateLocale: ["it_IT", "en_US", "de_DE", "fr_FR"].filter(
        (l) => l !== ogLocale
      ),
      title,
      description,
      siteName: "Sinersys",
      images: [
        { url: "/og-image.jpg", width: 1200, height: 630, alt: "Sinersys" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.sinersys.it/${locale}`,
      languages: {
        it: "https://www.sinersys.it/it",
        en: "https://www.sinersys.it/en",
        de: "https://www.sinersys.it/de",
        fr: "https://www.sinersys.it/fr",
        "x-default": "https://www.sinersys.it/it",
      },
    },
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32" },
        { url: "/favicon-16x16.png", sizes: "16x16" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
  };
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sinersys",
  url: "https://www.sinersys.it",
  logo: "https://www.sinersys.it/full-logo-sinersys.png",
  description:
    "Ricerca e Sviluppo di tecnologie per nuove frontiere energetiche come APWEC e motore a 6 fasi.",
  foundingDate: "2020",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "info@sinersys.it",
    availableLanguage: ["Italian", "English", "German", "French"],
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "IT",
    streetAddress: "Via della Zecca 1", // via e numero civico reali
    addressLocality: "Bologna", // città
    addressRegion: "Bologna", // provincia/regione
    postalCode: "40121",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 44.4971897,
    longitude: 11.3316031,
  },
  sameAs: ["https://www.linkedin.com/company/sinersys-italia"],
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta name="next-size-adjust" content="" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link
          rel="preload"
          href="/font/eurostile-extended-regular/eurostile-extended-regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'analytics_storage':  'denied',
                'ad_storage':         'denied',
                'ad_user_data':       'denied',
                'ad_personalization': 'denied',
                'wait_for_update':    500
              });
            `,
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4M192B0GEZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4M192B0GEZ');
          `}
        </Script>
      </head>
      <body
        className={`
          antialiased pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] h-[100vh] h-[100dvh] h-[100lvh]
        `}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:text-black focus:p-2"
          title="skip to main content"
        >
          Skip to main content
        </a>

        <MotionProvider>
          <LandscapeBlock />
          <Providers>
            <NextIntlClientProvider>
              <LenisProvider>
                {children}
                <CookieBanner />
              </LenisProvider>
            </NextIntlClientProvider>
          </Providers>
        </MotionProvider>
      </body>
    </html>
  );
}
