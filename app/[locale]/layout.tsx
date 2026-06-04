import type { Metadata } from "next";
import {NextIntlClientProvider} from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../i18n/routing';
import "../globals.css";
import { Providers } from "../providers"; 
import LandscapeBlock from "../components/LandscapeBlock";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "homepage",
  });

  const title = "Sinersys — New Energy Frontiers";

  const description =
    t("slide0.subtitle")
      .replace(/\n/g, " ")
      .trim();

  const ogLocale =
  locale === 'it' ? 'it_IT' :
  locale === 'en' ? 'en_US' :
  locale === 'de' ? 'de_DE' : 'fr_FR';

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
    ],

    authors: [{ name: "Sinersys" }],
    creator: "Sinersys",

    metadataBase: new URL("https://sinersys.it"),

    openGraph: {
      type: 'website',
      locale: ogLocale,
      alternateLocale: ['it_IT', 'en_US', 'de_DE', 'fr_FR'].filter(l => l !== ogLocale),
      title,
      description,
      siteName: 'Sinersys',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Sinersys' }],
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
      canonical: `https://sinersys.it/${locale}`,
      languages: {
        'it':        'https://sinersys.it/it',
        'en':        'https://sinersys.it/en',
        'de':        'https://sinersys.it/de',
        'fr':        'https://sinersys.it/fr',
        'x-default': 'https://sinersys.it/en',
      }
    },
    icons: {
      icon: [{ url: "/favicon-32x32.png", sizes: "32x32" }, { url: "/favicon-16x16.png", sizes: "16x16" }],
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

export default async function RootLayout({children, params}: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8"/>
        <meta name="next-size-adjust" content=""/>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, viewport-fit=cover" 
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preload" href="/font/Eurostile Extended Regular/Eurostile Extended Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body
        className={`
          antialiased pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] h-[100vh] h-[100dvh] h-[100lvh]
        `}
      >
        <LandscapeBlock />
        <Providers>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}